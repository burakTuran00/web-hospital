<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Randevularım</div>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <q-table
      :columns="columns"
      :loading="aptStore.loading"
      :rows="filteredRows"
      :rows-per-page-options="[10, 25]"
      bordered flat
      no-data-label="Randevu yok"
      row-key="id"
    >
      <template #body-cell-appointmentDate="props">
        <q-td :props="props">{{ formatDate(props.value) }}</q-td>
      </template>
      <template #body-cell-type="props">
        <q-td :props="props">{{ props.value === 'ONLINE' ? 'Online' : 'Yüz Yüze' }}</q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <template v-if="props.row.status === 'SCHEDULED' || props.row.status === 'POSTPONED'">
            <q-btn color="positive" dense flat label="Tamamla" size="sm"
                   @click.stop="openCompleteDialog(props.row)"/>
            <q-btn color="warning" dense flat label="Ertele" size="sm"
                   @click.stop="openPostponeDialog(props.row)"/>
          </template>
        </q-td>
      </template>
    </q-table>

    <!-- Tamamla Dialog -->
    <AppDialog
      v-model="completeDialog"
      :loading="saving"
      title="Randevuyu Tamamla"
      width="560px"
      @save="completeFormRef.submit()"
    >
      <q-form ref="completeFormRef" class="q-gutter-sm" @submit="handleComplete">
        <q-input v-model="completeForm.notes" dense label="Doktor Notu" outlined
                 rows="2" type="textarea"/>

        <div class="row items-center q-mt-sm q-mb-xs">
          <span class="text-body2">Reçete</span>
          <q-space/>
          <q-btn dense flat icon="add" label="İlaç Ekle" size="sm" @click="addPrescription"/>
        </div>

        <div v-for="(p, i) in completeForm.prescriptions" :key="i">
          <div class="row items-center q-mb-xs">
            <span class="text-caption">İlaç {{ i + 1 }}</span>
            <q-space/>
            <q-btn dense flat icon="close" round size="xs" @click="removePrescription(i)"/>
          </div>
          <div class="q-gutter-xs">
            <q-select v-model="p.medicineId" :options="medicineOptions" dense
                      emit-value label="İlaç" map-options outlined/>
            <q-input v-model="p.dosageInstruction" dense label="Kullanım Talimatı" outlined/>
            <div class="row q-gutter-sm">
              <q-input v-model="p.issueDate" class="col" dense label="Tarih" outlined type="date"/>
              <q-input v-model="p.expiryDate" class="col" dense label="Son Kullanma" outlined type="date"/>
              <q-input v-model.number="p.durationDays" class="col-3" dense label="Gün" outlined type="number"/>
              <q-input v-model.number="p.quantity" class="col-3" dense label="Adet" outlined type="number"/>
            </div>
          </div>
          <q-separator class="q-my-sm"/>
        </div>
      </q-form>
    </AppDialog>

    <!-- Ertele Dialog -->
    <AppDialog
      v-model="postponeDialog"
      :loading="saving"
      title="Randevuyu Ertele"
      width="420px"
      @save="postponeFormRef.submit()"
    >
      <q-form ref="postponeFormRef" class="q-gutter-sm" @submit="handlePostpone">
        <q-input
          v-model="postponeForm.newDate"
          :rules="[v => !!v || 'Zorunlu']"
          dense label="Yeni Tarih ve Saat *"
          outlined type="datetime-local"
        />
        <q-input
          v-model="postponeForm.postponeReason"
          dense label="Erteleme Gerekçesi"
          outlined rows="2" type="textarea"
        />
      </q-form>
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {useAppointmentStore} from '../../stores/appointment'
import {useMedicineStore} from '../../stores/medicine'
import {useAuthStore} from '../../stores/auth'
import AppFilters from '../../components/AppFilters.vue'
import AppDialog from '../../components/AppDialog.vue'

const $q = useQuasar()
const aptStore = useAppointmentStore()
const medStore = useMedicineStore()
const auth = useAuthStore()

const completeDialog = ref(false)
const postponeDialog = ref(false)
const saving = ref(false)
const selectedApt = ref(null)
const completeFormRef = ref(null)
const postponeFormRef = ref(null)
const filters = ref({search: '', status: null})

const completeForm = ref({notes: '', prescriptions: []})
const postponeForm = ref({newDate: '', postponeReason: ''})

const medicineOptions = computed(() =>
  medStore.medicines.map(m => ({label: m.name, value: m.id}))
)

const statusOptions = [
  {label: 'Planlandı', value: 'SCHEDULED'},
  {label: 'Tamamlandı', value: 'COMPLETED'},
  {label: 'İptal', value: 'CANCELLED'},
  {label: 'Ertelendi', value: 'POSTPONED'}
]

const filterConfig = [
  {key: 'search', type: 'search', label: 'Hasta Ara', width: '220px'},
  {key: 'status', type: 'select', label: 'Durum', width: '140px', options: statusOptions}
]

const columns = [
  {name: 'patientFullName', label: 'Hasta', field: 'patientFullName', align: 'left', sortable: true},
  {name: 'appointmentDate', label: 'Tarih', field: 'appointmentDate', align: 'left', sortable: true},
  {name: 'type', label: 'Tip', field: 'type', align: 'left'},
  {name: 'durationMinutes', label: 'Süre (dk)', field: 'durationMinutes', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = aptStore.doctorAppointments
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(a => a.patientFullName?.toLowerCase().includes(q))
  }
  if (filters.value.status) rows = rows.filter(a => a.status === filters.value.status)
  return rows
})

const formatDate = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-'
const statusLabel = (s) => ({
  SCHEDULED: 'Planlandı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  POSTPONED: 'Ertelendi'
})[s] || s

const openCompleteDialog = (row) => {
  selectedApt.value = row
  completeForm.value = {notes: '', prescriptions: []}
  completeDialog.value = true
}

const openPostponeDialog = (row) => {
  selectedApt.value = row
  postponeForm.value = {newDate: '', postponeReason: ''}
  postponeDialog.value = true
}

const addPrescription = () => completeForm.value.prescriptions.push({
  patientId: selectedApt.value?.patientId || null,
  medicineId: null,
  issueDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  dosageInstruction: '',
  durationDays: 30,
  quantity: 1
})

const removePrescription = (i) => completeForm.value.prescriptions.splice(i, 1)

const handleComplete = async () => {
  saving.value = true
  try {
    await aptStore.complete(selectedApt.value.id, auth.doctorId, completeForm.value)
    $q.notify({type: 'positive', message: 'Tamamlandı.', position: 'top-right'})
    completeDialog.value = false
    await aptStore.fetchByDoctor(auth.doctorId)
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handlePostpone = async () => {
  saving.value = true
  try {
    await aptStore.postpone(selectedApt.value.id, auth.doctorId, {
      newDate: postponeForm.value.newDate + ':00',
      postponeReason: postponeForm.value.postponeReason
    })
    $q.notify({type: 'positive', message: 'Randevu ertelendi.', position: 'top-right'})
    postponeDialog.value = false
    await aptStore.fetchByDoctor(auth.doctorId)
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    aptStore.fetchByDoctor(auth.doctorId),
    medStore.fetchAll()
  ])
})
</script>
