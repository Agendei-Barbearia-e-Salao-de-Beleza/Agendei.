"use client"

import { useRef, useEffect, useCallback } from "react"
import maplibregl from "maplibre-gl"
import type { Tenant } from "@/types"
import { MapPin } from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"

interface TenantMap3DProps {
  tenants: Tenant[]
  selectedTenant: Tenant | null
  onSelectTenant: (tenant: Tenant) => void
  isLight?: boolean
}

const DARK_STYLE = "https://tiles.openfreemap.org/styles/dark"
const LIGHT_STYLE = "https://tiles.openfreemap.org/styles/positron"

const DEFAULT_CENTER: [number, number] = [-47.9292, -15.7801]
const DEFAULT_ZOOM = 4

type MarkerElements = { pin: HTMLElement; tip: HTMLElement; marker: maplibregl.Marker }

export function TenantMap3D({ tenants, selectedTenant, onSelectTenant, isLight }: TenantMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerMapRef = useRef<Map<string, MarkerElements>>(new Map())

  const tenantsWithCoords = tenants.filter((t) => t.lat !== null && t.lng !== null)

  const clearMarkers = useCallback(() => {
    markerMapRef.current.forEach(({ marker }) => marker.remove())
    markerMapRef.current.clear()
  }, [])

  const setMarkerSelected = useCallback((tenantId: string, selected: boolean) => {
    const els = markerMapRef.current.get(tenantId)
    if (!els) return
    if (selected) {
      els.pin.style.background = "#fff"
      els.pin.style.border = "3px solid #fd9602"
      els.pin.style.boxShadow = "0 0 0 4px rgba(253,150,2,0.25), 0 8px 30px rgba(253,150,2,0.6)"
      els.pin.style.transform = "rotate(-45deg) scale(1.35)"
      els.tip.style.background = "#fff"
    } else {
      els.pin.style.background = "#fd9602"
      els.pin.style.border = "3px solid #fff"
      els.pin.style.boxShadow = "0 4px 20px rgba(253,150,2,0.5)"
      els.pin.style.transform = "rotate(-45deg) scale(1)"
      els.tip.style.background = "#fd9602"
    }
  }, [])

  const addMarkers = useCallback((map: maplibregl.Map) => {
    clearMarkers()

    tenantsWithCoords.forEach((tenant) => {
      const el = document.createElement("div")
      el.style.cssText = `
        width: 36px; height: 48px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
      `

      const pin = document.createElement("div")
      pin.style.cssText = `
        width: 32px; height: 32px;
        background: #fd9602;
        border: 3px solid #fff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 20px rgba(253,150,2,0.5);
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.15s ease;
        flex-shrink: 0;
      `

      const tip = document.createElement("div")
      tip.style.cssText = `
        width: 3px; height: 10px;
        background: #fd9602;
        border-radius: 0 0 3px 3px;
        margin-top: -4px;
        transition: background 0.15s ease;
      `

      el.appendChild(pin)
      el.appendChild(tip)

      el.addEventListener("mouseenter", () => {
        if (selectedTenant?.id !== tenant.id) {
          pin.style.transform = "rotate(-45deg) scale(1.15)"
          pin.style.boxShadow = "0 8px 30px rgba(253,150,2,0.7)"
        }
      })
      el.addEventListener("mouseleave", () => {
        if (selectedTenant?.id !== tenant.id) {
          pin.style.transform = "rotate(-45deg) scale(1)"
          pin.style.boxShadow = "0 4px 20px rgba(253,150,2,0.5)"
        }
      })

      const popup = new maplibregl.Popup({
        offset: [0, -52],
        closeButton: false,
        className: "tenant-popup",
        maxWidth: "220px",
      }).setHTML(`
        <div style="
          background: #09090b;
          border: 1px solid #27272a;
          border-radius: 1rem;
          padding: 12px 14px;
          min-width: 180px;
          font-family: Inter, system-ui, sans-serif;
        ">
          <p style="color:#fd9602;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 4px">${tenant.plano || "FREE"}</p>
          <p style="color:#fff;font-size:13px;font-weight:900;margin:0 0 2px">${tenant.nome}</p>
          <p style="color:#71717a;font-size:11px;margin:0">${tenant.proprietario_nome || ""}</p>
          <p style="color:#52525b;font-size:10px;margin:4px 0 0">${tenant.endereco || ""}</p>
        </div>
      `)

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([tenant.lng!, tenant.lat!])
        .setPopup(popup)
        .addTo(map)

      el.addEventListener("click", () => onSelectTenant(tenant))

      markerMapRef.current.set(tenant.id, { pin, tip, marker })
    })

    // Reaplicar estado selecionado se já havia um tenant selecionado
    if (selectedTenant?.id) {
      setMarkerSelected(selectedTenant.id, true)
    }
  }, [tenantsWithCoords, clearMarkers, onSelectTenant, selectedTenant, setMarkerSelected])

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapOptions: any = {
      container: containerRef.current,
      style: isLight ? LIGHT_STYLE : DARK_STYLE,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 45,
      bearing: -10,
      antialias: true,
    }
    const map = new maplibregl.Map(mapOptions)
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right")
    map.on("load", () => addMarkers(map))
    mapRef.current = map

    return () => {
      clearMarkers()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Recriar marcadores quando lista de tenants muda
  useEffect(() => {
    if (!mapRef.current) return
    addMarkers(mapRef.current)
  }, [addMarkers])

  // Atualizar estilo quando tema muda
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setStyle(isLight ? LIGHT_STYLE : DARK_STYLE)
    mapRef.current.once("styledata", () => addMarkers(mapRef.current!))
  }, [isLight, addMarkers])

  // Destacar marcador selecionado, voar até ele e abrir popup
  useEffect(() => {
    if (!mapRef.current) return

    // Desselecionar todos
    markerMapRef.current.forEach((_, id) => setMarkerSelected(id, false))

    if (!selectedTenant?.lat || !selectedTenant?.lng) return

    // Destacar o selecionado
    setMarkerSelected(selectedTenant.id, true)

    // Abrir popup do marcador selecionado
    const els = markerMapRef.current.get(selectedTenant.id)
    if (els) {
      // Fecha outros popups abertos
      markerMapRef.current.forEach(({ marker }, id) => {
        if (id !== selectedTenant.id) marker.getPopup()?.remove()
      })
      if (!els.marker.getPopup()?.isOpen()) {
        els.marker.togglePopup()
      }
    }

    // Voar até a localização
    mapRef.current.flyTo({
      center: [selectedTenant.lng, selectedTenant.lat],
      zoom: 14,
      pitch: 55,
      bearing: -15,
      duration: 1600,
      essential: true,
    })
  }, [selectedTenant, setMarkerSelected])

  if (tenantsWithCoords.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-3xl bg-zinc-900 border border-zinc-800">
        <EmptyState
          icon={MapPin}
          title="Aguardando geocodificação..."
          description="Os endereços estão sendo convertidos em coordenadas. O mapa aparecerá em instantes."
          isLight={isLight}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-zinc-800">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
