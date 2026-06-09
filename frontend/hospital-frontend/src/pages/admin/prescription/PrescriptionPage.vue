<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Reçeteler</div>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <AppTable
      :columns="columns"
      :loading="store.loading"
      :on-row-click="(row) => $router.push({ name: 'prescription-detail', params: { id: row.id } })"
      :rows="filteredRows"
      @delete="(item) => handleDelete(item, { label: () => 'Bu reçete' })"
    >
      <template #actions="props">
        <q-td :props="props" auto-width>
          <q-btn color="negative" dense flat icon="delete" round size="sm"
                 @click.stop="handleDelete(props.row, { label: () => 'Bu reçete' })">
            <q-tooltip>Sil</q-tooltip>
          </q-btn>
        </q-td>
      </template>
      <template #cell-status="props">
        <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
      </template>
    </AppTable>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {usePrescriptionStore} from 'stores/prescription.js'
import {useTableActions} from '../../../composables/useTableActions.js'
import AppTable from 'components/AppTable.vue'
import AppFilters from 'components/AppFilters.vue'

const store = usePrescriptionStore()
const filters = ref({search: '', status: null})

const {handleDelete} = useTableActions(store)

const statusOptions = [
  {label: 'Aktif', value: 'ACTIVE'},
  {label: 'Kullanıldı', value: 'USED'},
  {label: 'Süresi Doldu', value: 'EXPIRED'}
]

const statusLabel = (v) => ({ACTIVE: 'Aktif', USED: 'Kullanıldı', EXPIRED: 'Süresi Doldu'})[v] || v

const filterConfig = [
  {key: 'search', type: 'search', label: 'Hasta / İlaç', width: '250px'},
  {key: 'status', type: 'select', label: 'Durum', width: '150px', options: statusOptions}
]

const columns = [
  {name: 'id', label: 'No', field: 'id', align: 'left'},
  {name: 'patientFullName', label: 'Hasta', field: 'patientFullName', align: 'left', sortable: true},
  {name: 'doctorFullName', label: 'Doktor', field: 'doctorFullName', align: 'left', sortable: true},
  {name: 'medicineName', label: 'İlaç', field: 'medicineName', align: 'left', sortable: true},
  {name: 'dosageInstruction', label: 'Kullanım', field: 'dosageInstruction', align: 'left'},
  {name: 'issueDate', label: 'Tarih', field: 'issueDate', align: 'left', sortable: true},
  {name: 'expiryDate', label: 'Son Kullanma', field: 'expiryDate', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left', sortable: true}
]

const filteredRows = computed(() => {
  let rows = store.prescriptions
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(p =>
      p.patientFullName?.toLowerCase().includes(q) ||
      p.medicineName?.toLowerCase().includes(q) ||
      p.doctorFullName?.toLowerCase().includes(q)
    )
  }
  if (filters.value.status) rows = rows.filter(p => p.status === filters.value.status)
  return rows
})

onMounted(() => store.fetchAll())
</script>
