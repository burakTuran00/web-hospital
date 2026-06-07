import api from './axios'

export const departmentApi = {
  getAll:          ()           => api.get('/v1/departments'),
  getByHospitalId: (hospitalId) => api.get(`/v1/departments/hospital/${hospitalId}`),
  getByDoctorId:   (doctorId)   => api.get(`/v1/departments/doctor/${doctorId}`),
  create:          (data)       => api.post('/v1/departments', data),
  update:          (id, data)   => api.put(`/v1/departments/${id}`, data),
  delete:          (id)         => api.delete(`/v1/departments/${id}`)
}
