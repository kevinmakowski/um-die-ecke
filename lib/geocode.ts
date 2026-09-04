export interface GeoResult {
  lat: number;
  lng: number;
  placeName: string;
}

// Nutzt die kostenlose, kostenfreie Zippopotam-API, um eine deutsche PLZ
// in Koordinaten + Ortsnamen umzuwandeln. Kein API-Key nötig.
export async function geocodePLZ(plz: string): Promise<GeoResult | null> {
  const trimmed = plz.trim();
  if (!/^\d{5}$/.test(trimmed)) return null;

  try {
    const res = await fetch(`https://api.zippopotam.us/de/${trimmed}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      placeName: place["place name"],
    };
  } catch {
    return null;
  }
}
