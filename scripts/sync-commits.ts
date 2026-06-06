/**
 * Script: sync-commits.ts
 * Sincroniza os commits mais recentes de mobile/ e manager/ com a tabela
 * pipeline_commits no Supabase, preservando os status já atribuídos.
 *
 * Uso: npx ts-node scripts/sync-commits.ts
 * Ou:  npx tsx scripts/sync-commits.ts
 *
 * Requer: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
 * (ou edite as constantes abaixo para uso local)
 */

import { execSync } from "node:child_process"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vpalasmdcxnhpsbwmsqq.supabase.co"
// Usar service role para ignorar RLS neste script administrativo
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

const REPO_ROOT = path.resolve(__dirname, "..")
const APPS: Array<"mobile" | "manager"> = ["mobile", "manager"]
const COMMIT_LIMIT = 20

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface RawCommit {
  hash: string
  fullHash: string
  message: string
  author: string
  date: string
  app: "mobile" | "manager"
}

function readGitLog(app: "mobile" | "manager"): RawCommit[] {
  const cmd = `git -C "${REPO_ROOT}" log -n ${COMMIT_LIMIT} --pretty=format:"%H|%s|%an|%aI" -- "${app}/"`
  try {
    const stdout = execSync(cmd, { timeout: 10_000, encoding: "utf-8" })
    return stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [fullHash, message, author, date] = line.split("|")
        return {
          hash: fullHash.slice(0, 7),
          fullHash,
          message: message ?? "",
          author: author ?? "",
          date: date ?? "",
          app,
        }
      })
  } catch (err) {
    console.error(`[sync-commits] Erro ao ler git log de ${app}:`, err)
    return []
  }
}

async function syncApp(app: "mobile" | "manager", commits: RawCommit[]) {
  if (!commits.length) {
    console.log(`[sync-commits] Nenhum commit encontrado para ${app}`)
    return
  }

  const hashes = commits.map((c) => c.hash)

  // Buscar status já existentes para não sobrescrever aprovações manuais
  const { data: existing } = await supabase
    .from("pipeline_commits")
    .select("hash, status")
    .eq("app", app)
    .in("hash", hashes)

  const existingMap = new Map<string, string>(
    (existing ?? []).map((r: { hash: string; status: string }) => [r.hash, r.status])
  )

  const records = commits.map((c) => ({
    hash: c.hash,
    message: c.message,
    author: c.author,
    committed_at: c.date,
    app: c.app,
    // Preserva status já definido; novos commits entram como PENDING
    status: existingMap.get(c.hash) ?? "PENDING",
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from("pipeline_commits")
    .upsert(records, { onConflict: "hash" })

  if (error) {
    console.error(`[sync-commits] Erro ao fazer upsert de ${app}:`, error.message)
  } else {
    console.log(`[sync-commits] ${app}: ${records.length} commits sincronizados`)
  }
}

async function main() {
  console.log("[sync-commits] Iniciando sincronização...\n")

  for (const app of APPS) {
    const commits = readGitLog(app)
    await syncApp(app, commits)
  }

  console.log("\n[sync-commits] Concluído.")
}

main().catch((err) => {
  console.error("[sync-commits] Erro fatal:", err)
  process.exit(1)
})
