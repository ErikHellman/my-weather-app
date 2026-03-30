# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Type-check with tsc, then Vite production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

No test runner is configured.

## Environment

Requires a `.env` file with:
```
VITE_WEATHER_API_KEY=<OpenWeatherMap API key>
```

The GitHub Actions deploy workflow (`./github/workflows/deploy.yml`) expects this as a repository secret `VITE_WEATHER_API_KEY`. The app is deployed to GitHub Pages at base path `/my-weather-app/`.

## Architecture

**Stack**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui components

**Path alias**: `@/` maps to `src/` — use this for all imports.

**Data flow**:
1. `App.tsx` owns search state and dark mode toggle
2. `useWeather` hook (in `src/hooks/`) orchestrates API calls
3. `src/services/weather.ts` calls the OpenWeatherMap Geocoding API then current weather + 5-day forecast endpoints
4. `WeatherDisplay.tsx` renders results

**Key directories**:
- `src/components/ui/` — Radix UI-based primitives (Button, Input, Card)
- `src/hooks/` — `useWeather.ts` and `useDarkMode.ts`
- `src/services/` — API layer (`weather.ts`)
- `src/types/` — TypeScript types for API responses and internal data shapes

**Styling**: Tailwind CSS v4 with glassmorphism/liquid glass aesthetic (backdrop blur panels). Dark mode is toggled via a class on `<html>` managed by `useDarkMode`.
