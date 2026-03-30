import { useState, useEffect } from 'react'
import type { WeatherData, DayForecast, ForecastEntry } from '@/types/weather'
import {
  geocodeCity,
  fetchCurrentWeather,
  fetchForecast,
  CityNotFoundError,
} from '@/services/weather'

export type WeatherErrorKind = 'not_found' | 'network'

export interface WeatherState {
  data: WeatherData | null
  loading: boolean
  error: { kind: WeatherErrorKind; message: string } | null
}

export function useWeather(city: string | null): WeatherState {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!city) return

    let cancelled = false
    setState({ data: null, loading: true, error: null })

    async function load() {
      try {
        const geo = await geocodeCity(city!)
        const [current, forecastRaw] = await Promise.all([
          fetchCurrentWeather(geo.lat, geo.lon),
          fetchForecast(geo.lat, geo.lon),
        ])

        const forecast = aggregateForecast(forecastRaw.list)

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              cityName: geo.name,
              country: geo.country,
              temp: Math.round(current.main.temp),
              conditionId: current.weather[0].id,
              conditionMain: current.weather[0].main,
              description: current.weather[0].description,
              humidity: current.main.humidity,
              windSpeed: current.wind.speed,
              forecast,
            },
          })
        }
      } catch (err) {
        if (!cancelled) {
          const kind: WeatherErrorKind =
            err instanceof CityNotFoundError ? 'not_found' : 'network'
          setState({
            loading: false,
            data: null,
            error: {
              kind,
              message: err instanceof Error ? err.message : 'Unknown error',
            },
          })
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [city])

  return state
}

export function aggregateForecast(entries: ForecastEntry[]): DayForecast[] {
  const byDate = new Map<string, ForecastEntry[]>()

  for (const entry of entries) {
    const date = new Date(entry.dt * 1000).toISOString().slice(0, 10)
    const group = byDate.get(date) ?? []
    group.push(entry)
    byDate.set(date, group)
  }

  const today = new Date().toISOString().slice(0, 10)

  return Array.from(byDate.entries())
    .filter(([date]) => date > today)
    .slice(0, 5)
    .map(([date, group]) => {
      const high = Math.round(Math.max(...group.map((e) => e.main.temp_max)))
      const low = Math.round(Math.min(...group.map((e) => e.main.temp_min)))
      const midday =
        group.find((e) => {
          const h = new Date(e.dt * 1000).getUTCHours()
          return h >= 11 && h <= 14
        }) ?? group[Math.floor(group.length / 2)]
      const label = new Intl.DateTimeFormat('en', { weekday: 'short' }).format(
        new Date(`${date}T12:00:00`),
      )
      return {
        date,
        label,
        high,
        low,
        conditionId: midday.weather[0].id,
        conditionMain: midday.weather[0].main,
        description: midday.weather[0].description,
      } satisfies DayForecast
    })
}
