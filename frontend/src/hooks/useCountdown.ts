import { useEffect, useState } from "react"

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return
    const timeout = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timeout)
  }, [seconds])

  const reset = (value: number = initialSeconds) => setSeconds(value)

  return { seconds, isActive: seconds > 0, reset }
}
