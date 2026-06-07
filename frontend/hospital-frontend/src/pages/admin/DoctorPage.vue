<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <div class="text-h6">Doktorlar</div>
      <q-space/>
      <q-btn color="primary" flat icon="add" label="Ekle" @click="openForm()"/>
    </div>

    <div class="row q-gutter-md q-mb-md items-end">
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Doktor Adı</div>
        <q-input v-model="search" clearable dense outlined placeholder="Ara..." style="width:220px">
          <template #prepend>
            <q-icon name="search" size="sm"/>
          </template>
        </q-input>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Departman</div>
        <q-select v-model="deptFilter" :options="departmentOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:200px"/>
      </div>
      <div>
        <div class="text-caption text-grey-7 q-mb-xs">Çalışma Tipi</div>
        <q-select v-model="employmentFilter" :options="employmentOptions" clearable dense emit-value
                  map-options outlined placeholder="Tümü" style="width:160px"/>
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
      @row-click="(e, row) => $router.push({ name: 'doctor-detail', params: { id: row.id } })"
    >
      <template #body-cell-fullName="props">
        <q-td :props="props">
          {{ props.row.title }} {{ props.row.firstName }} {{ props.row.lastName }}
          <div class="text-caption text-grey-6">{{ props.row.specialization }}</div>
        </q-td>
      </template>

      <template #body-cell-employmentType="props">
        <q-td :props="props">{{ employmentLabel(props.value) }}</q-td>
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
      <q-card style="width:620px; max-width:95vw">
        <q-card-section>
          <div class="text-h6">{{ editItem ? 'Düzenle' : 'Yeni Doktor' }}</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="scroll" style="max-height:60vh">
          <q-form ref="formRef" class="q-gutter-sm" @submit="handleSave">
            <div class="row q-gutter-sm">
              <q-select v-model="form.title" :options="titleOptions" :rules="[v => !!v || 'Zorunlu']"
                        class="col-3" dense emit-value label="Ünvan *" map-options outlined/>
              <q-input v-model="form.firstName" :rules="[v => !!v || 'Zorunlu']" class="col" dense label="Ad *"
                       outlined/>
              <q-input v-model="form.lastName" :rules="[v => !!v || 'Zorunlu']" class="col" dense label="Soyad *"
                       outlined/>
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="form.email" :rules="[v => !!v || 'Zorunlu']" class="col" dense label="E-posta *"
                       outlined/>
              <q-input v-model="form.phone" class="col" dense label="Telefon" outlined/>
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model="form.specialization" class="col" dense label="Uzmanlık" outlined/>
              <q-input v-model="form.licenseNumber" class="col" dense label="Lisans No" outlined/>
            </div>
            <div class="row q-gutter-sm">
              <q-input v-model.number="form.experienceYears" class="col-4"
                       dense label="Deneyim (Yıl)" outlined type="number"/>
              <q-select v-model="form.employmentType" :options="employmentOptions" :rules="[v => !!v || 'Zorunlu']"
                        class="col" dense emit-value label="Çalışma Tipi *" map-options outlined/>
            </div>
            <q-select v-model="form.departmentId" :options="departmentOptions" :rules="[v => !!v || 'Zorunlu']"
                      dense emit-value label="Departman *" map-options outlined/>
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
import {useDoctorStore} from '../../stores/doctor'
import {useDepartmentStore} from '../../stores/department'

const $q = useQuasar()
const store = useDoctorStore()
const deptStore = useDepartmentStore()
const formRef = ref(null)

const dialog = ref(false)
const saving = ref(false)
const editItem = ref(null)
const search = ref('')
const deptFilter = ref(null)
const employmentFilter = ref(null)

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

const columns = [
  {name: 'fullName', label: 'Ad Soyad', field: 'firstName', align: 'left', sortable: true},
  {name: 'departmentName', label: 'Departman', field: 'departmentName', align: 'left', sortable: true},
  {name: 'hospitalName', label: 'Hastane', field: 'hospitalName', align: 'left'},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left'},
  {name: 'experienceYears', label: 'Deneyim (Yıl)', field: 'experienceYears', align: 'left', sortable: true},
  {name: 'employmentType', label: 'Çalışma Tipi', field: 'employmentType', align: 'left', sortable: true},
  {name: 'actions', label: '', field: 'actions', align: 'right'}
]

const filteredRows = computed(() => {
  let rows = store.doctors
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(d =>
      d.firstName?.toLowerCase().includes(q) ||
      d.lastName?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q)
    )
  }
  if (deptFilter.value) rows = rows.filter(d => d.departmentId === deptFilter.value)
  if (employmentFilter.value) rows = rows.filter(d => d.employmentType === employmentFilter.value)
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
    message: `"${item.title} ${item.firstName} ${item.lastName}" silinecek. Emin misiniz?`,
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
  await Promise.all([store.fetchAll(), deptStore.fetchAll()])
})
</script>
