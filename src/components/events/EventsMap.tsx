import { useEffect, useMemo } from "react"
import { Navigation } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import * as L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { AppEvent } from "../../lib/websiteData"

// Helper to auto-fit map to show all markers
function FitBounds({ events }: { events: AppEvent[] }) {
  const map = useMap()
  
  useEffect(() => {
    const coords = events
      .filter(e => e.lat && e.lng)
      .map(e => [e.lat!, e.lng!] as [number, number])
    
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords)
      map.fitBounds(bounds, { padding: [50, 50], animate: true })
    }
  }, [map, events])
  
  return null
}

interface EventsMapProps {
  events: AppEvent[]
  onEventClick?: (event: AppEvent) => void
}

export function EventsMap({ events, onEventClick }: EventsMapProps) {
  const activeEvents = useMemo(() => events.filter(e => e.lat && e.lng), [events])
  
  // Custom technical marker icon using stable global CSS
  const createMarkerIcon = () => {
    return L.divIcon({
      className: "technical-node-container",
      html: `
        <div class="node-pulse"></div>
        <div class="technical-node"></div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
  }

  return (
    <div className="relative w-full aspect-[16/10] rounded-[32px] overflow-hidden border border-border/40 shadow-alabaster bg-[#0a0a0b] group">
      
      <MapContainer 
        center={[30, 0]} 
        zoom={2} 
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        zoomControl={true}
        attributionControl={true}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Premium Minimalist Tiles - CartoDB Voyager (No Labels) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        />

        {/* Map Nodes (Live Markers) */}
        {activeEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat!, event.lng!]}
            icon={createMarkerIcon()}
            eventHandlers={{
              click: () => onEventClick && onEventClick(event)
            }}
          />
        ))}
        
        <FitBounds events={events} />
      </MapContainer>

      {/* Title Overlay */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-1 pointer-events-none">
         <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-[0.3em]">Geographic Nodes</span>
         <h4 className="text-white text-md font-serif italic">Global Synchronization</h4>
      </div>

      {/* Subtle indicator */}
      <div className="absolute bottom-6 right-6 z-[1000] flex items-center gap-2 pointer-events-none">
         <Navigation className="w-3 h-3 text-accent animate-pulse" />
         <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Tracking Live Nodes</span>
      </div>
      
      {/* Grid Pattern overlay - faint overlay for texture */}
      <div className="absolute inset-0 bg-grid-studio opacity-[0.02] pointer-events-none z-[500]" />
    </div>
  )
}
