<template>
  <q-page padding>
    <div class="text-h5">Dashboard</div>
    <div>Hoş geldiniz, {{ auth.user?.name }}</div>
    <q-btn color="negative" label="Çıkış" class="q-mt-md" @click="logout" />
  </q-page>
</template>

<script setup>
import { useAuthStore } from 'stores/auth.js'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>
