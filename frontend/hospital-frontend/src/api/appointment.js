import api from './axios'

export const appointmentApi = {
  getAll: () => api.get('/v1/appointments'),
  getByDoctor: (doctorId) => api.get(`/v1/appointments/doctor/${doctorId}`),
  getByPatient: (patientId) => api.get(`/v1/appointments/patient/${patientId}`),
  getById: (id) => api.get(`/v1/appointments/${id}`),
  getAvailableSlots: (doctorId, date, dur = 30) => api.get('/v1/appointments/available-slots', {
    params: {
      doctorId,
      date,
      durationMinutes: dur
    }
  }),
  book: (data) => api.post('/v1/appointments/book', data),
  cancel: (id, patientId, data) => api.patch(`/v1/appointments/${id}/cancel?patientId=${patientId}`, data),
  complete: (id, doctorId, data) => api.patch(`/v1/appointments/${id}/complete?doctorId=${doctorId}`, data),
  postpone: (id, doctorId, data) => api.patch(`/v1/appointments/${id}/postpone?doctorId=${doctorId}`, data),
  delete: (id) => api.delete(`/v1/appointments/${id}`)
}
