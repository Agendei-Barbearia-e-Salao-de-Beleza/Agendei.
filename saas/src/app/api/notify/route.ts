import { NextRequest, NextResponse } from "next/server"
import admin from "@/lib/firebaseAdmin"

interface NotifyBody {
  // Enviar para um token específico OU para um tópico
  token?: string
  topic?: string
  title: string
  body: string
  // Dados extras passados ao app (ex: { type: "OTA_UPDATE", version: "1.2.0" })
  data?: Record<string, string>
}

export async function POST(request: NextRequest) {
  if (!admin.apps.length) {
    return NextResponse.json(
      { error: "Firebase Admin SDK não inicializado. Verifique as variáveis de ambiente." },
      { status: 503 }
    )
  }

  let body: NotifyBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 })
  }

  if (!body.title || !body.body) {
    return NextResponse.json({ error: "Campos 'title' e 'body' são obrigatórios" }, { status: 400 })
  }

  if (!body.token && !body.topic) {
    return NextResponse.json({ error: "Informe 'token' (dispositivo) ou 'topic' (broadcast)" }, { status: 400 })
  }

  try {
    const message: admin.messaging.Message = {
      notification: { title: body.title, body: body.body },
      ...(body.data ? { data: body.data } : {}),
      ...(body.token ? { token: body.token } : { topic: body.topic! }),
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    }

    const messageId = await admin.messaging().send(message)
    return NextResponse.json({ ok: true, messageId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
