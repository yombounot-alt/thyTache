import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useCountdown } from "./useCountdown"

describe("useCountdown", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("démarre à la valeur initiale et est actif", () => {
    const { result } = renderHook(() => useCountdown(60))
    expect(result.current.seconds).toBe(60)
    expect(result.current.isActive).toBe(true)
  })

  it("décrémente chaque seconde", () => {
    const { result } = renderHook(() => useCountdown(3))

    // Chaque tick redéclenche l'effet (nouveau setTimeout) : on avance d'une
    // seconde à la fois pour laisser React re-souscrire entre deux, plutôt
    // qu'une seule grande avance qui ne traverserait qu'un tick synchrone.
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.seconds).toBe(2)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.seconds).toBe(1)

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.seconds).toBe(0)
  })

  it("devient inactif à zéro et arrête de décompter", () => {
    const { result } = renderHook(() => useCountdown(1))

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.isActive).toBe(false)

    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.seconds).toBe(0)
  })

  it("reset() relance le décompte", () => {
    const { result } = renderHook(() => useCountdown(1))
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.isActive).toBe(false)

    act(() => result.current.reset(10))
    expect(result.current.seconds).toBe(10)
    expect(result.current.isActive).toBe(true)
  })
})
