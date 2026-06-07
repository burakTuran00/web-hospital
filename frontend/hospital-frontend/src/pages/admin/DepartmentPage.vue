<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Departmanlar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Departman Adı</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:220px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Hastane</div>
        <q-select v-model="hospitalFilter" :options="hospitalOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:200px"/>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Konum</div>
        <q-input v-model="locationFilter" clearable dense outlined placeholder="Konum ara..." style="width:180px"/>
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
      <template #body-cell-capacity="props">
        <q-td :props="props">{{ props.value || '-' }}</q-td>
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
          <div class="text-h6">{{ editItem ? 'Düzenle' : 'Yeni Departman' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="scroll" style="max-height:60vh">
          <q-form ref="formRef" class="q-gutter-sm" @submit="handleSave">
            <q-select
              v-model="form.hospitalId"
              :disable="!!editItem"
              :options="hospitalOptions"
              :rules="[v => !!v || 'Zorunlu']" dense
              emit-value label="Hastane *"
              map-options
              outlined
            />
            <q-input v-model="form.name" :rules="[v => !!v || 'Zorunlu']" dense label="Departman Adı *"
                     outlined/>
            <q-input v-model="form.description" dense label="Açıklama" outlined
                     rows="2" type="textarea"/>
            <div class="row q-gutter-sm">
              <q-input v-model="form.phone" class="col" dense label="Telefon" outlined/>
              <q-input v-model="form.location" class="col" dense label="Konum" outlined/>
            </div>
            <q-input v-model.number="form.capacity" dense label="Kapasite" outlined type="number"/>
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
import {useDepartmentStore} from '../../stores/department'
import {useHospitalStore} from '../../stores/hospital'

const $q = useQuasar()
const store = useDepartmentStore()
const hospitalStore = useHospitalStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const search = ref('')
const hospitalFilter = ref(null)
const locationFilter = ref('')

const hospitalOptions = computed(() =>
  hospitalStore.hospitals.map(h => ({label: h.name, value: h.id}))
)

const columns = [
  {name: 'name', label: 'Departman', field: 'name', align: 'left', sortable: true},
  {name: 'hospitalName', label: 'Hastane', field: 'hospitalName', align: 'left', sortable: true},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'location', label: 'Konum', field: 'location', align: 'left'},
  {name: 'capacity', label: 'Kapasite', field: 'capacity', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = store.departments
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(d => d.name?.toLowerCase().includes(q))
  }
  if (hospitalFilter.value) {
    rows = rows.filter(d => d.hospitalId === hospitalFilter.value)
  }
  if (locationFilter.value) {
    const l = locationFilter.value.toLowerCase()
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

onMounted(async () => {
  await Promise.all([store.fetchAll(), hospitalStore.fetchAll()])
})
</script>
