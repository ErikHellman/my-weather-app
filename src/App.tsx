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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col transition-colors duration-300">
      {/* Skip-navigation link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Search className="h-6 w-6 text-blue-500 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
          <h1 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 tracking-tight flex-1">
            My Weather App
          </h1>
          <button
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-full p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
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
        <Card className="w-full max-w-xl rounded-2xl shadow-md border-blue-100 dark:border-slate-700 transition-colors duration-300">
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
                className="flex-1 rounded-xl border-blue-200 dark:border-slate-600 focus-visible:ring-blue-400 placeholder:text-blue-300 dark:placeholder:text-slate-500 text-blue-900 dark:text-slate-100 transition-colors duration-200"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || loading}
                aria-label="Search weather for entered city"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex items-center justify-center gap-2 py-12 text-blue-400 dark:text-blue-300">
                <LoaderCircle
                  className="h-6 w-6 animate-spin"
                  aria-hidden="true"
                />
                <span>Loading weather…</span>
              </div>
            )}

            {error && (
              <Card className="rounded-2xl shadow-md border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 transition-colors duration-300">
                <CardContent className="pt-6 pb-6 px-6 flex items-start gap-3">
                  <TriangleAlert
                    className="h-5 w-5 text-red-400 dark:text-red-400 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-300">
                      {error.kind === 'not_found'
                        ? `City "${searchedCity}" not found`
                        : 'Could not load weather'}
                    </p>
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">
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
      <footer className="text-center py-4 text-xs text-blue-300 dark:text-slate-600 transition-colors duration-300">
        My Weather App &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
