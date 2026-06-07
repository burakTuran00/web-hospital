import api from './axios'

export const medicineApi = {
  getAll:    ()         => api.get('/v1/medicines'),
  getById:   (id)       => api.get(`/v1/medicines/${id}`),
  create:    (data)     => api.post('/v1/medicines', data),
  update:    (id, data) => api.put(`/v1/medicines/${id}`, data),
  delete:    (id)       => api.delete(`/v1/medicines/${id}`)
}
