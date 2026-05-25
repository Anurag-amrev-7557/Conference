import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet"
import * as L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { AppEvent } from "../../lib/websiteData"

function FitBounds({ events }: { events: AppEvent[] }) {
  const map = useMap()

  useEffect(() => {
    const coords = events
      .filter((e) => e.lat != null && e.lng != null)
      .map((e) => [e.lat!, e.lng!] as [number, number])

    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], animate: true })
    } else if (coords.length === 1) {
      map.setView(coords[0], 10, { animate: true })
    }
  }, [map, events])

  return null
}

function FlyToSelected({
  event,
}: {
  event: AppEvent | null
}) {
  const map = useMap()

  useEffect(() => {
    if (event?.lat != null && event?.lng != null) {
      map.flyTo([event.lat, event.lng], 11, { duration: 0.6 })
    }
  }, [map, event])

  return null
}

interface EventsMapProps {
  events: AppEvent[]
  activeTab: "Upcoming" | "Past"
  selectedEventId: string | null
  onEventClick: (event: AppEvent) => void
}

export function EventsMap({
  events,
  activeTab,
  selectedEventId,
  onEventClick,
}: EventsMapProps) {
  const activeEvents = useMemo(
    () =>
      events.filter(
        (e) => e.isPublished && e.status === activeTab && e.lat != null && e.lng != null,
      ),
    [events, activeTab],
  )

  const selectedEvent =
    activeEvents.find((e) => e.id === selectedEventId) ?? null

  const createMarkerIcon = (selected: boolean) =>
    L.divIcon({
      className: `technical-node-container${selected ? " events-marker--selected" : ""}`,
      html: `<div class="technical-node"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

  const defaultCenter: [number, number] =
    activeEvents.length > 0
      ? [activeEvents[0].lat!, activeEvents[0].lng!]
      : [37.5, -122]

  return (
    <div className="events-map">
      <MapContainer
        center={defaultCenter}
        zoom={activeEvents.length === 1 ? 10 : 4}
        scrollWheelZoom={false}
        className="z-0"
        zoomControl
        style={{ height: "100%", width: "100%", minHeight: "220px" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {activeEvents.map((event) => (
          <Marker
            key={event.id}
            position={[event.lat!, event.lng!]}
            icon={createMarkerIcon(event.id === selectedEventId)}
            eventHandlers={{
              click: () => onEventClick(event),
            }}
          />
        ))}
        <FitBounds events={activeEvents} />
        <FlyToSelected event={selectedEvent} />
      </MapContainer>
    </div>
  )
}

