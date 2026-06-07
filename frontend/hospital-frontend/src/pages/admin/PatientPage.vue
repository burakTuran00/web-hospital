<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Hastalar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Hasta Adı / TC No</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:220px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Cinsiyet</div>
        <q-select v-model="genderFilter" :options="genderOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:130px"/>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Sigorta</div>
        <q-select v-model="insuranceFilter" :options="insuranceOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:130px"/>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Kan Grubu</div>
        <q-select v-model="bloodFilter" :options="bloodTypeOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:110px"/>
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
      @row-click="(e, row) => $router.push({ name: 'patient-detail', params: { id: row.id } })"
    >
      <template #body-cell-fullName="props">
        <q-td :props="props">
          {{ props.row.firstName }} {{ props.row.lastName }}
          <div class="text-caption text-grey-6">{{ props.row.tcNo }}</div>
        </q-td>
      </template>

      <template #body-cell-gender="props">
        <q-td :props="props">{{ props.value === 'MALE' ? 'Erkek' : 'Kadın' }}</q-td>
      </template>

      <template #body-cell-insuranceType="props">
        <q-td :props="props">{{ insuranceLabel(props.value) }}</q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn dense flat icon="edit" round size="sm" @click.stop="openForm(props.row)">
            <q-tooltip>Düzenle</q-tooltip>
          </q-btn>
          <q-btn color="negative" dense flat icon="delete" round size="sm" @click.stop="handleDelete(props.row)">
            <q-tooltip>Sil</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Sağdan açılan panel -->
    <q-drawer
      v-model="drawer"
      :width="420"
      bordered
      overlay
      side="right"
    >
      <div class="column fit">

        <!-- Drawer Header -->
        <div class="row items-center q-pa-md q-border-bottom">
          <div class="text-subtitle1">{{ editItem ? 'Hasta Düzenle' : 'Yeni Hasta' }}</div>
          <q-space/>
          <q-btn dense flat icon="close" round @click="drawer = false"/>
        </div>

        <!-- Form -->
        <q-scroll-area class="col">
          <div class="q-pa-md">
            <q-form ref="formRef" class="q-gutter-sm" @submit="handleSave">

              <q-input v-model="form.firstName" :rules="[v => !!v || 'Zorunlu']" dense label="Ad *"
                       outlined/>

              <q-input v-model="form.lastName" :rules="[v => !!v || 'Zorunlu']" dense label="Soyad *"
                       outlined/>

              <q-input v-if="!editItem" v-model="form.tcNo" :rules="[v => !!v || 'Zorunlu', v => v.length === 11 || '11 karakter']" dense label="TC No *"
                       maxlength="11" outlined/>

              <q-input v-model="form.birthDate" dense label="Doğum Tarihi" outlined type="date"/>

              <q-select v-model="form.gender" :options="genderOptions" dense
                        emit-value label="Cinsiyet" map-options outlined/>

              <q-select v-model="form.bloodType" :options="bloodTypeOptions" dense
                        emit-value label="Kan Grubu" map-options outlined/>

              <q-input v-model="form.phone" dense label="Telefon" outlined/>

              <q-input v-model="form.email" dense label="E-posta" outlined/>

              <q-input v-model="form.city" dense label="Şehir" outlined/>

              <q-input v-model="form.address" dense label="Adres" outlined/>

              <q-input v-model="form.allergies" dense label="Alerjiler" outlined/>

              <q-input v-model="form.chronicDiseases" dense label="Kronik Hastalıklar" outlined/>

              <q-input v-model="form.emergencyContact" dense label="Acil İletişim Kişisi" outlined/>

              <q-input v-model="form.emergencyContactPhone" dense label="Acil Telefon" outlined/>

              <q-select v-model="form.insuranceType" :options="insuranceOptions" dense
                        emit-value label="Sigorta Tipi" map-options outlined/>

              <q-input v-model="form.insuranceNumber" dense label="Sigorta No" outlined/>

            </q-form>
          </div>
        </q-scroll-area>

        <!-- Footer -->
        <div class="row q-pa-md q-gutter-sm justify-end" style="border-top: 1px solid #e0e0e0">
          <q-btn flat label="İptal" @click="drawer = false"/>
          <q-btn :loading="saving" color="primary" flat label="Kaydet" @click="formRef.submit()"/>
        </div>

      </div>
    </q-drawer>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {usePatientStore} from '../../stores/patient'

const $q = useQuasar()
const store = usePatientStore()
const formRef = ref(null)

const drawer = ref(false)
const saving = ref(false)
const editItem = ref(null)
const search = ref('')
const genderFilter = ref(null)
const insuranceFilter = ref(null)
const bloodFilter = ref(null)

const genderOptions = [{label: 'Erkek', value: 'MALE'}, {label: 'Kadın', value: 'FEMALE'}]
const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map(v => ({label: v, value: v}))
const insuranceOptions = [{label: 'SGK', value: 'SGK'}, {label: 'Özel', value: 'PRIVATE'}, {
  label: 'Yok',
  value: 'NONE'
}]

const insuranceLabel = (v) => ({SGK: 'SGK', PRIVATE: 'Özel', NONE: 'Yok'})[v] || v

const columns = [
  {name: 'fullName', label: 'Ad Soyad', field: 'firstName', align: 'left', sortable: true},
  {name: 'gender', label: 'Cinsiyet', field: 'gender', align: 'left'},
  {name: 'bloodType', label: 'Kan Grubu', field: 'bloodType', align: 'left'},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'city', label: 'Şehir', field: 'city', align: 'left', sortable: true},
  {name: 'insuranceType', label: 'Sigorta', field: 'insuranceType', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = store.patients
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(p =>
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.tcNo?.includes(q)
    )
  }
  if (genderFilter.value) rows = rows.filter(p => p.gender === genderFilter.value)
  if (insuranceFilter.value) rows = rows.filter(p => p.insuranceType === insuranceFilter.value)
  if (bloodFilter.value) rows = rows.filter(p => p.bloodType === bloodFilter.value)
  return rows
})

const emptyForm = () => ({
  firstName: '', lastName: '', tcNo: '', birthDate: '',
  phone: '', email: '', address: '', city: '',
  gender: null, bloodType: null, allergies: '',
  chronicDiseases: '', emergencyContact: '',
  emergencyContactPhone: '', insuranceType: null, insuranceNumber: ''
})

const form = ref(emptyForm())

const openForm = (item = null) => {
  editItem.value = item
  form.value = item ? {...item} : emptyForm()
  drawer.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    if (editItem.value) {
      await store.update(editItem.value.id, form.value)
      $q.notify({type: 'positive', message: 'Güncellendi.', position: 'top-right'})
    } else {
      await store.create(form.value)
      $q.notify({type: 'positive', message: 'Eklendi.', position: 'top-right'})
    }
    drawer.value = false
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleDelete = (item) => {
  $q.dialog({
    title: 'Sil',
    message: `"${item.firstName} ${item.lastName}" silinecek. Emin misiniz?`,
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
