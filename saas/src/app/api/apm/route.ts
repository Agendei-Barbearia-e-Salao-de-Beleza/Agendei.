import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import admin from "@/lib/firebaseAdmin"

const BACKEND_URL = process.env.BACKEND_URL || "https://agendei-backend.onrender.com"

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vpalasmdcxnhpsbwmsqq.supabase.co").trim()
const SUPABASE_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ""
).trim()

async function checkBackend() {
  const start = Date.now()
  try {
    const res = await fetch(`${BACKEND_URL}/status`, {
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    })
    const latencyMs = Date.now() - start
    if (!res.ok) return { status: "DEGRADED" as const, latencyMs, error: `HTTP ${res.status}` }
    return { status: "OPERATIONAL" as const, latencyMs, error: null }
  } catch (err) {
    const latencyMs = Date.now() - start
    const msg = err instanceof Error ? err.message : "timeout"
    return { status: "OFFLINE" as const, latencyMs, error: msg }
  }
}

async function checkDatabase() {
  const start = Date.now()
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { error } = await client.from("estabelecimentos").select("id", { count: "exact", head: true })
    const latencyMs = Date.now() - start
    if (error) return { status: "DEGRADED" as const, latencyMs, error: error.message }
    return { status: "OPERATIONAL" as const, latencyMs, error: null }
  } catch (err) {
    const latencyMs = Date.now() - start
    return { status: "OFFLINE" as const, latencyMs, error: String(err) }
  }
}

async function checkFirebase() {
  const start = Date.now()

  if (!admin.apps.length) {
    return {
      status: "DEGRADED" as const,
      latencyMs: Date.now() - start,
      error: "Firebase Admin SDK não inicializado — verifique FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY no .env.local",
    }
  }

  try {
    // Dry-run: valida credenciais FCM sem enviar mensagem real
    await admin.messaging().send(
      { topic: "apm-health-check", notification: { title: "APM ping" } },
      true // dryRun
    )
    return { status: "OPERATIONAL" as const, latencyMs: Date.now() - start, error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // "Requested entity was not found" significa que o SDK autenticou mas o tópico não existe — FCM está OK
    if (msg.includes("Requested entity was not found") || msg.includes("registration-token-not-registered")) {
      return { status: "OPERATIONAL" as const, latencyMs: Date.now() - start, error: null }
    }
    return {
      status: "DEGRADED" as const,
      latencyMs: Date.now() - start,
      error: msg,
    }
  }
}

export async function GET() {
  const [backend, database, firebase] = await Promise.all([
    checkBackend(),
    checkDatabase(),
    checkFirebase(),
  ])

  const now = new Date().toISOString()

  return NextResponse.json({
    backend:  { service: "Backend API",   ...backend,   lastChecked: now, uptimePercent: null },
    database: { service: "Supabase DB",   ...database,  lastChecked: now, uptimePercent: null },
    firebase: { service: "Firebase FCM",  ...firebase,  lastChecked: now, uptimePercent: null },
  })
}
