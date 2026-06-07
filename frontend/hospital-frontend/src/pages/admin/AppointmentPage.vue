<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Randevular</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Randevu Al" @click="openBookDialog"/>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Hasta / Doktor</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:220px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Durum</div>
        <q-select v-model="statusFilter" :options="statusOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:140px"/>
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
      @row-click="(e, row) => $router.push({ name: 'appointment-detail', params: { id: row.id } })"
    >
      <template #body-cell-appointmentDate="props">
        <q-td :props="props">{{ formatDate(props.value) }}</q-td>
      </template>

      <template #body-cell-status="props">
        <q-td :props="props">{{ statusLabel(props.value) }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <template v-if="props.row.status === 'SCHEDULED'">
            <q-btn color="positive" dense flat label="Tamamla" size="sm"
                   @click.stop="openCompleteDialog(props.row)"/>
            <q-btn color="warning" dense flat label="İptal" size="sm"
                   @click.stop="openCancelDialog(props.row)"/>
          </template>
          <q-btn color="negative" dense flat label="Sil" size="sm"
                 @click.stop="handleDelete(props.row)"/>
        </q-td>
      </template>
    </q-table>

    <!-- Randevu Al -->
    <q-dialog v-model="bookDialog" persistent>
      <q-card style="width:500px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">Randevu Al</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <q-form ref="bookFormRef" class="q-gutter-sm" @submit="handleBook">
            <q-select v-model="bookForm.patientId" :options="patientOptions" :rules="[v => !!v || 'Zorunlu']"
                      dense emit-value input-debounce="0" label="Hasta *" map-options outlined
                      use-input/>
            <q-select v-model="bookForm.doctorId" :options="doctorOptions" :rules="[v => !!v || 'Zorunlu']"
                      dense emit-value input-debounce="0" label="Doktor *" map-options outlined
                      use-input/>
            <q-input v-model="bookForm.appointmentDate" :rules="[v => !!v || 'Zorunlu']"
                     dense label="Tarih ve Saat *" outlined type="datetime-local"/>
            <div class="row q-gutter-sm">
              <q-select v-model="bookForm.type" :options="typeOptions" :rules="[v => !!v || 'Zorunlu']"
                        class="col" dense emit-value label="Tip *" map-options outlined/>
              <q-input v-model.number="bookForm.durationMinutes" class="col-4"
                       dense label="Süre (dk)" outlined type="number"/>
            </div>
            <q-input v-model.number="bookForm.fee" dense label="Ücret (₺)" outlined type="number"/>
            <q-input v-model="bookForm.notes" dense label="Notlar" outlined rows="2" type="textarea"/>
          </q-form>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right">
          <q-btn flat label="İptal" @click="bookDialog = false"/>
          <q-btn :loading="saving" color="primary" flat label="Kaydet" @click="bookFormRef.submit()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- İptal -->
    <q-dialog v-model="cancelDialog" persistent>
      <q-card style="width:400px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">Randevu İptal</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <q-form ref="cancelFormRef" @submit="handleCancel">
            <q-input v-model="cancelReason" :rules="[v => !!v || 'Zorunlu']" label="İptal Gerekçesi *" outlined rows="3"
                     type="textarea"/>
          </q-form>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right">
          <q-btn flat label="Vazgeç" @click="cancelDialog = false"/>
          <q-btn :loading="saving" color="negative" flat label="İptal Et" @click="cancelFormRef.submit()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Tamamla -->
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
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {useAppointmentStore} from '../../stores/appointment'
import {usePatientStore} from '../../stores/patient'
import {useDoctorStore} from '../../stores/doctor'
import {useMedicineStore} from '../../stores/medicine'

const $q = useQuasar()
const store = useAppointmentStore()
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()
const medStore = useMedicineStore()

const bookDialog = ref(false)
const cancelDialog = ref(false)
const completeDialog = ref(false)
const saving = ref(false)
const search = ref('')
const statusFilter = ref(null)
const selectedApt = ref(null)
const cancelReason = ref('')

const bookFormRef = ref(null)
const cancelFormRef = ref(null)
const completeFormRef = ref(null)

const patientOptions = computed(() => patientStore.patients.map(p => ({
  label: `${p.firstName} ${p.lastName}`,
  value: p.id
})))
const doctorOptions = computed(() => doctorStore.doctors.map(d => ({
  label: `${d.title} ${d.firstName} ${d.lastName}`,
  value: d.id
})))
const medicineOptions = computed(() => medStore.medicines.map(m => ({label: m.name, value: m.id})))

const statusOptions = [
  {label: 'Planlandı', value: 'SCHEDULED'},
  {label: 'Tamamlandı', value: 'COMPLETED'},
  {label: 'İptal', value: 'CANCELLED'}
]

const typeOptions = [
  {label: 'Yüz Yüze', value: 'IN_PERSON'},
  {label: 'Online', value: 'ONLINE'}
]

const columns = [
  {name: 'id', label: 'No', field: 'id', align: 'left'},
  {name: 'patientFullName', label: 'Hasta', field: 'patientFullName', align: 'left', sortable: true},
  {name: 'doctorFullName', label: 'Doktor', field: 'doctorFullName', align: 'left', sortable: true},
  {name: 'appointmentDate', label: 'Tarih', field: 'appointmentDate', align: 'left', sortable: true},
  {name: 'status', label: 'Durum', field: 'status', align: 'left', sortable: true},
  {name: 'fee', label: 'Ücret (₺)', field: 'fee', align: 'right'},
  {name: 'actions', label: '', field: 'actions', align: 'center'}
]

const filteredRows = computed(() => {
  let rows = store.appointments
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(a =>
      a.patientFullName?.toLowerCase().includes(q) ||
      a.doctorFullName?.toLowerCase().includes(q)
    )
  }
  if (statusFilter.value) rows = rows.filter(a => a.status === statusFilter.value)
  return rows
})

