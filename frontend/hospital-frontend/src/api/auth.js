import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {'Content-Type': 'application/json'}
})

export const login = (username, password) =>
  api.post('/v1/auth/login', {username, password})

export const refreshToken = (refreshToken) =>
  api.post('/v1/auth/refresh', {refreshToken})

export const register = (data) =>
  api.post('/v1/auth/register', data)
