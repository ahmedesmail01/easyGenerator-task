import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || '/api',
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
})
