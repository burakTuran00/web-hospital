<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">İlaçlar</div>
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
    >
      <template #cell-medicineClass="props">
        <q-td :props="props">{{ classLabel(props.value) }}</q-td>
      </template>
    </AppTable>

    <AppDialog
      v-model="dialog"
      :loading="saving"
      :title="editItem ? 'Düzenle' : 'Yeni İlaç'"
      @save="formRef.submit()"
    >
      <q-form ref="formRef" class="q-gutter-sm" @submit="handleSaveForm">
        <q-input v-model="form.name" :rules="[v => !!v || 'Zorunlu']" dense label="İlaç Adı *"
                 outlined/>
        <q-input v-model="form.activeIngredient" :rules="[v => !!v || 'Zorunlu']" dense label="Etken Madde *"
                 outlined/>
        <q-select v-model="form.medicineClass" :options="classOptions" :rules="[v => !!v || 'Zorunlu']"
                  dense emit-value label="Sınıf *" map-options outlined/>
        <q-input v-model="form.dosage" dense label="Doz" outlined/>
        <q-input v-model="form.form" dense label="Form (Tablet vb.)" outlined/>
        <q-input v-model="form.manufacturer" dense label="Üretici" outlined/>
        <q-input v-model="form.barcode" dense label="Barkod" outlined/>
        <q-input v-model="form.sideEffects" dense label="Yan Etkiler" outlined rows="2" type="textarea"/>
        <q-input v-model="form.storageConditions" dense label="Saklama Koşulları" outlined/>
      </q-form>
    </AppDialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useMedicineStore} from 'stores/medicine.js'
import {useTableActions} from '../../../composables/useTableActions.js'
import AppTable from 'components/AppTable.vue'
import AppDialog from 'components/AppDialog.vue'
import AppFilters from 'components/AppFilters.vue'

const store = useMedicineStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const filters = ref({search: '', class: null})

const {handleSave, handleDelete} = useTableActions(store)

const handleSaveForm = () => handleSave({editItem, form, dialog, saving})

const classOptions = [
  {label: 'Reçeteli', value: 'PRESCRIPTION'},
  {label: 'Reçetesiz', value: 'OTC'}
]

const classLabel = (v) => ({PRESCRIPTION: 'Reçeteli', OTC: 'Reçetesiz'})[v] || v

const filterConfig = [
  {key: 'search', type: 'search', label: 'İlaç Adı / Etken Madde', width: '250px'},
  {key: 'class', type: 'select', label: 'Sınıf', width: '150px', options: classOptions}
]

const columns = [
  {name: 'name', label: 'İlaç Adı', field: 'name', align: 'left', sortable: true},
  {name: 'activeIngredient', label: 'Etken Madde', field: 'activeIngredient', align: 'left'},
  {name: 'dosage', label: 'Doz', field: 'dosage', align: 'left'},
  {name: 'form', label: 'Form', field: 'form', align: 'left'},
  {name: 'manufacturer', label: 'Üretici', field: 'manufacturer', align: 'left'},
  {name: 'medicineClass', label: 'Sınıf', field: 'medicineClass', align: 'left', sortable: true}
]

const filteredRows = computed(() => {
  let rows = store.medicines
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    rows = rows.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.activeIngredient?.toLowerCase().includes(q)
    )
  }
  if (filters.value.class) rows = rows.filter(m => m.medicineClass === filters.value.class)
  return rows
})

const emptyForm = () => ({
  name: '', activeIngredient: '', dosage: '',
  form: '', medicineClass: null, manufacturer: '',
  barcode: '', sideEffects: '', storageConditions: ''
})

const form = ref(emptyForm())

const openForm = (item = null) => {
  editItem.value = item
  form.value = item ? {...item} : emptyForm()
  dialog.value = true
}

onMounted(() => store.fetchAll())
</script>
