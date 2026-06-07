import api from './axios'

export const hospitalApi = {
  getAll:    ()         => api.get('/v1/hospitals'),
  getById:   (id)       => api.get(`/v1/hospitals/${id}`),
  create:    (data)     => api.post('/v1/hospitals', data),
  update:    (id, data) => api.put(`/v1/hospitals/${id}`, data),
  delete:    (id)       => api.delete(`/v1/hospitals/${id}`)
}
