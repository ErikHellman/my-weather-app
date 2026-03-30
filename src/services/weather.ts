import type {
  CurrentWeatherResponse,
  ForecastResponse,
  GeoResult,
} from '@/types/weather'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string
const GEO_BASE = 'https://api.openweathermap.org/geo/1.0'
const WEATHER_BASE = 'https://api.openweathermap.org/data/2.5'

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export class CityNotFoundError extends Error {
  constructor(city: string) {
    super(`City not found: "${city}"`)
    this.name = 'CityNotFoundError'
  }
}

export async function geocodeCity(city: string): Promise<GeoResult> {
  const url = `${GEO_BASE}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  const results = await fetchJSON<GeoResult[]>(url)
  if (results.length === 0) {
    throw new CityNotFoundError(city)
  }
  return results[0]
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
): Promise<CurrentWeatherResponse> {
  const url = `${WEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  return fetchJSON<CurrentWeatherResponse>(url)
}

export async function fetchForecast(
  lat: number,
  lon: number,
): Promise<ForecastResponse> {
  const url = `${WEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&cnt=40&appid=${API_KEY}`
  return fetchJSON<ForecastResponse>(url)
}