const formatDate = (v) => v ? new Date(v).toLocaleString('tr-TR') : '-'
const statusLabel = (s) => ({SCHEDULED: 'Planlandı', COMPLETED: 'Tamamlandı', CANCELLED: 'İptal'})[s] || s

const emptyBookForm = () => ({
  patientId: null, doctorId: null, appointmentDate: '',
  durationMinutes: 30, type: null, fee: null, notes: ''
})

const bookForm = ref(emptyBookForm())
const completeForm = ref({notes: '', prescriptions: []})

const openBookDialog = () => {
  bookForm.value = emptyBookForm();
  bookDialog.value = true
}
const openCancelDialog = (row) => {
  selectedApt.value = row;
  cancelReason.value = '';
  cancelDialog.value = true
}
const openCompleteDialog = (row) => {
  selectedApt.value = row;
  completeForm.value = {notes: '', prescriptions: []};
  completeDialog.value = true
}

const addPrescription = () => completeForm.value.prescriptions.push({
  patientId: selectedApt.value?.patientId || null,
  medicineId: null, issueDate: new Date().toISOString().split('T')[0],
  expiryDate: '', dosageInstruction: '', durationDays: 30, quantity: 1
})

const removePrescription = (i) => completeForm.value.prescriptions.splice(i, 1)

const handleBook = async () => {
  saving.value = true
  try {
    await store.book({...bookForm.value, appointmentDate: bookForm.value.appointmentDate + ':00'})
    $q.notify({type: 'positive', message: 'Randevu alındı.', position: 'top-right'})
    bookDialog.value = false
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleCancel = async () => {
  saving.value = true
  try {
    await store.cancel(selectedApt.value.id, selectedApt.value.patientId, cancelReason.value)
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
    await store.complete(selectedApt.value.id, selectedApt.value.doctorId, completeForm.value)
    $q.notify({type: 'positive', message: 'Tamamlandı.', position: 'top-right'})
    completeDialog.value = false
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleDelete = (item) => {
  $q.dialog({
    title: 'Sil', message: 'Emin misiniz?',
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

onMounted(async () => {
  await Promise.all([store.fetchAll(), patientStore.fetchAll(), doctorStore.fetchAll(), medStore.fetchAll()])
})
</script>
