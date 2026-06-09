<template>
  <q-page padding>

    <div class="row items-center q-mb-lg">
      <q-btn dense flat icon="arrow_back" @click="$router.push({ name: 'doctors' })"/>
      <div class="text-h6 q-ml-sm">
        {{ doctor?.title }} {{ doctor?.firstName }} {{ doctor?.lastName }}
      </div>
      <q-space/>
      <template v-if="!editMode">
        <q-btn flat label="Düzenle" @click="startEdit"/>
        <q-btn color="negative" flat label="Sil" @click="handleDelete"/>
      </template>
      <template v-else>
        <q-btn :loading="saving" color="primary" flat label="Güncelle" @click="handleSave"/>
        <q-btn flat label="İptal" @click="cancelEdit"/>
      </template>
    </div>

    <div v-if="store.loading" class="flex flex-center q-py-xl">
      <q-spinner size="40px"/>
    </div>

    <div v-else-if="doctor" class="row q-gutter-md">

      <!-- Doktor Bilgileri -->
      <div class="col-12 col-md-4">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Genel Bilgiler</div>
            <q-list dense separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Ad Soyad</q-item-label>
                  <div v-if="editMode" class="row q-gutter-sm">
                    <q-select v-model="form.title" :options="titleOptions" class="col-4" dense emit-value
                              map-options outlined/>
                    <q-input v-model="form.firstName" class="col" dense outlined/>
                    <q-input v-model="form.lastName" class="col" dense outlined/>
                  </div>
                  <q-item-label v-else>{{ doctor.title }} {{ doctor.firstName }} {{ doctor.lastName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Uzmanlık</q-item-label>
                  <q-input v-if="editMode" v-model="form.specialization" dense outlined/>
                  <q-item-label v-else>{{ doctor.specialization || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Çalışma Tipi</q-item-label>
                  <q-select v-if="editMode" v-model="form.employmentType" :options="employmentOptions"
                            dense emit-value map-options outlined/>
                  <q-item-label v-else>{{ employmentLabel(doctor.employmentType) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Departman</q-item-label>
                  <q-select v-if="editMode" v-model="form.departmentId" :options="departmentOptions"
                            dense emit-value map-options outlined/>
                  <q-item-label v-else>{{ doctorDepartment?.name || doctor.departmentName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Hastane</q-item-label>
                  <q-item-label>{{ doctorDepartment?.hospitalName || doctor.hospitalName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Deneyim</q-item-label>
                  <q-input v-if="editMode" v-model.number="form.experienceYears" dense outlined type="number"/>
                  <q-item-label v-else>{{ doctor.experienceYears || '-' }} yıl</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Lisans No</q-item-label>
                  <q-input v-if="editMode" v-model="form.licenseNumber" dense outlined/>
                  <q-item-label v-else>{{ doctor.licenseNumber || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Telefon</q-item-label>
                  <q-input v-if="editMode" v-model="form.phone" dense outlined/>
                  <q-item-label v-else>{{ doctor.phone || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>E-posta</q-item-label>
                  <q-input v-if="editMode" v-model="form.email" dense outlined/>
                  <q-item-label v-else>{{ doctor.email || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Randevular -->
      <div class="col-12 col-md-7">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2">Son Randevular ({{ aptStore.doctorAppointments.length }})</div>
          </q-card-section>
          <q-separator/>
          <q-table
            :columns="aptColumns"
            :rows="aptStore.doctorAppointments"
            :rows-per-page-options="[5, 10]" flat
            no-data-label="Randevu yok"
            row-key="id"
          >
            <template #body-cell-appointmentDate="props">
              <q-td :props="props">{{ formatDate(props.value) }}</q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
            </template>
          </q-table>
        </q-card>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useQuasar} from 'quasar'
import {useDoctorStore} from 'stores/doctor.js'
import {useDepartmentStore} from 'stores/department.js'
import {useAppointmentStore} from 'stores/appointment.js'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useDoctorStore()
const deptStore = useDepartmentStore()
const aptStore = useAppointmentStore()

const editMode = ref(false)
const saving = ref(false)
const form = ref({})

const doctor = computed(() => store.selected)
const doctorDepartment = computed(() => deptStore.doctorDepartment)

const departmentOptions = computed(() =>
  deptStore.departments.map(d => ({label: d.name, value: d.id}))
)

const titleOptions = [
  {label: 'Dr.', value: 'Dr.'},
  {label: 'Op. Dr.', value: 'Op. Dr.'},
  {label: 'Doç. Dr.', value: 'Doç. Dr.'},
  {label: 'Prof. Dr.', value: 'Prof. Dr.'}
]

const employmentOptions = [
  {label: 'Tam Zamanlı', value: 'FULL_TIME'},
  {label: 'Yarı Zamanlı', value: 'PART_TIME'},
  {label: 'Danışman', value: 'CONSULTANT'}
]

const aptColumns = [
  {name: 'patientFullName', label: 'Hasta', field: 'patientFullName', align: 'left', sortable: true},
  {name: 'appointmentDate', label: 'Tarih', field: 'appointmentDate', align: 'left', sortable: true},
  {name: 'status', label: 'Durum', field: 'status', align: 'left'}
]

const employmentLabel = (v) => ({
  FULL_TIME: 'Tam Zamanlı', PART_TIME: 'Yarı Zamanlı', CONSULTANT: 'Danışman'
})[v] || v

const statusLabel = (v) => ({
  SCHEDULED: 'Planlandı', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal'
})[v] || v

const formatDate = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-'

const startEdit = () => {
  form.value = {...doctor.value}
  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  form.value = {}
}

const handleSave = async () => {
  saving.value = true
  try {
    await store.update(doctor.value.id, form.value)
    await store.fetchById(route.params.id)
    $q.notify({type: 'positive', message: 'Güncellendi.', position: 'top-right'})
    editMode.value = false
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleDelete = () => {
  $q.dialog({
    title: 'Sil',
    message: `"${doctor.value.title} ${doctor.value.firstName} ${doctor.value.lastName}" silinecek. Emin misiniz?`,
    cancel: {label: 'Hayır', flat: true},
    ok: {label: 'Evet', flat: true, color: 'negative'}
  }).onOk(async () => {
    try {
      await store.delete(doctor.value.id)
      $q.notify({type: 'positive', message: 'Silindi.', position: 'top-right'})
      router.push({name: 'doctors'})
    } catch (err) {
      $q.notify({type: 'negative', message: err.response?.data?.message || 'Silinemedi.', position: 'top-right'})
    }
  })
}

onMounted(async () => {
  await store.fetchById(route.params.id)
  await Promise.all([
    aptStore.fetchByDoctor(route.params.id),
    deptStore.fetchByDoctor(route.params.id),
    deptStore.fetchAll()
  ])
})
</script>
