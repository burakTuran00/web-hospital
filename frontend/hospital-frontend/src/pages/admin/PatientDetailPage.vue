<template>
  <q-page padding>

    <div class="row items-center q-mb-lg">
      <q-btn dense flat icon="arrow_back" @click="$router.push({ name: 'patients' })"/>
      <div class="text-h6 q-ml-sm">{{ patient?.firstName }} {{ patient?.lastName }}</div>
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

    <div v-else-if="patient" class="row q-gutter-md">

      <!-- Hasta Bilgileri -->
      <div class="col-12 col-md-4">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Kişisel Bilgiler</div>
            <q-list dense separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Ad Soyad</q-item-label>
                  <div v-if="editMode" class="row q-gutter-sm">
                    <q-input v-model="form.firstName" class="col" dense outlined/>
                    <q-input v-model="form.lastName" class="col" dense outlined/>
                  </div>
                  <q-item-label v-else>{{ patient.firstName }} {{ patient.lastName }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>TC No</q-item-label>
                  <q-item-label>{{ patient.tcNo || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Doğum Tarihi</q-item-label>
                  <q-input v-if="editMode" v-model="form.birthDate" dense outlined type="date"/>
                  <q-item-label v-else>{{ patient.birthDate || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Cinsiyet</q-item-label>
                  <q-select v-if="editMode" v-model="form.gender" :options="genderOptions"
                            dense emit-value map-options outlined/>
                  <q-item-label v-else>{{ patient.gender === 'MALE' ? 'Erkek' : 'Kadın' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Kan Grubu</q-item-label>
                  <q-select v-if="editMode" v-model="form.bloodType" :options="bloodTypeOptions"
                            dense emit-value map-options outlined/>
                  <q-item-label v-else>{{ patient.bloodType || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Telefon</q-item-label>
                  <q-input v-if="editMode" v-model="form.phone" dense outlined/>
                  <q-item-label v-else>{{ patient.phone || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>E-posta</q-item-label>
                  <q-input v-if="editMode" v-model="form.email" dense outlined/>
                  <q-item-label v-else>{{ patient.email || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Şehir</q-item-label>
                  <q-input v-if="editMode" v-model="form.city" dense outlined/>
                  <q-item-label v-else>{{ patient.city || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Adres</q-item-label>
                  <q-input v-if="editMode" v-model="form.address" dense outlined/>
                  <q-item-label v-else>{{ patient.address || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Alerjiler</q-item-label>
                  <q-input v-if="editMode" v-model="form.allergies" dense outlined/>
                  <q-item-label v-else>{{ patient.allergies || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Kronik Hastalıklar</q-item-label>
                  <q-input v-if="editMode" v-model="form.chronicDiseases" dense outlined/>
                  <q-item-label v-else>{{ patient.chronicDiseases || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Acil İletişim</q-item-label>
                  <q-input v-if="editMode" v-model="form.emergencyContact" dense outlined/>
                  <q-item-label v-else>{{ patient.emergencyContact || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Acil Telefon</q-item-label>
                  <q-input v-if="editMode" v-model="form.emergencyContactPhone" dense outlined/>
                  <q-item-label v-else>{{ patient.emergencyContactPhone || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Sigorta Tipi</q-item-label>
                  <q-select v-if="editMode" v-model="form.insuranceType" :options="insuranceOptions"
                            dense emit-value map-options outlined/>
                  <q-item-label v-else>{{ insuranceLabel(patient.insuranceType) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Sigorta No</q-item-label>
                  <q-input v-if="editMode" v-model="form.insuranceNumber" dense outlined/>
                  <q-item-label v-else>{{ patient.insuranceNumber || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Randevular ve Reçeteler -->
      <div class="col-12 col-md-7">

        <q-card bordered class="q-mb-md" flat>
          <q-card-section>
            <div class="text-subtitle2">Randevular ({{ aptStore.patientAppointments.length }})</div>
          </q-card-section>
          <q-separator/>
          <q-table
            :columns="aptColumns"
            :rows="aptStore.patientAppointments"
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

        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2">Reçeteler ({{ prescStore.patientPrescriptions.length }})</div>
          </q-card-section>
          <q-separator/>
          <q-table
            :columns="prescColumns"
            :rows="prescStore.patientPrescriptions"
            :rows-per-page-options="[5, 10]" flat
            no-data-label="Reçete yok"
            row-key="id"
          >
            <template #body-cell-status="props">
              <q-td :props="props">{{ prescStatusLabel(props.value) }}</q-td>
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
import {usePatientStore} from '../../stores/patient'
import {useAppointmentStore} from '../../stores/appointment'
import {usePrescriptionStore} from '../../stores/prescription'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = usePatientStore()
const aptStore = useAppointmentStore()
const prescStore = usePrescriptionStore()

const editMode = ref(false)
const saving = ref(false)
const form = ref({})

const patient = computed(() => store.selected)

const genderOptions = [{label: 'Erkek', value: 'MALE'}, {label: 'Kadın', value: 'FEMALE'}]
const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map(v => ({label: v, value: v}))
const insuranceOptions = [{label: 'SGK', value: 'SGK'}, {label: 'Özel', value: 'PRIVATE'}, {
  label: 'Yok',
  value: 'NONE'
}]

const insuranceLabel = (v) => ({SGK: 'SGK', PRIVATE: 'Özel', NONE: 'Yok'})[v] || v
const statusLabel = (v) => ({SCHEDULED: 'Planlandı', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal'})[v] || v
const prescStatusLabel = (v) => ({ACTIVE: 'Aktif', USED: 'Kullanıldı', EXPIRED: 'Süresi Doldu'})[v] || v
const formatDate = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-'

const aptColumns = [
  {name: 'doctorFullName', label: 'Doktor', field: 'doctorFullName', align: 'left', sortable: true},
  {name: 'appointmentDate', label: 'Tarih', field: 'appointmentDate', align: 'left', sortable: true},
  {name: 'status', label: 'Durum', field: 'status', align: 'left'}
]

const prescColumns = [
  {name: 'medicineName', label: 'İlaç', field: 'medicineName', align: 'left', sortable: true},
  {name: 'doctorFullName', label: 'Doktor', field: 'doctorFullName', align: 'left'},
  {name: 'issueDate', label: 'Tarih', field: 'issueDate', align: 'left', sortable: true},
  {name: 'dosageInstruction', label: 'Kullanım', field: 'dosageInstruction', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left'}
]

const startEdit = () => {
  form.value = {...patient.value}
  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  form.value = {}
}

const handleSave = async () => {
  saving.value = true
  try {
    await store.update(patient.value.id, form.value)
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
    message: `"${patient.value.firstName} ${patient.value.lastName}" silinecek. Emin misiniz?`,
    cancel: {label: 'Hayır', flat: true},
    ok: {label: 'Evet', flat: true, color: 'negative'}
  }).onOk(async () => {
    try {
      await store.delete(patient.value.id)
      $q.notify({type: 'positive', message: 'Silindi.', position: 'top-right'})
      router.push({name: 'patients'})
    } catch (err) {
      $q.notify({type: 'negative', message: err.response?.data?.message || 'Silinemedi.', position: 'top-right'})
    }
  })
}

onMounted(async () => {
  await store.fetchById(route.params.id)
  await Promise.all([
    aptStore.fetchByPatient(route.params.id),
    prescStore.fetchByPatient(route.params.id)
  ])
})
</script>
