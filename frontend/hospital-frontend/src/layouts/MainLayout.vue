<template>
  <q-layout view="lHh Lpr lFf">

    <q-header bordered class="bg-white text-dark">
      <q-toolbar>
        <q-btn dense flat icon="menu" round @click="drawer = !drawer"/>
        <q-toolbar-title class="text-body1">Hastane Yönetim</q-toolbar-title>
        <q-space/>
        <span class="text-caption q-mr-md">{{ auth.user?.name }}</span>
        <q-btn dense flat label="Çıkış" @click="logout"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" bordered show-if-above>
      <q-list>

        <template v-if="auth.isAdmin">
          <q-item dense>
            <q-item-label class="text-caption" header>YÖNETİM</q-item-label>
          </q-item>
          <q-item v-for="item in adminMenu" :key="item.name"
                  v-ripple :to="{ name: item.name }" active-class="text-primary" clickable>
            <q-item-section avatar>
              <q-icon :name="item.icon" size="sm"/>
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <template v-else-if="auth.isDoctor">
          <q-item dense>
            <q-item-label class="text-caption" header>MENÜ</q-item-label>
          </q-item>
          <q-item v-for="item in doctorMenu" :key="item.name"
                  v-ripple :to="{ name: item.name }" active-class="text-primary" clickable>
            <q-item-section avatar>
              <q-icon :name="item.icon" size="sm"/>
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

        <template v-else-if="auth.isPatient">
          <q-item dense>
            <q-item-label class="text-caption" header>MENÜ</q-item-label>
          </q-item>
          <q-item v-for="item in patientMenu" :key="item.name"
                  v-ripple :to="{ name: item.name }" active-class="text-primary" clickable>
            <q-item-section avatar>
              <q-icon :name="item.icon" size="sm"/>
            </q-item-section>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </template>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useAuthStore} from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const drawer = ref(false)

const adminMenu = [
  {name: 'dashboard', label: 'Dashboard', icon: 'dashboard'},
  {name: 'hospitals', label: 'Hastaneler', icon: 'local_hospital'},
  {name: 'departments', label: 'Departmanlar', icon: 'apartment'},
  {name: 'doctors', label: 'Doktorlar', icon: 'medical_services'},
  {name: 'patients', label: 'Hastalar', icon: 'people'},
  {name: 'appointments', label: 'Randevular', icon: 'event'},
  {name: 'medicines', label: 'İlaçlar', icon: 'medication'},
  {name: 'prescriptions', label: 'Reçeteler', icon: 'description'}
]

const doctorMenu = [
  {name: 'doctor-dashboard', label: 'Dashboard', icon: 'dashboard'},
  {name: 'doctor-hospitals', label: 'Hastaneler', icon: 'local_hospital'},
  {name: 'doctor-departments', label: 'Departmanlar', icon: 'apartment'},
  {name: 'doctor-patients', label: 'Hastalar', icon: 'people'},
  {name: 'doctor-appointments', label: 'Randevular', icon: 'event'},
  {name: 'doctor-prescriptions', label: 'Reçeteler', icon: 'description'}
]

const patientMenu = [
  {name: 'patient-dashboard', label: 'Dashboard', icon: 'dashboard'},
  {name: 'patient-appointments', label: 'Randevularım', icon: 'event'},
  {name: 'patient-prescriptions', label: 'Reçetelerim', icon: 'description'}
]

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>
