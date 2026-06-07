import { defineStore } from 'pinia'
import { prescriptionApi } from '../api/prescription'

export const usePrescriptionStore = defineStore('prescription', {
  state: () => ({
    prescriptions:        [],
    patientPrescriptions: [],
    loading:              false
  }),

  actions: {
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await prescriptionApi.getAll()
        this.prescriptions = data
      } finally {
        this.loading = false
      }
    },

    async fetchByPatient (patientId) {
      this.loading = true
      try {
        const { data } = await prescriptionApi.getByPatient(patientId)
        this.patientPrescriptions = data
      } finally {
        this.loading = false
      }
    },

    async write (doctorId, payload) {
      const { data } = await prescriptionApi.write(doctorId, payload)
      this.prescriptions.unshift(data)
      return data
    },

    async delete (id) {
      await prescriptionApi.delete(id)
      this.prescriptions = this.prescriptions.filter(p => p.id !== id)
    }
  }
})
