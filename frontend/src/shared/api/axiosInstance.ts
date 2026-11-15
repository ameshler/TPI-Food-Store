import axios, { type AxiosError } from 'axios'

interface ApiErrorResponse {
  detail?: unknown
}

type SessionExpiredHandler = () => void

let sessionExpiredHandler: SessionExpiredHandler | null = null

export function registerSessionExpiredHandler(
  handler: SessionExpiredHandler,
): void {
  sessionExpiredHandler = handler
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detail = error.response?.data?.detail

    const isLoginRequest = url.includes('/auth/token')
    const isSessionCheckRequest = url.includes('/auth/me')

    const unauthorized =
      status === 401 && !isLoginRequest && !isSessionCheckRequest

    const accountDisabled =
      status === 400 && detail === 'Cuenta de usuario desactivada'

    if (unauthorized || accountDisabled) {
      sessionExpiredHandler?.()
    }

    return Promise.reject(error)
  },
)

export default axiosInstance