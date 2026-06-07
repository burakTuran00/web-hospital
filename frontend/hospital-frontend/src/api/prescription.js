import api from './axios'

export const prescriptionApi = {
  getAll:        ()                => api.get('/v1/prescriptions'),
  getByPatient:  (patientId)       => api.get(`/v1/prescriptions/patient/${patientId}`),
  getById:       (id)              => api.get(`/v1/prescriptions/${id}`),
  write:         (doctorId, data)  => api.post(`/v1/prescriptions/write?doctorId=${doctorId}`, data),
  delete:        (id)              => api.delete(`/v1/prescriptions/${id}`)
}
