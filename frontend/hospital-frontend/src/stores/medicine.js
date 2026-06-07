import { defineStore } from 'pinia'
import { medicineApi } from '../api/medicine'

export const useMedicineStore = defineStore('medicine', {
  state: () => ({
    medicines: [],
    loading:   false
  }),
  actions: {
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await medicineApi.getAll()
        this.medicines = data
      } finally {
        this.loading = false
      }
    },
    async create (payload) {
      const { data } = await medicineApi.create(payload)
      this.medicines.unshift(data)
      return data
    },
    async update (id, payload) {
      const { data } = await medicineApi.update(id, payload)
      const i = this.medicines.findIndex(m => m.id === id)
      if (i !== -1) this.medicines.splice(i, 1, data)
      return data
    },
    async delete (id) {
      await medicineApi.delete(id)
      this.medicines = this.medicines.filter(m => m.id !== id)
    }
  }
})
