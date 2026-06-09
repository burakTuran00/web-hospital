<template>
  <q-page padding>

    <div class="row items-center q-mb-lg">
      <q-btn dense flat icon="arrow_back" @click="$router.push({ name: 'hospitals' })"/>
      <div class="text-h6 q-ml-sm">{{ hospital?.name || '...' }}</div>
      <q-space/>
      <template v-if="!editMode">
        <q-btn flat label="Düzenle" @click="startEdit"/>
        <q-btn color="negative" flat label="Sil" @click="onDelete"/>
      </template>
      <template v-else>
        <q-btn :loading="saving" color="primary" flat label="Güncelle" @click="handleSave"/>
        <q-btn flat label="İptal" @click="cancelEdit"/>
      </template>
    </div>

    <div v-if="store.loading" class="flex flex-center q-py-xl">
      <q-spinner size="40px"/>
    </div>

    <div v-else-if="hospital" class="row q-gutter-md">

      <div class="col-12 col-md-5">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Genel Bilgiler</div>
            <q-list dense separator>
              <AppDetailItem label="Hastane Adı">
                <q-input v-if="editMode" v-model="form.name" dense outlined/>
                <q-item-label v-else>{{ hospital.name }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="Tip">
                <q-select v-if="editMode" v-model="form.type" :options="typeOptions"
                          dense emit-value map-options outlined/>
                <q-item-label v-else>{{ typeLabel(hospital.type) }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="Yatak Kapasitesi">
                <q-input v-if="editMode" v-model.number="form.bedCapacity" dense outlined type="number"/>
                <q-item-label v-else>{{ hospital.bedCapacity || '-' }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="Vergi No">
                <q-input v-if="editMode" v-model="form.taxNumber" dense outlined/>
                <q-item-label v-else>{{ hospital.taxNumber || '-' }}</q-item-label>
              </AppDetailItem>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">İletişim Bilgileri</div>
            <q-list dense separator>
              <AppDetailItem label="Şehir">
                <q-input v-if="editMode" v-model="form.city" dense outlined/>
                <q-item-label v-else>{{ hospital.city || '-' }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="İlçe">
                <q-input v-if="editMode" v-model="form.district" dense outlined/>
                <q-item-label v-else>{{ hospital.district || '-' }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="Adres">
                <q-input v-if="editMode" v-model="form.address" dense outlined/>
                <q-item-label v-else>{{ hospital.address || '-' }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="Telefon">
                <q-input v-if="editMode" v-model="form.phone" dense outlined/>
                <q-item-label v-else>{{ hospital.phone || '-' }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="E-posta">
                <q-input v-if="editMode" v-model="form.email" dense outlined/>
                <q-item-label v-else>{{ hospital.email || '-' }}</q-item-label>
              </AppDetailItem>
              <AppDetailItem label="Website">
                <q-input v-if="editMode" v-model="form.website" dense outlined/>
                <q-item-label v-else>{{ hospital.website || '-' }}</q-item-label>
              </AppDetailItem>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2">Departmanlar ({{ deptStore.departments.length }})</div>
          </q-card-section>
          <q-separator/>
          <q-table
            :columns="deptColumns"
            :rows="deptStore.departments"
            :rows-per-page-options="[5, 10]" flat
            no-data-label="Departman yok"
            row-key="id"
          />
        </q-card>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useHospitalStore} from '../../../stores/hospital'
import {useDepartmentStore} from '../../../stores/department'
import {useTableActions} from '../../../composables/useTableActions'
import AppDetailItem from '../../../components/AppDetailItem.vue'

const route = useRoute()
const router = useRouter()
const store = useHospitalStore()
const deptStore = useDepartmentStore()

const editMode = ref(false)
const saving = ref(false)
const form = ref({})

const hospital = computed(() => store.selected)

const {handleDelete} = useTableActions(store)

const typeOptions = [
  {label: 'Devlet', value: 'PUBLIC'},
  {label: 'Özel', value: 'PRIVATE'},
  {label: 'Üniversite', value: 'UNIVERSITY'}
]

const typeLabel = (v) => ({PUBLIC: 'Devlet', PRIVATE: 'Özel', UNIVERSITY: 'Üniversite'})[v] || v

const deptColumns = [
  {name: 'name', label: 'Departman', field: 'name', align: 'left', sortable: true, style: 'width:25%'},
  {name: 'phone', label: 'Telefon', field: 'phone', align: 'left', style: 'width:25%'},
  {name: 'location', label: 'Konum', field: 'location', align: 'left', style: 'width:25%'},
  {name: 'capacity', label: 'Kapasite', field: 'capacity', align: 'left', sortable: true, style: 'width:25%'}
]

const startEdit = () => {
  form.value = {...hospital.value}
  editMode.value = true
}

const cancelEdit = () => {
  editMode.value = false
  form.value = {}
}

const handleSave = async () => {
  saving.value = true
  try {
    await store.update(hospital.value.id, form.value)
    await store.fetchById(hospital.value.id)
    editMode.value = false
  } finally {
    saving.value = false
  }
}

const onDelete = () => {
  handleDelete(hospital.value, {
    label: (i) => i.name,
    onSuccess: () => router.push({name: 'hospitals'})
  })
}

onMounted(async () => {
  await store.fetchById(route.params.id)
  await deptStore.fetchByHospital(route.params.id)
})
</script>
