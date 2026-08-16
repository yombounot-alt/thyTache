import { isAxiosError } from "axios"

export class ApiError extends Error {
  fieldErrors?: Record<string, string>
  status?: number

  constructor(message: string, fieldErrors?: Record<string, string>, status?: number) {
    super(message)
    this.name = "ApiError"
    this.fieldErrors = fieldErrors
    this.status = status
  }
}

export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (isAxiosError(error)) {
    const status = error.response?.status
    const body = error.response?.data as
      | { message?: string; errors?: Array<{ field: string; message: string }> }
      | undefined
    const fieldErrors = body?.errors?.length
      ? Object.fromEntries(body.errors.map((e) => [e.field, e.message]))
      : undefined
    return new ApiError(body?.message ?? fallbackMessage, fieldErrors, status)
  }
  return new ApiError(fallbackMessage)
}
