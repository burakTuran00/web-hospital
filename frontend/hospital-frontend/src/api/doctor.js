import api from './axios'

export const doctorApi = {
  getAll: () => api.get('/v1/doctors'),
  getById: (id) => api.get(`/v1/doctors/${id}`),
  getByEmail: (email) => api.get('/v1/doctors/by-email', {params: {email}}),
  getByDepartmentAndHospital: (deptId, hospId) => api.get(`/v1/doctors/department/${deptId}/hospital/${hospId}`),
  getPatients: (doctorId) => api.get(`/v1/doctors/${doctorId}/patients`),
  create: (data) => api.post('/v1/doctors', data),
  update: (id, data) => api.put(`/v1/doctors/${id}`, data),
  delete: (id) => api.delete(`/v1/doctors/${id}`)
}
