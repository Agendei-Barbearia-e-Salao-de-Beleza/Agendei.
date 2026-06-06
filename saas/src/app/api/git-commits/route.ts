import { NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "node:util"
import path from "node:path"

const execAsync = promisify(exec)

// Raiz do repositório (um nível acima de saas/)
const REPO_ROOT = path.resolve(process.cwd(), "..")

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const app = searchParams.get("app") as "mobile" | "manager" | null

  if (!app || !["mobile", "manager"].includes(app)) {
    return NextResponse.json(
      { commits: [], error: 'Parâmetro "app" obrigatório: "mobile" ou "manager"' },
      { status: 400 }
    )
  }

  const gitCmd = `git -C "${REPO_ROOT}" log -n 15 --pretty=format:"%H|%s|%an|%aI" -- "${app}/"`

  try {
    const { stdout, stderr } = await execAsync(gitCmd, { timeout: 8000 })

    if (stderr && !stdout) {
      return NextResponse.json(
        { commits: [], error: `Erro ao ler histórico git: ${stderr.trim()}` },
        { status: 503 }
      )
    }

    const commits = stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, message, author, date] = line.split("|")
        return {
          hash: hash.slice(0, 7),
          fullHash: hash,
          message: message || "",
          author: author || "",
          date: date || "",
          app,
          status: "PENDING" as const,
        }
      })

    return NextResponse.json({ commits, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido"
    // git não está disponível neste ambiente (ex: Vercel serverless)
    return NextResponse.json(
      { commits: [], error: `Git não disponível neste ambiente: ${message}` },
      { status: 503 }
    )
  }
}
