import type { WeatherData } from '@/types/weather'
import { Card, CardContent } from '@/components/ui/card'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
  type LucideIcon,
} from 'lucide-react'

function getWeatherIcon(conditionId: number): LucideIcon {
  if (conditionId >= 200 && conditionId < 300) return CloudLightning
  if (conditionId >= 300 && conditionId < 400) return CloudDrizzle
  if (conditionId >= 500 && conditionId < 600) return CloudRain
  if (conditionId >= 600 && conditionId < 700) return CloudSnow
  if (conditionId >= 700 && conditionId < 752) return CloudFog
  if (conditionId >= 752 && conditionId < 800) return Wind
  if (conditionId === 800) return Sun
  if (conditionId === 801) return CloudSun
  return Cloud
}

interface WeatherDisplayProps {
  data: WeatherData
}

export function WeatherDisplay({ data }: WeatherDisplayProps) {
  const CurrentIcon = getWeatherIcon(data.conditionId)
  const windKmh = Math.round(data.windSpeed * 3.6)

  return (
    <div className="w-full max-w-xl space-y-4">
      {/* Current weather card */}
      <Card className="rounded-3xl glass-panel border-0 transition-colors duration-300">
        <CardContent className="pt-6 pb-6 px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-1">
                {data.cityName}, {data.country}
              </p>
              <p className="text-5xl sm:text-6xl font-bold text-white tabular-nums">
                {data.temp}°C
              </p>
              <p className="mt-1 text-lg capitalize text-white/80">
                {data.description}
              </p>
            </div>
            <CurrentIcon
              className="h-16 w-16 text-white/80 flex-shrink-0"
              aria-hidden="true"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4" aria-hidden="true" />
              {data.humidity}% humidity
            </span>
            <span className="flex items-center gap-1.5">
              <Wind className="h-4 w-4" aria-hidden="true" />
              {windKmh} km/h wind
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 5-day forecast */}
      <div
        role="list"
        aria-label="5-day forecast"
        className="grid grid-cols-5 gap-2"
      >
        {data.forecast.map((day) => {
          const DayIcon = getWeatherIcon(day.conditionId)
          return (
            <Card
              key={day.date}
              role="listitem"
              aria-label={`${day.label}: high ${day.high}°, low ${day.low}°, ${day.description}`}
              className="rounded-2xl glass-panel border-0 transition-colors duration-300"
            >
              <CardContent className="pt-3 pb-3 px-2 flex flex-col items-center gap-1">
                <p className="text-xs font-semibold text-white/60 uppercase">
                  {day.label}
                </p>
                <DayIcon
                  className="h-5 w-5 text-white/70"
                  aria-hidden="true"
                />
                <p className="text-sm font-bold text-white tabular-nums">
                  {day.high}°
                </p>
                <p className="text-xs text-white/50 tabular-nums">{day.low}°</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
