<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Doktorlar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <AppTable
      :columns="columns"
      :loading="store.loading"
      :on-row-click="(row) => $router.push({ name: 'doctor-detail', params: { id: row.id } })"
      :rows="filteredRows"
      @delete="(item) => handleDelete(item, { label: (i) => `${i.title} ${i.firstName} ${i.lastName}` })"
      @edit="openForm"
    >
      <template #cell-fullName="props">
        <q-td :props="props">
          {{ props.row.title }} {{ props.row.firstName }} {{ props.row.lastName }}
          <div class="text-caption text-grey-6">{{ props.row.specialization }}</div>
        </q-td>
      </template>
      <template #cell-employmentType="props">
        <q-td :props="props">{{ employmentLabel(props.value) }}</q-td>
      </template>
    </AppTable>

    <AppDialog
      v-model="dialog"
      :loading="saving"
      :title="editItem ? 'Düzenle' : 'Yeni Doktor'"
      width="620px"
      @save="formRef.submit()"
    >
      <q-form ref="formRef" class="q-gutter-sm" @submit="handleSaveForm">
        <q-select v-model="form.title" :options="titleOptions" :rules="[v => !!v || 'Zorunlu']"
                  dense emit-value label="Ünvan *" map-options outlined/>
        <q-input v-model="form.firstName" :rules="[v => !!v || 'Zorunlu']" dense label="Ad *"
                 outlined/>
        <q-input v-model="form.lastName" :rules="[v => !!v || 'Zorunlu']" dense label="Soyad *"
                 outlined/>
        <q-input v-model="form.email" :rules="[v => !!v || 'Zorunlu']" dense label="E-posta *"
                 outlined/>
        <q-input v-model="form.phone" dense label="Telefon" outlined/>
        <q-input v-model="form.specialization" dense label="Uzmanlık" outlined/>
        <q-input v-model="form.licenseNumber" dense label="Lisans No" outlined/>
        <q-input v-model.number="form.experienceYears" dense label="Deneyim (Yıl)" outlined type="number"/>
        <q-select v-model="form.employmentType" :options="employmentOptions" :rules="[v => !!v || 'Zorunlu']"
                  dense emit-value label="Çalışma Tipi *" map-options outlined/>
        <q-select v-model="form.departmentId" :options="departmentOptions" :rules="[v => !!v || 'Zorunlu']"
                  dense emit-value label="Departman *" map-options outlined/>
      </q-form>
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useDoctorStore} from 'stores/doctor.js'
import {useDepartmentStore} from 'stores/department.js'
import {useTableActions} from '../../../composables/useTableActions.js'
import AppTable from 'components/AppTable.vue'
import AppDialog from 'components/AppDialog.vue'
import AppFilters from 'components/AppFilters.vue'

const store = useDoctorStore()
const deptStore = useDepartmentStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const filters = ref({search: '', dept: null, employment: null})

const {handleSave, handleDelete} = useTableActions(store)

const handleSaveForm = () => handleSave({editItem, form, dialog, saving})

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

const employmentLabel = (v) => ({
  FULL_TIME: 'Tam Zamanlı', PART_TIME: 'Yarı Zamanlı', CONSULTANT: 'Danışman'
})[v] || v

const filterConfig = computed(() => [
  {key: 'search', type: 'search', label: 'Doktor Adı', width: '220px'},
  {key: 'dept', type: 'select', label: 'Departman', width: '200px', options: departmentOptions.value},
  {key: 'employment', type: 'select', label: 'Çalışma Tipi', width: '160px', options: employmentOptions}
])

const columns = [
  {name: 'fullName', label: 'Ad Soyad', field: 'firstName', align: 'left', sortable: true},
  {name: 'departmentName', label: 'Departman', field: 'departmentName', align: 'left', sortable: true},
  {name: 'hospitalName', label: 'Hastane', field: 'hospitalName', align: 'left'},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'experienceYears', label: 'Deneyim (Yıl)', field: 'experienceYears', align: 'left', sortable: true},
  {name: 'employmentType', label: 'Çalışma Tipi', field: 'employmentType', align: 'left', sortable: true}
]

const filteredRows = computed(() => {
  let rows = store.doctors
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(d =>
      d.firstName?.toLowerCase().includes(q) ||
      d.lastName?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    )
  }
  if (filters.value.dept) rows = rows.filter(d => d.departmentId === filters.value.dept)
  if (filters.value.employment) rows = rows.filter(d => d.employmentType === filters.value.employment)
  return rows
})

const emptyForm = () => ({
  firstName: '', lastName: '', email: '', phone: '',
  title: null, specialization: '', licenseNumber: '',
  experienceYears: null, employmentType: null, departmentId: null
})

const form = ref(emptyForm())

const openForm = (item = null) => {
  editItem.value = item
  form.value = item ? {...item} : emptyForm()
  dialog.value = true
}

onMounted(async () => {
  await Promise.all([store.fetchAll(), deptStore.fetchAll()])
})
</script>
