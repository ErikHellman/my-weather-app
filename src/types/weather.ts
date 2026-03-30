// --- OpenWeatherMap API response shapes ---

export interface GeoResult {
  lat: number
  lon: number
  name: string
  country: string
}

export interface WeatherCondition {
  id: number
  main: string
  description: string
}

export interface CurrentWeatherResponse {
  weather: WeatherCondition[]
  main: {
    temp: number
    humidity: number
  }
  wind: {
    speed: number
  }
  name: string
}

export interface ForecastEntry {
  dt: number
  weather: WeatherCondition[]
  main: {
    temp: number
    temp_min: number
    temp_max: number
  }
}

export interface ForecastResponse {
  list: ForecastEntry[]
}

// --- Internal aggregated shapes used by components ---

export interface DayForecast {
  date: string        // "YYYY-MM-DD"
  label: string       // "Mon", "Tue", etc.
  high: number
  low: number
  conditionId: number
  conditionMain: string
  description: string
}

export interface WeatherData {
  cityName: string
  country: string
  temp: number
  conditionId: number
  conditionMain: string
  description: string
  humidity: number
  windSpeed: number   // m/s from API; multiply by 3.6 in UI for km/h
  forecast: DayForecast[]
}
