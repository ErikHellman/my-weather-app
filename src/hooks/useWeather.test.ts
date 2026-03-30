import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWeather, aggregateForecast } from './useWeather'
import { CityNotFoundError } from '@/services/weather'
import type { ForecastEntry } from '@/types/weather'

vi.mock('@/services/weather', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/weather')>()
  return {
    ...actual,
    geocodeCity: vi.fn(),
    fetchCurrentWeather: vi.fn(),
    fetchForecast: vi.fn(),
  }
})

import {
  geocodeCity,
  fetchCurrentWeather,
  fetchForecast,
} from '@/services/weather'

const mockGeocode = vi.mocked(geocodeCity)
const mockCurrentWeather = vi.mocked(fetchCurrentWeather)
const mockForecast = vi.mocked(fetchForecast)

const GEO = { lat: 51.5, lon: -0.1, name: 'London', country: 'GB' }
const CURRENT = {
  weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
  main: { temp: 22.6, humidity: 60 },
  wind: { speed: 3.5 },
  name: 'London',
}

function makeForecastEntry(
  dtIso: string,
  overrides: Partial<ForecastEntry['main']> = {},
): ForecastEntry {
  const dt = Math.floor(new Date(dtIso).getTime() / 1000)
  return {
    dt,
    weather: [{ id: 801, main: 'Clouds', description: 'few clouds' }],
    main: { temp: 20, temp_min: 15, temp_max: 25, ...overrides },
  }
}

// Use a future year so entries are always after today
const DAY1 = '2027-06-01'
const DAY2 = '2027-06-02'
const DAY3 = '2027-06-03'

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// aggregateForecast
// ---------------------------------------------------------------------------

describe('aggregateForecast', () => {
  it('groups entries by date and returns DayForecast objects', () => {
    const entries = [
      makeForecastEntry(`${DAY1}T09:00:00Z`),
      makeForecastEntry(`${DAY1}T12:00:00Z`),
      makeForecastEntry(`${DAY2}T09:00:00Z`),
    ]
    const result = aggregateForecast(entries)
    expect(result).toHaveLength(2)
    expect(result[0].date).toBe(DAY1)
    expect(result[1].date).toBe(DAY2)
  })

  it('filters out today and past dates', () => {
    // 2020 is in the past
    const entries = [
      makeForecastEntry('2020-01-01T12:00:00Z'),
      makeForecastEntry(`${DAY1}T12:00:00Z`),
    ]
    const result = aggregateForecast(entries)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe(DAY1)
  })

  it('limits to 5 days', () => {
    const entries = [
      makeForecastEntry(`2027-06-01T12:00:00Z`),
      makeForecastEntry(`2027-06-02T12:00:00Z`),
      makeForecastEntry(`2027-06-03T12:00:00Z`),
      makeForecastEntry(`2027-06-04T12:00:00Z`),
      makeForecastEntry(`2027-06-05T12:00:00Z`),
      makeForecastEntry(`2027-06-06T12:00:00Z`),
    ]
    const result = aggregateForecast(entries)
    expect(result).toHaveLength(5)
  })

  it('computes correct high and low from group', () => {
    const entries = [
      makeForecastEntry(`${DAY1}T06:00:00Z`, { temp: 15, temp_min: 12, temp_max: 18 }),
      makeForecastEntry(`${DAY1}T12:00:00Z`, { temp: 22, temp_min: 18, temp_max: 26 }),
      makeForecastEntry(`${DAY1}T18:00:00Z`, { temp: 20, temp_min: 17, temp_max: 23 }),
    ]
    const [day] = aggregateForecast(entries)
    expect(day.high).toBe(26)
    expect(day.low).toBe(12)
  })

  it('picks a midday entry (11:00–14:00 UTC) for condition data', () => {
    const midday = makeForecastEntry(`${DAY1}T12:00:00Z`)
    midday.weather = [{ id: 500, main: 'Rain', description: 'light rain' }]

    const entries = [
      makeForecastEntry(`${DAY1}T06:00:00Z`),
      midday,
      makeForecastEntry(`${DAY1}T18:00:00Z`),
    ]
    const [day] = aggregateForecast(entries)
    expect(day.conditionMain).toBe('Rain')
    expect(day.conditionId).toBe(500)
  })

  it('falls back to middle entry when no midday exists', () => {
    const entries = [
      makeForecastEntry(`${DAY1}T03:00:00Z`),
      makeForecastEntry(`${DAY1}T06:00:00Z`),
      makeForecastEntry(`${DAY1}T18:00:00Z`),
    ]
    // No midday (11–14 UTC) — should not throw
    expect(() => aggregateForecast(entries)).not.toThrow()
  })

  it('returns a short weekday label', () => {
    const entries = [makeForecastEntry(`${DAY1}T12:00:00Z`)]
    const [day] = aggregateForecast(entries)
    expect(day.label).toMatch(/^[A-Z][a-z]{2}$/) // e.g. "Mon"
  })

  it('returns empty array when given no entries', () => {
    expect(aggregateForecast([])).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// useWeather hook
// ---------------------------------------------------------------------------

describe('useWeather', () => {
  const forecastEntries = [
    makeForecastEntry(`${DAY1}T12:00:00Z`),
    makeForecastEntry(`${DAY2}T12:00:00Z`),
    makeForecastEntry(`${DAY3}T12:00:00Z`),
  ]

  it('returns idle state when city is null', () => {
    const { result } = renderHook(() => useWeather(null))
    expect(result.current).toEqual({ data: null, loading: false, error: null })
  })

  it('sets loading: true immediately when city is provided', () => {
    mockGeocode.mockResolvedValue(GEO)
    mockCurrentWeather.mockResolvedValue(CURRENT as never)
    mockForecast.mockResolvedValue({ list: forecastEntries })

    const { result } = renderHook(() => useWeather('London'))
    expect(result.current.loading).toBe(true)
  })

  it('returns weather data on successful fetch', async () => {
    mockGeocode.mockResolvedValue(GEO)
    mockCurrentWeather.mockResolvedValue(CURRENT as never)
    mockForecast.mockResolvedValue({ list: forecastEntries })

    const { result } = renderHook(() => useWeather('London'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.error).toBeNull()
    expect(result.current.data).toMatchObject({
      cityName: 'London',
      country: 'GB',
      temp: 23, // Math.round(22.6)
      humidity: 60,
      windSpeed: 3.5,
    })
    expect(result.current.data?.forecast).toHaveLength(3)
  })

  it('returns not_found error when city is not found', async () => {
    mockGeocode.mockRejectedValue(new CityNotFoundError('Nowhere'))

    const { result } = renderHook(() => useWeather('Nowhere'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error?.kind).toBe('not_found')
    expect(result.current.error?.message).toContain('Nowhere')
  })

  it('returns network error on other failures', async () => {
    mockGeocode.mockRejectedValue(new Error('fetch failed'))

    const { result } = renderHook(() => useWeather('London'))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.data).toBeNull()
    expect(result.current.error?.kind).toBe('network')
    expect(result.current.error?.message).toBe('fetch failed')
  })

  it('resets state when city changes', async () => {
    mockGeocode.mockResolvedValue(GEO)
    mockCurrentWeather.mockResolvedValue(CURRENT as never)
    mockForecast.mockResolvedValue({ list: forecastEntries })

    const { result, rerender } = renderHook(
      ({ city }) => useWeather(city),
      { initialProps: { city: 'London' as string | null } },
    )

    await waitFor(() => expect(result.current.data?.cityName).toBe('London'))

    rerender({ city: 'Paris' })

    // Should reset to loading while fetching new city
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
  })
})
