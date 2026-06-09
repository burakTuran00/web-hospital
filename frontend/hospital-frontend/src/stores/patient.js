import {defineStore} from 'pinia'
import {patientApi} from '../api/patient'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [],
    selected: null,
    loading: false
  }),
  actions: {
    async fetchAll() {
      this.loading = true
      try {
        const {data} = await patientApi.getAll()
        this.patients = data
      } finally {
        this.loading = false
      }
    },
    async fetchById(id) {
      this.loading = true
      try {
        const {data} = await patientApi.getById(id)
        this.selected = data
      } finally {
        this.loading = false
      }
    },
    async create(payload) {
      const {data} = await patientApi.create(payload)
      this.patients.unshift(data)
      return data
    },
    async update(id, payload) {
      const {data} = await patientApi.update(id, payload)
      const i = this.patients.findIndex(p => p.id === id)
      if (i !== -1) this.patients.splice(i, 1, data)
      this.selected = data
      return data
    },
    async delete(id) {
      await patientApi.delete(id)
      this.patients = this.patients.filter(p => p.id !== id)
      this.selected = null
    }
  }
})
