<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Hastaneler</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <AppFilters v-model="filters" :filters="filterConfig"/>

    <AppTable
      :columns="columns"
      :loading="store.loading"
      :on-row-click="(row) => $router.push({ name: 'hospital-detail', params: { id: row.id } })"
      :rows="filteredRows"
      @delete="(item) => handleDelete(item, { label: (i) => i.name })"
      @edit="openForm"
    >
      <template #cell-type="props">
        <q-td :props="props">{{ typeLabel(props.value) }}</q-td>
      </template>
    </AppTable>

    <AppDialog
      v-model="dialog"
      :loading="saving"
      :title="editItem ? 'Düzenle' : 'Yeni Hastane'"
      @save="formRef.submit()"
    >
      <q-form ref="formRef" class="q-gutter-sm" @submit="handleSaveForm">
        <q-input v-model="form.name" :rules="[v => !!v || 'Zorunlu']" dense label="Hastane Adı *"
                 outlined/>
        <q-select v-model="form.type" :options="typeOptions" :rules="[v => !!v || 'Zorunlu']" dense emit-value
                  label="Tip *" map-options outlined/>
        <q-input v-model.number="form.bedCapacity" dense label="Yatak Kapasitesi" outlined type="number"/>
        <q-input v-model="form.city" dense label="Şehir" outlined/>
        <q-input v-model="form.district" dense label="İlçe" outlined/>
        <q-input v-model="form.address" dense label="Adres" outlined/>
        <q-input v-model="form.phone" dense label="Telefon" outlined/>
        <q-input v-model="form.email" dense label="E-posta" outlined/>
        <q-input v-model="form.website" dense label="Website" outlined/>
        <q-input v-model="form.taxNumber" dense label="Vergi No" outlined/>
      </q-form>
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useHospitalStore} from 'stores/hospital.js'
import {useTableActions} from '../../../composables/useTableActions.js'
import AppTable from 'components/AppTable.vue'
import AppDialog from 'components/AppDialog.vue'
import AppFilters from 'components/AppFilters.vue'

const store = useHospitalStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const filters = ref({search: '', type: null, city: null})

const {handleSave, handleDelete} = useTableActions(store)

const handleSaveForm = () => handleSave({editItem, form, dialog, saving})

const typeOptions = [
  {label: 'Devlet', value: 'PUBLIC'},
  {label: 'Özel', value: 'PRIVATE'},
  {label: 'Üniversite', value: 'UNIVERSITY'}
]

const cityOptions = computed(() =>
  [...new Set(store.hospitals.map(h => h.city).filter(Boolean))]
    .sort().map(c => ({label: c, value: c}))
)

const filterConfig = computed(() => [
  {key: 'search', type: 'search', label: 'Hastane Adı', width: '220px'},
  {key: 'type', type: 'select', label: 'Hastane Tipi', width: '150px', options: typeOptions},
  {key: 'city', type: 'select', label: 'Şehir', width: '150px', options: cityOptions.value}
])

const typeLabel = (v) => ({PUBLIC: 'Devlet', PRIVATE: 'Özel', UNIVERSITY: 'Üniversite'})[v] || v

const columns = [
  {name: 'name', label: 'Hastane Adı', field: 'name', align: 'left', sortable: true},
  {name: 'city', label: 'Şehir', field: 'city', align: 'left', sortable: true},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'type', label: 'Tip', field: 'type', align: 'left'},
  {name: 'bedCapacity', label: 'Yatak Kapasitesi', field: 'bedCapacity', align: 'left'}
]

const filteredRows = computed(() => {
  let rows = store.hospitals
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(h =>
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q)
    )
  }
  if (filters.value.type) rows = rows.filter(h => h.type === filters.value.type)
  if (filters.value.city) rows = rows.filter(h => h.city === filters.value.city)
  return rows
})

const emptyForm = () => ({
  name: '', type: null, bedCapacity: null,
  city: '', district: '', address: '',
  phone: '', email: '', website: '', taxNumber: ''
})

const form = ref(emptyForm())

const openForm = (item = null) => {
  editItem.value = item
  form.value = item ? {...item} : emptyForm()
  dialog.value = true
}

onMounted(() => store.fetchAll())
</script>
