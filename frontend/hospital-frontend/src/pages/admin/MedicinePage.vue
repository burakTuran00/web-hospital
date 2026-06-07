<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">İlaçlar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">İlaç Adı / Etken Madde</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:250px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Sınıf</div>
        <q-select v-model="classFilter" :options="classOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:150px"/>
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
    >
      <template #body-cell-medicineClass="props">
        <q-td :props="props">{{ classLabel(props.value) }}</q-td>
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

    <q-dialog v-model="dialog" persistent>
      <q-card style="width:520px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">{{ editItem ? 'Düzenle' : 'Yeni İlaç' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="scroll" style="max-height:60vh">
          <q-form ref="formRef" class="q-gutter-sm" @submit="handleSave">
            <q-input v-model="form.name" :rules="[v => !!v || 'Zorunlu']" dense label="İlaç Adı *"
                     outlined/>
            <q-input v-model="form.activeIngredient" :rules="[v => !!v || 'Zorunlu']" dense label="Etken Madde *"
                     outlined/>
            <div class="row q-gutter-sm">
              <q-select v-model="form.medicineClass" :options="classOptions" :rules="[v => !!v || 'Zorunlu']"
                        class="col" dense emit-value label="Sınıf *" map-options outlined/>
              <q-input v-model="form.dosage" class="col" dense label="Doz" outlined/>
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="form.form" class="col" dense label="Form (Tablet vb.)" outlined/>
              <q-input v-model="form.manufacturer" class="col" dense label="Üretici" outlined/>
            </div>
            <q-input v-model="form.barcode" dense label="Barkod" outlined/>
            <q-input v-model="form.sideEffects" dense label="Yan Etkiler" outlined
                     rows="2" type="textarea"/>
            <q-input v-model="form.storageConditions" dense label="Saklama Koşulları" outlined/>
          </q-form>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="right">
          <q-btn flat label="İptal" @click="dialog = false"/>
          <q-btn :loading="saving" color="primary" flat label="Kaydet" @click="formRef.submit()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useQuasar} from 'quasar'
import {useMedicineStore} from '../../stores/medicine'

const $q = useQuasar()
const store = useMedicineStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const search = ref('')
const classFilter = ref(null)

const classOptions = [
  {label: 'Reçeteli', value: 'PRESCRIPTION'},
  {label: 'Reçetesiz', value: 'OTC'}
]

const classLabel = (v) => ({PRESCRIPTION: 'Reçeteli', OTC: 'Reçetesiz'})[v] || v

const columns = [
  {name: 'name', label: 'İlaç Adı', field: 'name', align: 'left', sortable: true},
  {name: 'activeIngredient', label: 'Etken Madde', field: 'activeIngredient', align: 'left'},
  {name: 'dosage', label: 'Doz', field: 'dosage', align: 'left'},
  {name: 'form', label: 'Form', field: 'form', align: 'left'},
  {name: 'manufacturer', label: 'Üretici', field: 'manufacturer', align: 'left'},
  {name: 'medicineClass', label: 'Sınıf', field: 'medicineClass', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = store.medicines
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.activeIngredient?.toLowerCase().includes(q)
    )
  }
  if (classFilter.value) rows = rows.filter(m => m.medicineClass === classFilter.value)
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
    dialog.value = false
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata.', position: 'top-right'})
  } finally {
    saving.value = false
  }
}

const handleDelete = (item) => {
  $q.dialog({
    title: 'Sil',
    message: `"${item.name}" silinecek. Emin misiniz?`,
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
