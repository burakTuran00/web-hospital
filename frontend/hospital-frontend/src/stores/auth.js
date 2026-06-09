import {defineStore} from 'pinia'
import {login} from '../api/auth'
import {patientApi} from '../api/patient'
import {doctorApi} from '../api/doctor'
import {jwtDecode} from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    user: null,
    patientId: null,
    doctorId: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken,
    isAdmin: (state) => state.user?.roles?.includes('ROLE_ADMIN') || false,
    isDoctor: (state) => state.user?.roles?.includes('ROLE_DOCTOR') || false,
    isPatient: (state) => state.user?.roles?.includes('ROLE_PATIENT') || false,
    roles: (state) => state.user?.roles || []
  },

  actions: {
    async login(username, password) {
      const {data} = await login(username, password)
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      this._decodeUser(data.access_token)
      await this._loadPatientId()
      await this._loadDoctorId()
    },

    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.patientId = null
      this.doctorId = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },

    async initUser() {
      if (this.accessToken) {
        try {
          this._decodeUser(this.accessToken)
          await this._loadPatientId()
          await this._loadDoctorId()
        } catch {
          this.logout()
        }
      }
    },

    _decodeUser(token) {
      const decoded = jwtDecode(token)
      this.user = {
        username: decoded.preferred_username,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.realm_access?.roles || []
      }
    },

    async _loadPatientId() {
      if (!this.isPatient) return
      try {
        const {data} = await patientApi.getByEmail(this.user.email)
        this.patientId = data.id
        console.log('patientId yüklendi:', this.patientId)
      } catch (err) {
        console.error('patientId yüklenemedi:', err)
      }
    },

    async _loadDoctorId() {
      if (!this.isDoctor) return
      try {
        const {data} = await doctorApi.getByEmail(this.user.email)
        this.doctorId = data.id
        console.log('doctorId yüklendi:', this.doctorId)
      } catch (err) {
        console.error('doctorId yüklenemedi:', err)
      }
    }
  }
})
