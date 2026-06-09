<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Reçetelerim</div>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <q-table
      :columns="columns"
      :loading="prescStore.loading"
      :rows="filteredRows"
      :rows-per-page-options="[10, 25]"
      bordered flat
      no-data-label="Reçete yok"
      row-key="id"
    >
      <template #body-cell-status="props">
        <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn
            v-if="props.row.status === 'ACTIVE'"
            color="positive" dense flat label="Kullanıldı" size="sm"
            @click.stop="handleStatusUpdate(props.row.id, 'USED')"
          />
          <q-btn
            v-if="props.row.status === 'ACTIVE'"
            color="negative" dense flat label="İptal" size="sm"
            @click.stop="handleStatusUpdate(props.row.id, 'EXPIRED')"
          />
        </q-td>
      </template>
    </q-table>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {usePrescriptionStore} from '../../stores/prescription'
import {useAuthStore} from '../../stores/auth'
import AppFilters from '../../components/AppFilters.vue'

const $q = useQuasar()
const prescStore = usePrescriptionStore()
const auth = useAuthStore()
const filters = ref({search: '', status: null})

const statusOptions = [
  {label: 'Aktif', value: 'ACTIVE'},
  {label: 'Kullanıldı', value: 'USED'},
  {label: 'Süresi Doldu', value: 'EXPIRED'}
]

const statusLabel = (v) => ({ACTIVE: 'Aktif', USED: 'Kullanıldı', EXPIRED: 'Süresi Doldu'})[v] || v

const filterConfig = [
  {key: 'search', type: 'search', label: 'Hasta / İlaç', width: '220px'},
  {key: 'status', type: 'select', label: 'Durum', width: '150px', options: statusOptions}
]

const columns = [
  {name: 'patientFullName', label: 'Hasta', field: 'patientFullName', align: 'left', sortable: true},
  {name: 'medicineName', label: 'İlaç', field: 'medicineName', align: 'left', sortable: true},
  {name: 'dosageInstruction', label: 'Kullanım', field: 'dosageInstruction', align: 'left'},
  {name: 'issueDate', label: 'Reçete Tarihi', field: 'issueDate', align: 'left', sortable: true},
  {name: 'expiryDate', label: 'Son Kullanma', field: 'expiryDate', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = prescStore.prescriptions
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(p =>
      p.patientFullName?.toLowerCase().includes(q) ||
      p.medicineName?.toLowerCase().includes(q)
    )
  }
  if (filters.value.status) rows = rows.filter(p => p.status === filters.value.status)
  return rows
})

const handleStatusUpdate = async (id, status) => {
  try {
    await prescStore.updateStatus(id, status)
    $q.notify({type: 'positive', message: 'Reçete güncellendi.', position: 'top-right'})
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  }
}

onMounted(() => prescStore.fetchByDoctor(auth.doctorId))
</script>
