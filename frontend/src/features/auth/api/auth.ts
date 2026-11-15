import axiosInstance from '../../../shared/api/axiosInstance'

import type {
  AuthUser,
  RegisterPayload,
} from '../types/auth'

export async function registerRequest(
  payload: RegisterPayload,
): Promise<AuthUser> {
  const response = await axiosInstance.post<AuthUser>(
    '/auth/register',
    payload,
  )

  return response.data
}

export async function loginRequest(
  username: string,
  password: string,
): Promise<void> {
  const formData = new URLSearchParams()

  formData.append('username', username)
  formData.append('password', password)

  await axiosInstance.post(
    '/auth/token',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  )
}

export async function logoutRequest(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await axiosInstance.get<AuthUser>('/auth/me')

  return response.data
}