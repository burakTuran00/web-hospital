import api from './axios'

export const patientApi = {
  getAll: () => api.get('/v1/patients'),
  getById: (id) => api.get(`/v1/patients/${id}`),
  getByEmail: (email) => api.get(`/v1/patients/email/${email}`),
  create: (data) => api.post('/v1/patients', data),
  update: (id, data) => api.put(`/v1/patients/${id}`, data),
  delete: (id) => api.delete(`/v1/patients/${id}`)
}
