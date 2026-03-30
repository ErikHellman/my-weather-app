import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDarkMode } from './useDarkMode'

beforeEach(() => {
  document.documentElement.classList.remove('dark')
})

describe('useDarkMode', () => {
  it('initializes isDark from document class (no dark class)', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.isDark).toBe(false)
  })

  it('initializes isDark from document class (dark class present)', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => useDarkMode())
    expect(result.current.isDark).toBe(true)
  })

  it('toggle adds dark class to document', () => {
    const { result } = renderHook(() => useDarkMode())
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => result.current.toggle())

    expect(result.current.isDark).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggle removes dark class from document', () => {
    document.documentElement.classList.add('dark')
    const { result } = renderHook(() => useDarkMode())

    act(() => result.current.toggle())

    expect(result.current.isDark).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggle alternates on each call', () => {
    const { result } = renderHook(() => useDarkMode())

    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(true)

    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(false)

    act(() => result.current.toggle())
    expect(result.current.isDark).toBe(true)
  })
})
