import { defineStore } from 'pinia'
import { hospitalApi } from '../api/hospital'

export const useHospitalStore = defineStore('hospital', {
  state: () => ({
    hospitals: [],
    selected:  null,
    loading:   false
  }),
  actions: {
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await hospitalApi.getAll()
        this.hospitals = data
      } finally {
        this.loading = false
      }
    },
    async create (payload) {
      const { data } = await hospitalApi.create(payload)
      this.hospitals.unshift(data)
      return data
    },
    async update (id, payload) {
      const { data } = await hospitalApi.update(id, payload)
      const i = this.hospitals.findIndex(h => h.id === id)
      if (i !== -1) this.hospitals.splice(i, 1, data)
      return data
    },
    async delete (id) {
      await hospitalApi.delete(id)
      this.hospitals = this.hospitals.filter(h => h.id !== id)
    },
    async fetchById (id) {
      this.loading = true
      try {
        const { data } = await hospitalApi.getById(id)
        this.selected = data
        return data
      } finally {
        this.loading = false
      }
    }
  }
})
