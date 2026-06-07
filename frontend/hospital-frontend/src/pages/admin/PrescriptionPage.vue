<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Reçeteler</div>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Hasta / İlaç</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:250px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Durum</div>
        <q-select v-model="statusFilter" :options="statusOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:150px"/>
      </div>
    </div>

    <q-table
      :columns="columns"
      :loading="store.loading"
      :rows="filteredRows"
      :rows-per-page-options="[10, 25, 50]"
      bordered flat
      no-data-label="Kayıt yok"
      row-key="id"
      style="cursor:pointer"
      @row-click="(e, row) => $router.push({ name: 'prescription-detail', params: { id: row.id } })"
    >
      <template #body-cell-status="props">
        <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn color="negative" dense flat icon="delete" round size="sm"
                 @click.stop="handleDelete(props.row)">
            <q-tooltip>Sil</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {usePrescriptionStore} from '../../stores/prescription'

const $q = useQuasar()
const store = usePrescriptionStore()

const search = ref('')
const statusFilter = ref(null)

const statusOptions = [
  {label: 'Aktif', value: 'ACTIVE'},
  {label: 'Kullanıldı', value: 'USED'},
  {label: 'Süresi Doldu', value: 'EXPIRED'}
]

const statusLabel = (v) => ({ACTIVE: 'Aktif', USED: 'Kullanıldı', EXPIRED: 'Süresi Doldu'})[v] || v

const columns = [
  {name: 'id', label: 'No', field: 'id', align: 'left'},
  {name: 'patientFullName', label: 'Hasta', field: 'patientFullName', align: 'left', sortable: true},
  {name: 'doctorFullName', label: 'Doktor', field: 'doctorFullName', align: 'left', sortable: true},
  {name: 'medicineName', label: 'İlaç', field: 'medicineName', align: 'left', sortable: true},
  {name: 'dosageInstruction', label: 'Kullanım', field: 'dosageInstruction', align: 'left'},
  {name: 'issueDate', label: 'Tarih', field: 'issueDate', align: 'left', sortable: true},
  {name: 'expiryDate', label: 'Son Kullanma', field: 'expiryDate', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = store.prescriptions
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(p =>
      p.patientFullName?.toLowerCase().includes(q) ||
      p.medicineName?.toLowerCase().includes(q) ||
      p.doctorFullName?.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) rows = rows.filter(p => p.status === statusFilter.value)
  return rows
})

const handleDelete = (item) => {
  $q.dialog({
    title: 'Sil',
    message: 'Bu reçete silinecek. Emin misiniz?',
    cancel: {label: 'Hayır', flat: true},
    ok: {label: 'Evet', flat: true, color: 'negative'}
  }).onOk(async () => {
    try {
      await store.delete(item.id)
      $q.notify({type: 'positive', message: 'Silindi.', position: 'top-right'})
    } catch (err) {
      $q.notify({type: 'negative', message: err.response?.data?.message || 'Silinemedi.', position: 'top-right'})
    }
  })
}

onMounted(() => store.fetchAll())
</script>
