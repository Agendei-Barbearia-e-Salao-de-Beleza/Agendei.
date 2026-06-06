import { NextRequest, NextResponse } from "next/server"
import { geocodeAddress } from "@/lib/geocoder"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")

  if (!address || address.trim().length < 3) {
    return NextResponse.json({ error: "Parâmetro address obrigatório" }, { status: 400 })
  }

  const coords = await geocodeAddress(address.trim())

  if (!coords) {
    return NextResponse.json(
      { error: "Endereço não encontrado", lat: null, lng: null },
      { status: 404 }
    )
  }

  return NextResponse.json({ lat: coords.lat, lng: coords.lng, error: null })
}
