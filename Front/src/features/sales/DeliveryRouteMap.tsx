import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Los servicios públicos son apropiados para pruebas, no para uso intensivo en producción.
type Point = [number, number];
const originAddress = 'Avenida Japón 1990, Córdoba Capital, Córdoba, Argentina';
const originLabel = 'TEKA · Avenida Japón 1990, Pasaje Giuliano, Córdoba';
const cache = new Map<string, Point>();
function candidates(address: string): string[] {
  // Piso, departamento, torre, unidad y referencias pertenecen al domicilio postal,
  // pero no a la búsqueda cartográfica. Nunca alteramos el dato del remito.
  const cleaned = address
    .replace(/\b(?:piso|dpto\.?|depto\.?|departamento|unidad|oficina|of\.?|torre|bloque|interno|int\.?)\s*(?:n[.º°o]*\s*)?[\w-]+/gi, ' ')
    .replace(/\s*[,;]\s*/g, ', ')
    .replace(/\s+/g, ' ').trim();
  const firstPart = cleaned.split(/\s+-\s+|,/)[0].trim();
  const streetAndNumber = firstPart.replace(/\s*\bCP\s*\w+/gi, '').trim();
  const normalized = streetAndNumber.replace(/^av\.?\s+/i, 'Avenida ');
  return [...new Set([
    `${normalized}, Córdoba Capital, Córdoba, Argentina`,
    `${normalized}, Córdoba, Argentina`,
    cleaned,
  ])].filter(Boolean);
}
async function geocode(address: string, signal: AbortSignal): Promise<Point> {
  const existing = cache.get(address);
  if (existing) return existing;
  for (const query of candidates(address)) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=3&countrycodes=ar&q=${encodeURIComponent(query)}`, { signal });
    if (!response.ok) throw new Error('El servicio de direcciones no está disponible.');
    const matches: { lat: string; lon: string; display_name: string }[] = await response.json();
    const cordoba = matches.find(x => /córdoba|cordoba/i.test(x.display_name));
    if (cordoba) {
      const point: Point = [Number(cordoba.lat), Number(cordoba.lon)];
      cache.set(address, point);
      return point;
    }
  }
  throw new Error('No se pudo ubicar con precisión este domicilio.');
}
function PickDestination({ enabled, onPick }: { enabled: boolean; onPick: (point: Point) => void }) {
  useMapEvents({ click(event) { if (enabled) onPick([event.latlng.lat, event.latlng.lng]); } });
  return null;
}
function FitRoute({ points }: { points: Point[] }) {
  const map = useMap();
  useEffect(() => { if (points.length > 1) map.fitBounds(new LatLngBounds(points), { padding: [30, 30] }); }, [map, points]);
  return null;
}
export function DeliveryRouteMap({ destination }: { destination: string }) {
  const [origin, setOrigin] = useState<Point | null>(null);
  const [end, setEnd] = useState<Point | null>(null);
  const [route, setRoute] = useState<Point[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setOrigin(null); setEnd(null); setRoute([]); setError(''); setLoading(true); setPicking(false);
    (async () => {
      try {
        // Secuencial para respetar el límite del geocodificador público.
        const start = await geocode(originAddress, controller.signal);
        if (controller.signal.aborted) return;
        setOrigin(start);
        const finish = await geocode(destination, controller.signal);
        if (controller.signal.aborted) return;
        setEnd(finish);
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${finish[1]},${finish[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('No se pudo calcular el recorrido.');
        const data = await response.json();
        const first = data.routes?.[0];
        if (!first) throw new Error('No se encontró una ruta para estos domicilios.');
        setRoute(first.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng] as Point));
        setDistance(first.distance / 1000); setDuration(first.duration / 60);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el mapa.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [destination]);
  useEffect(() => {
    if (!origin || !end || route.length || loading) return;
    const controller = new AbortController();
    (async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('No se pudo calcular el recorrido.');
        const data = await response.json();
        const first = data.routes?.[0];
        if (!first) throw new Error('No se encontró una ruta vial.');
        setRoute(first.geometry.coordinates.map(([lng, lat]: number[]) => [lat, lng] as Point));
        setDistance(first.distance / 1000); setDuration(first.duration / 60); setError('');
      } catch { if (!controller.signal.aborted) setError('No se pudo calcular la ruta vial.'); }
    })();
    return () => controller.abort();
  }, [origin, end, route.length, loading]);
  const points = route.length ? route : origin && end ? [origin, end] : [];
  const navigate = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originLabel)}&destination=${encodeURIComponent(candidates(destination)[0] || destination)}&travelmode=driving`;
  return <div className="teka-route-map-panel">
    <div className="teka-route-map-heading"><strong>Ruta de entrega</strong>{distance !== null && duration !== null && <span>{distance.toFixed(1)} km · {Math.round(duration)} min estimados</span>}</div>
    <div className="teka-route-map-canvas">
      <MapContainer center={origin ?? [-31.4201, -64.1888]} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <PickDestination enabled={picking} onPick={point => { setEnd(point); setRoute([]); setDistance(null); setDuration(null); setError(''); setPicking(false); }} />
        {origin && <Marker position={origin}><Tooltip permanent direction="top">Fábrica TEKA</Tooltip></Marker>}
        {end && <Marker position={end}><Tooltip permanent direction="top">Cliente</Tooltip></Marker>}
        {route.length > 0 && <Polyline positions={route} pathOptions={{ color: '#19714d', weight: 5 }} />}
        {points.length > 1 && <FitRoute points={points} />}
      </MapContainer>
      {loading && <div className="teka-route-map-status">Buscando domicilios y calculando recorrido…</div>}
    </div>
    {error && <div className="teka-route-map-error" role="status">{error} {origin && <button type="button" className="button secondary" onClick={() => setPicking(value => !value)}>{picking ? 'Cancelar selección' : 'Señalar destino en el mapa'}</button>}</div>}
    {picking && <p className="teka-route-map-hint">Hacé clic sobre la ubicación exacta del cliente. La selección es temporal y no modifica el domicilio registrado.</p>}
    <div className="teka-route-map-legend"><span><b>Origen:</b> {originLabel}</span><span><b>Destino:</b> {destination}</span></div>
    <a className="button secondary" href={navigate} target="_blank" rel="noopener noreferrer">Abrir navegación</a>
  </div>;
}
