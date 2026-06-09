<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Randevularım</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Randevu Al" @click="openBookDialog"/>
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
      <template #body-cell-durationMinutes="props">
        <q-td :props="props">{{ props.value ? props.value + ' dk' : '-' }}</q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn v-if="props.row.status === 'SCHEDULED'"
                 color="negative" dense flat label="İptal" size="sm"
                 @click.stop="openCancelDialog(props.row)"/>
        </q-td>
      </template>
    </q-table>

    <!-- Randevu Al Dialog -->
    <q-dialog v-model="bookDialog" persistent>
      <q-card style="width:480px; max-width:95vw">

        <q-card-section class="row items-center">
          <div class="text-h6">Randevu Al</div>
          <q-space/>
          <q-btn dense flat icon="close" round @click="closeBookDialog"/>
        </q-card-section>

        <q-card-section class="q-pt-none q-pb-sm">
          <div class="row items-center">
            <template v-for="(s, i) in steps" :key="s.name">
              <div class="column items-center" style="flex:1">
                <q-avatar
                  :color="step > i+1 ? 'positive' : step === i+1 ? 'primary' : 'grey-4'"
                  size="28px" text-color="white"
                >
                  <q-icon v-if="step > i+1" name="check" size="14px"/>
                  <span v-else style="font-size:12px">{{ i + 1 }}</span>
                </q-avatar>
                <div :class="step === i+1 ? 'text-primary' : 'text-grey-6'"
                     class="text-caption q-mt-xs"
                     style="font-size:11px">
                  {{ s.label }}
                </div>
              </div>
              <div v-if="i < steps.length - 1"
                   style="flex:1; height:1px; background:#e0e0e0; margin-bottom:18px"/>
            </template>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="min-height:180px">

          <div v-if="step === 1">
            <div class="text-caption text-grey-7 q-mb-xs">Departman Seçin</div>
            <q-select
              v-model="booking.departmentId"
              :options="departmentOptions"
              dense emit-value
              input-debounce="0" map-options
              outlined placeholder="Departman ara..."
              use-input
              @update:model-value="onDepartmentSelect"
            />
          </div>

          <div v-if="step === 2">
            <div class="text-caption text-grey-7 q-mb-xs">Hastane Seçin</div>
            <div v-if="hospLoading" class="flex flex-center q-py-md">
              <q-spinner size="24px"/>
            </div>
            <q-select
              v-else
              v-model="booking.hospitalId"
              :options="hospitalOptions"
              dense emit-value
              map-options outlined
              @update:model-value="onHospitalSelect"
            />
          </div>

          <div v-if="step === 3">
            <div class="text-caption text-grey-7 q-mb-xs">Doktor Seçin</div>
            <div v-if="docLoading" class="flex flex-center q-py-md">
              <q-spinner size="24px"/>
            </div>
            <q-list v-else bordered separator>
              <q-item
                v-for="doctor in doctorList"
                :key="doctor.id"
                :active="booking.doctorId === doctor.id"
                active-class="bg-blue-1"
                clickable
                @click="booking.doctorId = doctor.id"
              >
                <q-item-section>
                  <q-item-label>{{ doctor.title }} {{ doctor.firstName }} {{ doctor.lastName }}</q-item-label>
                  <q-item-label caption>{{ doctor.specialization }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label caption>{{ doctor.experienceYears }} yıl</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="doctorList.length === 0">
                <q-item-section>
                  <q-item-label class="text-grey-6">Bu departman ve hastanede doktor yok</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div v-if="step === 4" class="q-gutter-sm">
            <div class="text-caption text-grey-7 q-mb-xs">Tarih Seçin</div>
            <q-input v-model="booking.date" :min="today" dense outlined
                     type="date" @update:model-value="loadSlots"/>

            <template v-if="booking.date">
              <div class="text-caption text-grey-7 q-mt-sm q-mb-xs">Müsait Saatler</div>
              <div v-if="slotsLoading" class="flex flex-center q-py-sm">
                <q-spinner size="24px"/>
              </div>
              <div v-else-if="availableSlots.length === 0" class="text-caption text-grey-6">
                Bu tarihte müsait saat yok.
              </div>
              <div v-else class="row q-gutter-xs">
                <q-btn
                  v-for="slot in availableSlots" :key="slot"
                  :color="booking.time === slot ? 'primary' : 'grey-6'"
                  :label="slot"
                  :outline="booking.time !== slot"
                  dense size="sm"
                  @click="booking.time = slot"
                />
              </div>
              <div class="q-mt-sm q-gutter-sm">
                <div class="text-caption text-grey-7 q-mb-xs">Randevu Tipi</div>
                <q-select v-model="booking.type" :options="typeOptions"
                          dense emit-value map-options outlined/>
                <div class="text-caption text-grey-7 q-mb-xs">Not</div>
                <q-input v-model="booking.notes" dense outlined rows="2" type="textarea"/>
              </div>
            </template>
          </div>

        </q-card-section>

        <q-separator/>

        <q-card-actions align="between">
          <q-btn flat label="İptal" @click="closeBookDialog"/>
          <div class="row q-gutter-sm">
            <q-btn v-if="step > 1" flat label="Geri" @click="step--"/>
            <q-btn v-if="step < 4" :disable="!canNext" color="primary" flat
                   label="İleri" @click="step++"/>
            <q-btn v-if="step === 4" :disable="!booking.time" :loading="saving" color="primary"
                   flat label="Randevu Al" @click="handleBook"/>
          </div>
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- İptal Dialog -->
    <AppDialog
      v-model="cancelDialog"
      :loading="saving"
      title="Randevu İptal"
      width="400px"
      @save="handleCancel"
    >
      <q-input v-model="cancelReason" label="İptal Gerekçesi *" outlined rows="3" type="textarea"/>
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {useAppointmentStore} from '../../stores/appointment'
import {useDepartmentStore} from '../../stores/department'
import {useAuthStore} from '../../stores/auth'
import {appointmentApi} from '../../api/appointment'
import {departmentApi} from '../../api/department'
import {doctorApi} from '../../api/doctor'
import AppFilters from '../../components/AppFilters.vue'
import AppDialog from '../../components/AppDialog.vue'

const $q = useQuasar()
const aptStore = useAppointmentStore()
const deptStore = useDepartmentStore()
const auth = useAuthStore()

const bookDialog = ref(false)
const cancelDialog = ref(false)
const saving = ref(false)
const slotsLoading = ref(false)
const hospLoading = ref(false)
const docLoading = ref(false)
const step = ref(1)
const cancelReason = ref('')
const selectedApt = ref(null)
const availableSlots = ref([])
const hospitalList = ref([])
const doctorList = ref([])
const filters = ref({search: '', status: null})

const today = new Date().toISOString().split('T')[0]

const booking = ref({
  departmentId: null,
  hospitalId: null,
  doctorId: null,
  date: '',
  time: null,
  type: 'IN_PERSON',
  notes: ''
})

const departmentOptions = computed(() =>
  deptStore.departments.map(d => ({label: d.name, value: d.id}))
)

const hospitalOptions = computed(() =>
  hospitalList.value.map(h => ({label: h.name, value: h.id}))
)

const typeOptions = [
  {label: 'Yüz Yüze', value: 'IN_PERSON'},
  {label: 'Online', value: 'ONLINE'}
]

const statusOptions = [
  {label: 'Planlandı', value: 'SCHEDULED'},
  {label: 'Tamamlandı', value: 'COMPLETED'},
  {label: 'İptal', value: 'CANCELLED'}
]

const filterConfig = [
  {key: 'search', type: 'search', label: 'Doktor Ara', width: '220px'},
  {key: 'status', type: 'select', label: 'Durum', width: '140px', options: statusOptions}
]

const columns = [
  {name: 'doctorFullName', label: 'Doktor', field: 'doctorFullName', align: 'left', sortable: true},
  {name: 'departmentName', label: 'Departman', field: 'departmentName', align: 'left', sortable: true},
  {name: 'hospitalName', label: 'Hastane', field: 'hospitalName', align: 'left', sortable: true},
  {name: 'appointmentDate', label: 'Tarih', field: 'appointmentDate', align: 'left', sortable: true},
  {name: 'type', label: 'Tip', field: 'type', align: 'left'},
  {name: 'durationMinutes', label: 'Süre (dk)', field: 'durationMinutes', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const steps = [
  {name: 1, label: 'Departman'},
  {name: 2, label: 'Hastane'},
  {name: 3, label: 'Doktor'},
  {name: 4, label: 'Tarih/Saat'}
]

const filteredRows = computed(() => {
  let rows = aptStore.patientAppointments
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(a => a.doctorFullName?.toLowerCase().includes(q))
  }
  if (filters.value.status) rows = rows.filter(a => a.status === filters.value.status)
  return rows
})

const canNext = computed(() => {
  if (step.value === 1) return !!booking.value.departmentId
  if (step.value === 2) return !!booking.value.hospitalId
  if (step.value === 3) return !!booking.value.doctorId
  return false
})

const formatDate = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-'
const statusLabel = (s) => ({SCHEDULED: 'Planlandı', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal'})[s] || s

const onDepartmentSelect = async (id) => {
  booking.value.hospitalId = null
  booking.value.doctorId = null
  hospitalList.value = []
  doctorList.value = []
  hospLoading.value = true
  try {
    const {data} = await departmentApi.getHospitalsByDepartmentId(id)
    hospitalList.value = data
  } catch (err) {
    console.error('hata:', err)
  } finally {
    hospLoading.value = false
  }
}

const onHospitalSelect = async () => {
  booking.value.doctorId = null
  doctorList.value = []
  docLoading.value = true
  try {
    const {data} = await doctorApi.getByDepartmentAndHospital(
      booking.value.departmentId,
      booking.value.hospitalId
    )
    doctorList.value = data
  } finally {
    docLoading.value = false
  }
}

const loadSlots = async () => {
  if (!booking.value.doctorId || !booking.value.date) return
  slotsLoading.value = true
  availableSlots.value = []
  booking.value.time = null
  try {
    const {data} = await appointmentApi.getAvailableSlots(
      booking.value.doctorId,
      booking.value.date
    )
    availableSlots.value = data.availableSlots || []
  } catch {
    availableSlots.value = []
  } finally {
    slotsLoading.value = false
  }
}

const openBookDialog = () => {
  step.value = 1
  booking.value = {
    departmentId: null,
    hospitalId: null,
    doctorId: null,
    date: '',
    time: null,
    type: 'IN_PERSON',
    notes: ''
  }
  availableSlots.value = []
  hospitalList.value = []
  doctorList.value = []
  bookDialog.value = true
}

const closeBookDialog = () => {
  bookDialog.value = false
}

const openCancelDialog = (row) => {
  selectedApt.value = row
  cancelReason.value = ''
  cancelDialog.value = true
}

const handleBook = async () => {
  saving.value = true
  try {
    await aptStore.book({
      patientId: auth.patientId,
      doctorId: booking.value.doctorId,
      appointmentDate: `${booking.value.date}T${booking.value.time}:00`,
      type: booking.value.type,
      durationMinutes: 30,
      notes: booking.value.notes
    })
    $q.notify({type: 'positive', message: 'Randevu alındı.', position: 'top-right'})
    closeBookDialog()
    await aptStore.fetchByPatient(auth.patientId)
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleCancel = async () => {
  saving.value = true
  try {
    await aptStore.cancel(selectedApt.value.id, selectedApt.value.patientId, cancelReason.value)
    $q.notify({type: 'positive', message: 'İptal edildi.', position: 'top-right'})
    cancelDialog.value = false
    await aptStore.fetchByPatient(auth.patientId)
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    aptStore.fetchByPatient(auth.patientId),
    deptStore.fetchAll()
  ])
})
</script>
