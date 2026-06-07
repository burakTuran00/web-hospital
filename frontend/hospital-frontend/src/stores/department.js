import { defineStore } from 'pinia'
import { departmentApi } from '../api/department'

export const useDepartmentStore = defineStore('department', {
  state: () => ({
    departments:      [],
    doctorDepartment: null,
    loading:          false
  }),

  actions: {
    async fetchAll () {
      this.loading = true
      try {
        const { data } = await departmentApi.getAll()
        this.departments = data
      } finally {
        this.loading = false
      }
    },

    async fetchByHospital (hospitalId) {
      this.loading = true
      try {
        const { data } = await departmentApi.getByHospitalId(hospitalId)
        this.departments = data
      } finally {
        this.loading = false
      }
    },

    async fetchByDoctor (doctorId) {
      this.loading = true
      try {
        const { data } = await departmentApi.getByDoctorId(doctorId)
        this.doctorDepartment = data
      } finally {
        this.loading = false
      }
    },

    async create (payload) {
      const { data } = await departmentApi.create(payload)
      this.departments.unshift(data)
      return data
    },

    async update (id, payload) {
      const { data } = await departmentApi.update(id, payload)
      const i = this.departments.findIndex(d => d.id === id)
      if (i !== -1) this.departments.splice(i, 1, data)
      return data
    },

    async delete (id) {
      await departmentApi.delete(id)
      this.departments = this.departments.filter(d => d.id !== id)
    }
  }
})
