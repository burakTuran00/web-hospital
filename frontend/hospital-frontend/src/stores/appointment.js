import { defineStore } from 'pinia'
import { appointmentApi } from '../api/appointment'

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments:        [],
    doctorAppointments:  [],
    patientAppointments: [],
    loading:             false
  }),

  actions: {
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await appointmentApi.getAll()
        this.appointments = data
      } finally {
        this.loading = false
      }
    },

    async fetchByDoctor (doctorId) {
      this.loading = true
      try {
        const { data } = await appointmentApi.getByDoctor(doctorId)
        this.doctorAppointments = data
      } finally {
        this.loading = false
      }
    },

    async fetchByPatient (patientId) {
      this.loading = true
      try {
        const { data } = await appointmentApi.getByPatient(patientId)
        this.patientAppointments = data
      } finally {
        this.loading = false
      }
    },

    async book (payload) {
      const { data } = await appointmentApi.book(payload)
      this.appointments.unshift(data)
      return data
    },

    async cancel (id, patientId, reason) {
      const { data } = await appointmentApi.cancel(id, patientId, { cancelReason: reason })
      const i = this.appointments.findIndex(a => a.id === id)
      if (i !== -1) this.appointments.splice(i, 1, data)
      return data
    },

    async complete (id, doctorId, payload) {
      const { data } = await appointmentApi.complete(id, doctorId, payload)
      const i = this.appointments.findIndex(a => a.id === id)
      if (i !== -1) this.appointments.splice(i, 1, data)
      return data
    },

    async delete (id) {
      await appointmentApi.delete(id)
      this.appointments = this.appointments.filter(a => a.id !== id)
    }
  }
})
