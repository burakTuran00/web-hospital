import { defineStore } from 'pinia'
import { doctorApi } from '../api/doctor'

export const useDoctorStore = defineStore('doctor', {
  state: () => ({
    doctors:  [],
    selected: null,
    loading:  false
  }),

  actions: {
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await doctorApi.getAll()
        this.doctors = data
      } finally {
        this.loading = false
      }
    },

    async fetchById (id) {
      this.loading = true
      try {
        const { data } = await doctorApi.getById(id)
        this.selected = data
        return data
      } finally {
        this.loading = false
      }
    },

    async create (payload) {
      const { data } = await doctorApi.create(payload)
      this.doctors.unshift(data)
      return data
    },

    async update (id, payload) {
      const { data } = await doctorApi.update(id, payload)
      const i = this.doctors.findIndex(d => d.id === id)
      if (i !== -1) this.doctors.splice(i, 1, data)
      return data
    },

    async delete (id) {
      await doctorApi.delete(id)
      this.doctors = this.doctors.filter(d => d.id !== id)
    }
  }
})
