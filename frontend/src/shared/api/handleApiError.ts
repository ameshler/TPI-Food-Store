import axios from 'axios'

interface ApiErrorResponse {
  detail?: unknown
}

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item: unknown) => {
          if (
            typeof item === 'object' &&
            item !== null &&
            'msg' in item
          ) {
            return String(item.msg)
          }

          return String(item)
        })
        .join(', ')
    }

    return error.message || 'Error de comunicación con el servidor'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrió un error inesperado'
}