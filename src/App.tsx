import { useState, useCallback, type FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const [searchedCity, setSearchedCity] = useState<string | null>(null)

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Skip-navigation link for keyboard/screen-reader users (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="w-full bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Search className="h-6 w-6 text-blue-500 flex-shrink-0" aria-hidden="true" />
          <h1 className="text-xl sm:text-2xl font-bold text-blue-700 tracking-tight">
            My Weather App
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
        aria-label="Weather search"
      >
        {/* Search card */}
        <Card className="w-full max-w-xl rounded-2xl shadow-md border-blue-100">
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                aria-required="true"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="flex-1 rounded-xl border-blue-200 focus-visible:ring-blue-400 placeholder:text-blue-300 text-blue-900"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Search weather for entered city"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="h-4 w-4 mr-2" aria-hidden="true" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result — only shown after a search */}
        {searchedCity !== null && (
          <section
            aria-live="polite"
            aria-atomic="true"
            aria-label="Search result"
            className="mt-6 w-full max-w-xl"
          >
            <Card className="rounded-2xl shadow-md border-blue-100">
              <CardContent className="pt-6 pb-6 px-6">
                <p className="text-sm font-medium text-blue-400 uppercase tracking-widest mb-1">
                  City
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-blue-700">
                  {searchedCity}
                </p>
                <p className="mt-2 text-sm text-blue-400">
                  Weather data will appear here in a future update.
                </p>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-blue-300">
        My Weather App &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
