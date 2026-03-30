import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  geocodeCity,
  fetchCurrentWeather,
  fetchForecast,
  CityNotFoundError,
} from './weather'

function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  } as Response)
}

beforeEach(() => {
  vi.stubEnv('VITE_WEATHER_API_KEY', 'test-key')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('CityNotFoundError', () => {
  it('has correct name and message', () => {
    const err = new CityNotFoundError('London')
    expect(err.name).toBe('CityNotFoundError')
    expect(err.message).toBe('City not found: "London"')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('geocodeCity', () => {
  it('returns the first geo result', async () => {
    const geoData = [{ lat: 51.5, lon: -0.1, name: 'London', country: 'GB' }]
    mockFetch(geoData)

    const result = await geocodeCity('London')
    expect(result).toEqual(geoData[0])
  })

  it('throws CityNotFoundError when results are empty', async () => {
    mockFetch([])

    const err = await geocodeCity('Nowhere').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(CityNotFoundError)
    expect((err as Error).message).toBe('City not found: "Nowhere"')
  })

  it('throws on non-ok HTTP response', async () => {
    mockFetch(null, false, 401)

    await expect(geocodeCity('London')).rejects.toThrow('API error: 401')
  })

  it('encodes the city name in the URL', async () => {
    const geoData = [{ lat: 48.8, lon: 2.3, name: 'Paris', country: 'FR' }]
    const spy = mockFetch(geoData)

    await geocodeCity('São Paulo')
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('São Paulo')),
    )
  })
})

describe('fetchCurrentWeather', () => {
  it('returns current weather data', async () => {
    const weatherData = {
      weather: [{ id: 800, main: 'Clear', description: 'clear sky' }],
      main: { temp: 22.4, humidity: 60 },
      wind: { speed: 3.5 },
      name: 'London',
    }
    mockFetch(weatherData)

    const result = await fetchCurrentWeather(51.5, -0.1)
    expect(result).toEqual(weatherData)
  })

  it('throws on non-ok HTTP response', async () => {
    mockFetch(null, false, 500)

    await expect(fetchCurrentWeather(0, 0)).rejects.toThrow('API error: 500')
  })

  it('includes lat, lon and metric units in URL', async () => {
    const spy = mockFetch({})
    await fetchCurrentWeather(51.5, -0.1).catch(() => {})
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('lat=51.5&lon=-0.1&units=metric'),
    )
  })
})

describe('fetchForecast', () => {
  it('returns forecast data', async () => {
    const forecastData = { list: [{ dt: 1700000000, weather: [], main: {} }] }
    mockFetch(forecastData)

    const result = await fetchForecast(51.5, -0.1)
    expect(result).toEqual(forecastData)
  })

  it('throws on non-ok HTTP response', async () => {
    mockFetch(null, false, 503)

    await expect(fetchForecast(0, 0)).rejects.toThrow('API error: 503')
  })

  it('requests 40 entries (cnt=40) in URL', async () => {
    const spy = mockFetch({ list: [] })
    await fetchForecast(51.5, -0.1).catch(() => {})
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('cnt=40'))
  })
})
