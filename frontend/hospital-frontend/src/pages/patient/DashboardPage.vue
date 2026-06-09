<template>
  <q-page padding>
    <div class="text-h6 text-weight-bold q-mb-md">Hasta Paneli</div>
    <div class="text-grey-6">Hoş geldiniz, {{ auth.user?.name }}</div>
  </q-page>
</template>

<script setup>
import {useAuthStore} from '../../stores/auth'

const auth = useAuthStore()
</script>
