<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Departmanlar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <AppTable
      :columns="columns"
      :loading="store.loading"
      :rows="filteredRows"
      @delete="(item) => handleDelete(item, { label: (i) => i.name })"
      @edit="openForm"
    />

    <AppDialog
      v-model="dialog"
      :loading="saving"
      :title="editItem ? 'Düzenle' : 'Yeni Departman'"
      @save="formRef.submit()"
    >
      <q-form ref="formRef" class="q-gutter-sm" @submit="handleSaveForm">
        <q-select v-model="form.hospitalId" :disable="!!editItem" :options="hospitalOptions"
                  :rules="[v => !!v || 'Zorunlu']" dense emit-value label="Hastane *" map-options outlined/>
        <q-input v-model="form.name" :rules="[v => !!v || 'Zorunlu']" dense label="Departman Adı *"
                 outlined/>
        <q-input v-model="form.description" dense label="Açıklama" outlined rows="2" type="textarea"/>
        <q-input v-model="form.phone" dense label="Telefon" outlined/>
        <q-input v-model="form.location" dense label="Konum" outlined/>
        <q-input v-model.number="form.capacity" dense label="Kapasite" outlined type="number"/>
      </q-form>
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useDepartmentStore} from 'stores/department.js'
import {useHospitalStore} from 'stores/hospital.js'
import {useTableActions} from '../../../composables/useTableActions.js'
import AppTable from 'components/AppTable.vue'
import AppDialog from 'components/AppDialog.vue'
import AppFilters from 'components/AppFilters.vue'

const store = useDepartmentStore()
const hospitalStore = useHospitalStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const filters = ref({search: '', hospital: null, location: ''})

const {handleSave, handleDelete} = useTableActions(store)

const handleSaveForm = () => handleSave({editItem, form, dialog, saving})

const hospitalOptions = computed(() =>
  hospitalStore.hospitals.map(h => ({label: h.name, value: h.id}))
)

const filterConfig = computed(() => [
  {key: 'search', type: 'search', label: 'Departman Adı', width: '220px'},
  {key: 'hospital', type: 'select', label: 'Hastane', width: '200px', options: hospitalOptions.value},
  {key: 'location', type: 'search', label: 'Konum', width: '180px', placeholder: 'Konum ara...'}
])

const columns = [
  {name: 'name', label: 'Departman', field: 'name', align: 'left', sortable: true},
  {name: 'hospitalName', label: 'Hastane', field: 'hospitalName', align: 'left', sortable: true},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'location', label: 'Konum', field: 'location', align: 'left'},
  {name: 'capacity', label: 'Kapasite', field: 'capacity', align: 'left', sortable: true}
]

const filteredRows = computed(() => {
  let rows = store.departments
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(d => d.name?.toLowerCase().includes(q))
  }
  if (filters.value.hospital) rows = rows.filter(d => d.hospitalId === filters.value.hospital)
  if (filters.value.location) {
    const l = filters.value.location.toLowerCase()
    rows = rows.filter(d => d.location?.toLowerCase().includes(l))
  }
  return rows
})

const emptyForm = () => ({
  hospitalId: null, name: '', description: '',
  phone: '', location: '', capacity: null
})

const form = ref(emptyForm())

const openForm = (item = null) => {
  editItem.value = item
  form.value = item ? {...item} : emptyForm()
  dialog.value = true
}

onMounted(async () => {
  await Promise.all([store.fetchAll(), hospitalStore.fetchAll()])
})
</script>
