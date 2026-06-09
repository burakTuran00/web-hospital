import {defineStore} from 'pinia'
import {prescriptionApi} from '../api/prescription'

export const usePrescriptionStore = defineStore('prescription', {
  state: () => ({
    prescriptions: [],
    patientPrescriptions: [],
    loading: false
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const {data} = await prescriptionApi.getAll()
        this.prescriptions = data
      } finally {
        this.loading = false
      }
    },
    async updateStatus(id, status) {
      const {data} = await prescriptionApi.updateStatus(id, status)
      const i = this.prescriptions.findIndex(p => p.id === id)
      if (i !== -1) this.prescriptions.splice(i, 1, data)
      return data
    },

    async fetchByPatient(patientId) {
      this.loading = true
      try {
        const {data} = await prescriptionApi.getByPatient(patientId)
        this.patientPrescriptions = data
      } finally {
        this.loading = false
      }
    },

    async write(doctorId, payload) {
      const {data} = await prescriptionApi.write(doctorId, payload)
      this.prescriptions.unshift(data)
      return data
    },

    async fetchByDoctor(doctorId) {
      this.loading = true
      try {
        const {data} = await prescriptionApi.getByDoctor(doctorId)
        this.prescriptions = data
      } finally {
        this.loading = false
      }
    },

    async delete(id) {
      await prescriptionApi.delete(id)
      this.prescriptions = this.prescriptions.filter(p => p.id !== id)
    }
  }
})
