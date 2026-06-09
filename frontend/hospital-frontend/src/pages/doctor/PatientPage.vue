<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Hastalarım</div>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <q-table
      :columns="columns"
      :loading="loading"
      :rows="filteredRows"
      :rows-per-page-options="[10, 25]"
      bordered flat
      no-data-label="Hasta yok"
      row-key="id"
    >
      <template #body-cell-gender="props">
        <q-td :props="props">{{ props.value === 'MALE' ? 'Erkek' : 'Kadın' }}</q-td>
      </template>
      <template #body-cell-insuranceType="props">
        <q-td :props="props">{{ insuranceLabel(props.value) }}</q-td>
      </template>
    </q-table>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useAuthStore} from '../../stores/auth'
import {doctorApi} from '../../api/doctor'
import AppFilters from '../../components/AppFilters.vue'

const auth = useAuthStore()
const loading = ref(false)
const patients = ref([])
const filters = ref({search: ''})

const insuranceLabel = (v) => ({SGK: 'SGK', PRIVATE: 'Özel', NONE: 'Yok'})[v] || v

const filterConfig = [
  {key: 'search', type: 'search', label: 'Hasta Ara', width: '220px'}
]

const columns = [
  {name: 'firstName', label: 'Ad', field: 'firstName', align: 'left', sortable: true},
  {name: 'lastName', label: 'Soyad', field: 'lastName', align: 'left', sortable: true},
  {name: 'gender', label: 'Cinsiyet', field: 'gender', align: 'left'},
  {name: 'bloodType', label: 'Kan Grubu', field: 'bloodType', align: 'left'},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'insuranceType', label: 'Sigorta', field: 'insuranceType', align: 'left'}
]

const filteredRows = computed(() => {
  let rows = patients.value
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(p =>
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q)
    )
  }
  return rows
})

onMounted(async () => {
  loading.value = true
  try {
    const {data} = await doctorApi.getPatients(auth.doctorId)
    patients.value = data
  } finally {
    loading.value = false
  }
})
</script>
