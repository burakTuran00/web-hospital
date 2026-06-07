<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Hastaneler</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Hastane Adı</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:220px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Hastane Tipi</div>
        <q-select v-model="typeFilter" :options="typeOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:150px"/>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Şehir</div>
        <q-select v-model="cityFilter" :options="cityOptions" clearable dense emit-value
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
      style="cursor:pointer"
      @row-click="(e, row) => $router.push({ name: 'hospital-detail', params: { id: row.id } })"
    >
      <template #body-cell-type="props">
        <q-td :props="props">{{ typeLabel(props.value) }}</q-td>
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
      <q-card style="width:560px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">{{ editItem ? 'Düzenle' : 'Yeni Hastane' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="scroll" style="max-height:60vh">
          <q-form ref="formRef" class="q-gutter-sm" @submit="handleSave">
            <q-input v-model="form.name" :rules="[v => !!v || 'Zorunlu']" dense label="Hastane Adı *"
                     outlined/>
            <div class="row q-gutter-sm">
              <q-select v-model="form.type" :options="typeOptions" :rules="[v => !!v || 'Zorunlu']" class="col" dense
                        emit-value
                        label="Tip *" map-options outlined/>
              <q-input v-model.number="form.bedCapacity" class="col-4"
                       dense label="Yatak Kapasitesi" outlined type="number"/>
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="form.city" class="col" dense label="Şehir" outlined/>
              <q-input v-model="form.district" class="col" dense label="İlçe" outlined/>
            </div>
            <q-input v-model="form.address" dense label="Adres" outlined/>
            <div class="row q-gutter-sm">
              <q-input v-model="form.phone" class="col" dense label="Telefon" outlined/>
              <q-input v-model="form.email" class="col" dense label="E-posta" outlined/>
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="form.website" class="col" dense label="Website" outlined/>
              <q-input v-model="form.taxNumber" class="col" dense label="Vergi No" outlined/>
            </div>
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
import {useHospitalStore} from '../../stores/hospital'

const $q = useQuasar()
const store = useHospitalStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const search = ref('')
const typeFilter = ref(null)
const cityFilter = ref(null)

const typeOptions = [
  {label: 'Devlet', value: 'PUBLIC'},
  {label: 'Özel', value: 'PRIVATE'},
  {label: 'Üniversite', value: 'UNIVERSITY'}
]

const cityOptions = computed(() => {
  const cities = [...new Set(store.hospitals.map(h => h.city).filter(Boolean))]
  return cities.sort().map(c => ({label: c, value: c}))
})

const typeLabel = (v) => ({PUBLIC: 'Devlet', PRIVATE: 'Özel', UNIVERSITY: 'Üniversite'})[v] || v

const columns = [
  {name: 'name', label: 'Hastane Adı', field: 'name', align: 'left', sortable: true},
  {name: 'city', label: 'Şehir', field: 'city', align: 'left', sortable: true},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'type', label: 'Tip', field: 'type', align: 'left'},
  {name: 'bedCapacity', label: 'Yatak Kapasitesi', field: 'bedCapacity', align: 'left'},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = store.hospitals
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(h =>
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q)
    )
  }
  if (typeFilter.value) rows = rows.filter(h => h.type === typeFilter.value)
  if (cityFilter.value) rows = rows.filter(h => h.city === cityFilter.value)
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
