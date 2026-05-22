"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Correção para ícones padrão do Leaflet quebrados no empacotamento do Webpack/Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente utilitário para mover dinamicamente o centro do mapa com suavidade
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13, {
      animate: true,
      duration: 1.5
    });
  }, [center, map]);
  return null;
}

interface SaaSMapProps {
  tenants: any[];
  selectedTenant: any;
  onSelectTenant: (tenant: any) => void;
  isLight?: boolean;
}

export default function SaaSMap({ tenants, selectedTenant, onSelectTenant, isLight = false }: SaaSMapProps) {
  // Centro inicial padronizado (Sudeste do Brasil)
  const defaultCenter: [number, number] = [-22.9068, -43.1729]; // Rio de Janeiro
  const mapCenter: [number, number] = selectedTenant 
    ? [selectedTenant.lat, selectedTenant.lng] 
    : defaultCenter;

  // URL do mapa dinâmica baseada no tema claro/escuro
  const tileUrl = isLight 
    ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <div className="w-full h-full relative z-0 rounded-[2rem] overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80 shadow-inner">
      <MapContainer 
        center={defaultCenter} 
        zoom={6} 
        className="w-full h-full"
      >
        <TileLayer
          key={isLight ? "light-map" : "dark-map"} // Força recriação da camada do mapa ao alternar tema
          url={tileUrl}
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {tenants.map((t) => (
          <Marker 
            key={t.id} 
            position={[t.lat, t.lng]} 
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectTenant(t)
            }}
          >
            <Popup>
              <div className="p-2 font-sans text-zinc-900 dark:text-white space-y-1 bg-white dark:bg-zinc-950 rounded-lg">
                <span className="text-[9px] font-black uppercase text-[#fd9602] tracking-wider block">
                  Plano {t.plano}
                </span>
                <h4 className="text-xs font-black block">{t.nome}</h4>
                <p className="text-[10px] text-zinc-500 font-semibold block">{t.proprietario}</p>
                <span className="text-[9px] text-zinc-400 block">{t.cidade} - {t.estado}</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedTenant && <ChangeMapView center={mapCenter} />}
      </MapContainer>
    </div>
  );
}
