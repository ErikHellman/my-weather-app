import { useState, useCallback, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoaderCircle, Moon, Search, Sun, TriangleAlert } from 'lucide-react'
import { useWeather } from '@/hooks/useWeather'
import { useDarkMode } from '@/hooks/useDarkMode'
import { WeatherDisplay } from '@/components/WeatherDisplay'

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const [searchedCity, setSearchedCity] = useState<string | null>(null)

  const { data, loading, error } = useWeather(searchedCity)
  const { isDark, toggle } = useDarkMode()

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const trimmed = inputValue.trim()
      if (trimmed) {
        setSearchedCity(trimmed)
      }
    },
    [inputValue],
  )

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-950 via-indigo-950 to-slate-950 flex flex-col overflow-hidden transition-colors duration-300">
      {/* Animated background blobs */}
      <div className="blob blob-1" aria-hidden="true" />
      <div className="blob blob-2" aria-hidden="true" />
      <div className="blob blob-3" aria-hidden="true" />

      {/* All content above blobs */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Skip-navigation link (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-white/20 focus:backdrop-blur-md focus:text-white focus:px-4 focus:py-2 focus:rounded-full focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Skip to main content
        </a>

        {/* Header */}
        <header className="w-full glass-panel border-x-0 border-t-0 transition-colors duration-300">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
            <Search className="h-6 w-6 text-white/80 flex-shrink-0" aria-hidden="true" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex-1">
              My Awesome Weather App
            </h1>
            <button
              onClick={toggle}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-full p-2 text-white/80 hover:bg-white/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {isDark ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main
          id="main-content"
          className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
          aria-label="Weather search"
        >
          {/* Search card */}
          <Card className="w-full max-w-xl rounded-3xl glass-panel border-0 transition-colors duration-300">
            <CardContent className="pt-6 pb-6 px-6">
              <form
                onSubmit={handleSubmit}
                role="search"
                aria-label="Search for a city"
                className="flex flex-col sm:flex-row gap-3"
              >
                <label htmlFor="city-input" className="sr-only">
                  City name
                </label>
                <Input
                  id="city-input"
                  type="text"
                  placeholder="Enter a city name…"
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInputValue(e.target.value)
                  }
                  aria-required="true"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || loading}
                  aria-label="Search weather for entered city"
                  className="px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result section */}
          {searchedCity !== null && (
            <section
              aria-live="polite"
              aria-atomic="true"
              aria-label="Weather results"
              className="mt-6 w-full max-w-xl"
            >
              {loading && (
                <div className="flex items-center justify-center gap-2 py-12 text-white/70">
                  <LoaderCircle
                    className="h-6 w-6 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Loading weather…</span>
                </div>
              )}

              {error && (
                <Card className="rounded-3xl glass-panel border-red-300/30 bg-red-500/10 transition-colors duration-300">
                  <CardContent className="pt-6 pb-6 px-6 flex items-start gap-3">
                    <TriangleAlert
                      className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {error.kind === 'not_found'
                          ? `City "${searchedCity}" not found`
                          : 'Could not load weather'}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        {error.kind === 'not_found'
                          ? 'Check the spelling and try again.'
                          : 'Check your connection and try again.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data && <WeatherDisplay data={data} />}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-white/40 transition-colors duration-300">
          My Awesome Weather App &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  )
}
