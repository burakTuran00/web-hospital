<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Hastalar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <AppTable
      :columns="columns"
      :loading="store.loading"
      :on-row-click="(row) => $router.push({ name: 'patient-detail', params: { id: row.id } })"
      :rows="filteredRows"
      @delete="(item) => handleDelete(item, { label: (i) => `${i.firstName} ${i.lastName}` })"
      @edit="openForm"
    >
      <template #cell-fullName="props">
        <q-td :props="props">
          {{ props.row.firstName }} {{ props.row.lastName }}
          <div class="text-caption text-grey-6">{{ props.row.tcNo }}</div>
        </q-td>
      </template>
      <template #cell-gender="props">
        <q-td :props="props">{{ props.value === 'MALE' ? 'Erkek' : 'Kadın' }}</q-td>
      </template>
      <template #cell-insuranceType="props">
        <q-td :props="props">{{ insuranceLabel(props.value) }}</q-td>
      </template>
    </AppTable>

    <AppDialog
      v-model="dialog"
      :loading="saving"
      :title="editItem ? 'Düzenle' : 'Yeni Hasta'"
      width="580px"
      @save="formRef.submit()"
    >
      <q-form ref="formRef" class="q-gutter-sm" @submit="handleSaveForm">
        <q-input v-model="form.firstName" :rules="[v => !!v || 'Zorunlu']" dense label="Ad *"
                 outlined/>
        <q-input v-model="form.lastName" :rules="[v => !!v || 'Zorunlu']" dense label="Soyad *"
                 outlined/>
        <q-input v-if="!editItem" v-model="form.tcNo"
                 :rules="[v => !!v || 'Zorunlu', v => v.length === 11 || '11 karakter']" dense label="TC No *"
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
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {usePatientStore} from 'stores/patient.js'
import {useTableActions} from '../../../composables/useTableActions.js'
import AppTable from 'components/AppTable.vue'
import AppDialog from 'components/AppDialog.vue'
import AppFilters from 'components/AppFilters.vue'

const store = usePatientStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const filters = ref({search: '', gender: null, insurance: null, blood: null})

const {handleSave, handleDelete} = useTableActions(store)

const handleSaveForm = () => handleSave({editItem, form, dialog, saving})

const genderOptions = [{label: 'Erkek', value: 'MALE'}, {label: 'Kadın', value: 'FEMALE'}]
const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'].map(v => ({label: v, value: v}))
const insuranceOptions = [{label: 'SGK', value: 'SGK'}, {label: 'Özel', value: 'PRIVATE'}, {
  label: 'Yok',
  value: 'NONE'
}]

const insuranceLabel = (v) => ({SGK: 'SGK', PRIVATE: 'Özel', NONE: 'Yok'})[v] || v

const filterConfig = [
  {key: 'search', type: 'search', label: 'Hasta Adı / TC No', width: '220px'},
  {key: 'gender', type: 'select', label: 'Cinsiyet', width: '130px', options: genderOptions},
  {key: 'insurance', type: 'select', label: 'Sigorta', width: '130px', options: insuranceOptions},
  {key: 'blood', type: 'select', label: 'Kan Grubu', width: '110px', options: bloodTypeOptions}
]

const columns = [
  {name: 'fullName', label: 'Ad Soyad', field: 'firstName', align: 'left', sortable: true},
  {name: 'gender', label: 'Cinsiyet', field: 'gender', align: 'left'},
  {name: 'bloodType', label: 'Kan Grubu', field: 'bloodType', align: 'left'},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'city', label: 'Şehir', field: 'city', align: 'left', sortable: true},
  {name: 'insuranceType', label: 'Sigorta', field: 'insuranceType', align: 'left', sortable: true}
]

const filteredRows = computed(() => {
  let rows = store.patients
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(p =>
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.tcNo?.includes(q)
    )
  }
  if (filters.value.gender) rows = rows.filter(p => p.gender === filters.value.gender)
  if (filters.value.insurance) rows = rows.filter(p => p.insuranceType === filters.value.insurance)
  if (filters.value.blood) rows = rows.filter(p => p.bloodType === filters.value.blood)
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
  dialog.value = true
}

onMounted(() => store.fetchAll())
</script>
