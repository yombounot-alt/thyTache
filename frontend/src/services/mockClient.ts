import { MOCK_NETWORK_DELAY_MS } from "@/utils/constants"

export function delay(ms: number = MOCK_NETWORK_DELAY_MS) {
  const jitter = Math.random() * 200
  return new Promise((resolve) => setTimeout(resolve, ms + jitter))
}

export class MockApiError extends Error {
  fieldErrors?: Record<string, string>

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = "MockApiError"
    this.fieldErrors = fieldErrors
  }
}

export function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
