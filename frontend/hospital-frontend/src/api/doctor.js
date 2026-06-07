import api from './axios'

export const doctorApi = {
  getAll:  ()         => api.get('/v1/doctors'),
  getById: (id)       => api.get(`/v1/doctors/${id}`),
  create:  (data)     => api.post('/v1/doctors', data),
  update:  (id, data) => api.put(`/v1/doctors/${id}`, data),
  delete:  (id)       => api.delete(`/v1/doctors/${id}`)
}
