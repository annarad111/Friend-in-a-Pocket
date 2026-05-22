/**
 * Real astronomical natal chart calculations using astronomy-engine (DE421 ephemeris).
 * Geocoding via OpenStreetMap Nominatim (free, no API key).
 * Timezone lookup via geo-tz (offline, no API key).
 *
 * Sun sign:   ecliptic longitude of the Sun at birth
 * Moon sign:  ecliptic longitude of the Moon at birth
 * Ascendant:  ecliptic degree rising on the Eastern horizon at birth time + location
 *
 * Birth time is treated as LOCAL time at the birth location and converted to UTC.
 */

import * as Astronomy from 'astronomy-engine';
import { find as findTimezone } from 'geo-tz';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

export type ZodiacSign = (typeof SIGNS)[number];

/** Ecliptic longitude (0–360) → zodiac sign name */
function lonToSign(lon: number): ZodiacSign {
  const normalized = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(normalized / 30)];
}

/** Degrees → radians */
const rad = (d: number) => (d * Math.PI) / 180;
/** Radians → degrees */
const deg = (r: number) => (r * 180) / Math.PI;

// ─── Geocoding ────────────────────────────────────────────────────────────────

export type GeoLocation = { lat: number; lon: number; displayName: string };

export async function geocodeCity(cityQuery: string): Promise<GeoLocation | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityQuery)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'FriendInAPocket/1.0 (personal wellness app)',
        'Accept-Language': 'en',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    if (!data || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

// ─── Calculations ─────────────────────────────────────────────────────────────

/** Sun sign from birth date (and optional time) */
export function calcSunSign(date: Date): ZodiacSign {
  const sun = Astronomy.SunPosition(date);
  return lonToSign(sun.elon);
}

/** Moon sign from birth date + time (time matters — Moon moves ~13°/day) */
export function calcMoonSign(date: Date): ZodiacSign {
  const moonVec = Astronomy.GeoMoon(date);
  const moonEcl = Astronomy.Ecliptic(moonVec);
  return lonToSign(moonEcl.elon);
}

/**
 * Ascendant (Rising sign) from birth date, time, and geographic location.
 *
 * Formula (standard):
 *   LST = (GMST_hours + lon/15) * 15   [in degrees]
 *   ASC = atan2(cos(LST), -(sin(ε)*tan(φ) + cos(ε)*sin(LST)))
 *
 * where ε = obliquity of ecliptic ≈ 23.4397°, φ = latitude
 */
export function calcAscendant(date: Date, latDeg: number, lonDeg: number): ZodiacSign {
  const gmstHours = Astronomy.SiderealTime(date);

  // Local Sidereal Time in degrees
  const lstDeg = ((gmstHours * 15 + lonDeg) % 360 + 360) % 360;
  const lstRad = rad(lstDeg);

  const epsilon = rad(23.4397); // mean obliquity, J2000
  const latRad = rad(latDeg);

  const y = Math.cos(lstRad);
  const x = -(Math.sin(epsilon) * Math.tan(latRad) + Math.cos(epsilon) * Math.sin(lstRad));

  let ascDeg = deg(Math.atan2(y, x));
  ascDeg = ((ascDeg % 360) + 360) % 360;

  return lonToSign(ascDeg);
}

// ─── Full chart ───────────────────────────────────────────────────────────────

export type ChartPlacements = {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign | null;   // null if no birth time
  ascendant: ZodiacSign | null;  // null if no birth time + location
  location: GeoLocation | null;
};

/**
 * Convert a local birth datetime string to a UTC Date using the timezone
 * of the birth location. Falls back to treating input as UTC if no tz found.
 */
function localToUtc(dateStr: string, timeStr: string, timezone: string | null): Date {
  if (!timezone) {
    // Fallback: treat as UTC
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }
  try {
    // Use Intl to figure out the UTC offset for the given local time in the timezone
    // We compose an ISO string, then interpret it as that timezone
    const localIso = `${dateStr}T${timeStr}:00`;

    // Get the offset in minutes by formatting a date in both UTC and local tz
    const testDate = new Date(`${dateStr}T${timeStr}:00Z`); // pretend UTC temporarily
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
    // Parse the local time displayed in the target timezone for this "fake" UTC date
    const parts = formatter.formatToParts(testDate);
    const p = Object.fromEntries(parts.filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
    const tzLocalIso = `${p.year}-${p.month}-${p.day}T${p.hour === '24' ? '00' : p.hour}:${p.minute}:${p.second}Z`;
    const tzDate = new Date(tzLocalIso);

    // Offset = difference between fake-UTC and what the timezone thinks it is
    const offsetMs = testDate.getTime() - tzDate.getTime();

    // Apply the offset to turn the "local" time into real UTC
    const localDate = new Date(`${localIso}Z`); // treat localIso as UTC naively
    return new Date(localDate.getTime() + offsetMs);
  } catch {
    return new Date(`${dateStr}T${timeStr}:00Z`);
  }
}

/**
 * Given birth data (date required; time + location optional),
 * return the real astronomical placements.
 */
export async function calculatePlacements(opts: {
  date: string;      // YYYY-MM-DD
  time?: string;     // HH:MM  (local time at birth location)
  location?: string; // city name
}): Promise<ChartPlacements> {
  const hasTime = !!opts.time;
  const hasLocation = !!opts.location;

  let location: GeoLocation | null = null;
  let timezone: string | null = null;

  // Geocode first so we have coordinates for timezone lookup
  if (hasLocation) {
    location = await geocodeCity(opts.location!);
    if (location) {
      const tzResult = findTimezone(location.lat, location.lon);
      timezone = tzResult[0] ?? null;
    }
  }

  // Build the UTC Date — converts local birth time using the birth location's timezone
  let date: Date;
  if (hasTime) {
    date = localToUtc(opts.date, opts.time!, timezone);
  } else {
    // No time: use noon UTC (minimises sign-boundary errors for sun sign)
    date = new Date(`${opts.date}T12:00:00Z`);
  }

  const sunSign = calcSunSign(date);
  const moonSign = hasTime ? calcMoonSign(date) : null;
  const ascendant = (hasTime && location)
    ? calcAscendant(date, location.lat, location.lon)
    : null;

  return { sunSign, moonSign, ascendant, location };
}
