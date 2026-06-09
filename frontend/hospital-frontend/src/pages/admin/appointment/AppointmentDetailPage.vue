<template>
  <q-page padding>

    <div class="row items-center q-mb-lg">
      <q-btn dense flat icon="arrow_back" @click="$router.push({ name: 'appointments' })"/>
      <div class="text-h6 q-ml-sm">Randevu #{{ apt?.id }}</div>
      <q-space/>
      <template v-if="apt?.status === 'SCHEDULED'">
        <q-btn color="positive" flat label="Tamamla" @click="openCompleteDialog"/>
        <q-btn color="warning" flat label="İptal" @click="openCancelDialog"/>
      </template>
      <q-btn color="negative" flat label="Sil" @click="handleDelete"/>
    </div>

    <div v-if="store.loading" class="flex flex-center q-py-xl">
      <q-spinner size="40px"/>
    </div>

    <div v-else-if="apt" class="row q-gutter-md">

      <!-- Randevu Bilgileri -->
      <div class="col-12 col-md-5">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Randevu Bilgileri</div>
            <q-list dense separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Hasta</q-item-label>
                  <q-item-label>{{ apt.patientFullName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Doktor</q-item-label>
                  <q-item-label>{{ apt.doctorFullName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Tarih</q-item-label>
                  <q-item-label>{{ formatDate(apt.appointmentDate) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Süre</q-item-label>
                  <q-item-label>{{ apt.durationMinutes ? apt.durationMinutes + ' dk' : '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Tip</q-item-label>
                  <q-item-label>{{ apt.type === 'ONLINE' ? 'Online' : 'Yüz Yüze' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Durum</q-item-label>
                  <q-item-label>{{ statusLabel(apt.status) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Ücret</q-item-label>
                  <q-item-label>{{ apt.fee ? apt.fee + ' ₺' : '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="apt.notes">
                <q-item-section>
                  <q-item-label caption>Not</q-item-label>
                  <q-item-label>{{ apt.notes }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="apt.cancelReason">
                <q-item-section>
                  <q-item-label caption>İptal Gerekçesi</q-item-label>
                  <q-item-label>{{ apt.cancelReason }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="apt.postponeReason">
                <q-item-section>
                  <q-item-label caption>Erteleme Gerekçesi</q-item-label>
                  <q-item-label>{{ apt.postponeReason }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="apt.doctorNotes">
                <q-item-section>
                  <q-item-label caption>Doktor Notu</q-item-label>
                  <q-item-label>{{ apt.doctorNotes }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reçeteler -->
      <div class="col-12 col-md-6">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2">Reçeteler ({{ prescriptions.length }})</div>
          </q-card-section>
          <q-separator/>
          <q-table
            :columns="prescColumns"
            :rows="prescriptions"
            :rows-per-page-options="[5, 10]"
            flat
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

    <!-- İptal Dialog -->
    <q-dialog v-model="cancelDialog" persistent>
      <q-card style="width:400px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">Randevu İptal</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <q-form ref="cancelFormRef" @submit="handleCancel">
            <q-input v-model="cancelReason" :rules="[v => !!v || 'Zorunlu']"
                     label="İptal Gerekçesi *" outlined rows="3" type="textarea"/>
          </q-form>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right">
          <q-btn flat label="Vazgeç" @click="cancelDialog = false"/>
          <q-btn :loading="saving" color="negative" flat label="İptal Et" @click="cancelFormRef.submit()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Tamamla Dialog -->
    <q-dialog v-model="completeDialog" persistent>
      <q-card style="width:540px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">Randevuyu Tamamla</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="scroll" style="max-height:60vh">
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
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right">
          <q-btn flat label="İptal" @click="completeDialog = false"/>
          <q-btn :loading="saving" color="positive" flat label="Tamamla" @click="completeFormRef.submit()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import {computed, nextTick, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useQuasar} from 'quasar'
import {useAppointmentStore} from 'stores/appointment.js'
import {useMedicineStore} from 'stores/medicine.js'
import {prescriptionApi} from '../../../api/prescription.js'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = useAppointmentStore()
const medStore = useMedicineStore()

const cancelDialog = ref(false)
const completeDialog = ref(false)
const saving = ref(false)
const cancelReason = ref('')
const cancelFormRef = ref(null)
const completeFormRef = ref(null)
const prescriptions = ref([])

const apt = computed(() => store.appointments.find(a => a.id === Number(route.params.id)))
const medicineOptions = computed(() => medStore.medicines.map(m => ({label: m.name, value: m.id})))
const completeForm = ref({notes: '', prescriptions: []})

const prescColumns = [
  {name: 'medicineName', label: 'İlaç', field: 'medicineName', align: 'left', sortable: true},
  {name: 'dosageInstruction', label: 'Kullanım', field: 'dosageInstruction', align: 'left'},
  {name: 'issueDate', label: 'Tarih', field: 'issueDate', align: 'left'},
  {name: 'status', label: 'Durum', field: 'status', align: 'left'}
]

const formatDate = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-'
const statusLabel = (v) => ({
  SCHEDULED: 'Planlandı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  POSTPONED: 'Ertelendi'
})[v] || v
const prescStatusLabel = (v) => ({ACTIVE: 'Aktif', USED: 'Kullanıldı', EXPIRED: 'Süresi Doldu'})[v] || v

const openCancelDialog = () => {
  cancelReason.value = ''
  cancelDialog.value = true
}

const openCompleteDialog = () => {
  completeForm.value = {notes: '', prescriptions: []}
  completeDialog.value = true
}

const addPrescription = () => completeForm.value.prescriptions.push({
  patientId: apt.value?.patientId || null,
  medicineId: null,
  issueDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  dosageInstruction: '',
  durationDays: 30,
  quantity: 1
})

const removePrescription = (i) => completeForm.value.prescriptions.splice(i, 1)

const handleCancel = async () => {
  saving.value = true
  try {
    await store.cancel(apt.value.id, apt.value.patientId, cancelReason.value)
    $q.notify({type: 'positive', message: 'İptal edildi.', position: 'top-right'})
    cancelDialog.value = false
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleComplete = async () => {
  saving.value = true
  try {
    await store.complete(apt.value.id, apt.value.doctorId, completeForm.value)
    $q.notify({type: 'positive', message: 'Tamamlandı.', position: 'top-right'})
    completeDialog.value = false
    // Reçeteleri yenile
    if (apt.value?.patientId) {
      const {data} = await prescriptionApi.getByPatient(apt.value.patientId)
      prescriptions.value = data
    }
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleDelete = () => {
  $q.dialog({
    title: 'Sil',
    message: 'Emin misiniz?',
    cancel: {label: 'Hayır', flat: true},
    ok: {label: 'Evet', flat: true, color: 'negative'}
  }).onOk(async () => {
    try {
      await store.delete(apt.value.id)
      $q.notify({type: 'positive', message: 'Silindi.', position: 'top-right'})
      router.push({name: 'appointments'})
    } catch (err) {
      $q.notify({type: 'negative', message: err.response?.data?.message || 'Silinemedi.', position: 'top-right'})
    }
  })
}

onMounted(async () => {
  await Promise.all([store.fetchAll(), medStore.fetchAll()])
  await nextTick()
  if (apt.value?.patientId) {
    try {
      const {data} = await prescriptionApi.getByPatient(apt.value.patientId)
      prescriptions.value = data
    } catch (err) {
      console.error('Reçeteler yüklenemedi:', err)
    }
  }
})
</script>
