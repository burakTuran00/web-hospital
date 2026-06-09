<template>
  <q-page padding>

    <div class="row items-center q-mb-lg">
      <q-btn dense flat icon="arrow_back" @click="$router.push({ name: 'prescriptions' })"/>
      <div class="text-h6 q-ml-sm">Reçete #{{ presc?.id }}</div>
      <q-space/>
      <q-btn color="negative" flat label="Sil" @click="handleDelete"/>
    </div>

    <div v-if="store.loading" class="flex flex-center q-py-xl">
      <q-spinner size="40px"/>
    </div>

    <div v-else-if="presc" class="row q-gutter-md">

      <!-- Sol: Reçete Bilgileri -->
      <div class="col-12 col-md-4">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Reçete Bilgileri</div>
            <q-list dense separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Hasta</q-item-label>
                  <q-item-label>{{ presc.patientFullName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Doktor</q-item-label>
                  <q-item-label>{{ presc.doctorFullName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Reçete Tarihi</q-item-label>
                  <q-item-label>{{ presc.issueDate || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Son Kullanma</q-item-label>
                  <q-item-label>{{ presc.expiryDate || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Süre</q-item-label>
                  <q-item-label>{{ presc.durationDays ? presc.durationDays + ' gün' : '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Adet</q-item-label>
                  <q-item-label>{{ presc.quantity || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Durum</q-item-label>
                  <q-item-label>{{ statusLabel(presc.status) }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="presc.notes">
                <q-item-section>
                  <q-item-label caption>Not</q-item-label>
                  <q-item-label>{{ presc.notes }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Sağ: İlaç Bilgileri -->
      <div class="col-12 col-md-7">
        <q-card bordered flat>
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">İlaç Bilgileri</div>
            <q-list dense separator>
              <q-item>
                <q-item-section>
                  <q-item-label caption>İlaç Adı</q-item-label>
                  <q-item-label>{{ presc.medicineName || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption>Kullanım Talimatı</q-item-label>
                  <q-item-label>{{ presc.dosageInstruction || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="medicine">
                <q-item-section>
                  <q-item-label caption>Etken Madde</q-item-label>
                  <q-item-label>{{ medicine.activeIngredient || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="medicine">
                <q-item-section>
                  <q-item-label caption>Doz</q-item-label>
                  <q-item-label>{{ medicine.dosage || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="medicine">
                <q-item-section>
                  <q-item-label caption>Form</q-item-label>
                  <q-item-label>{{ medicine.form || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="medicine">
                <q-item-section>
                  <q-item-label caption>Üretici</q-item-label>
                  <q-item-label>{{ medicine.manufacturer || '-' }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="medicine?.sideEffects">
                <q-item-section>
                  <q-item-label caption>Yan Etkiler</q-item-label>
                  <q-item-label>{{ medicine.sideEffects }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="medicine?.storageConditions">
                <q-item-section>
                  <q-item-label caption>Saklama Koşulları</q-item-label>
                  <q-item-label>{{ medicine.storageConditions }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

    </div>

  </q-page>
</template>

<script setup>
import {computed, onMounted} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useQuasar} from 'quasar'
import {usePrescriptionStore} from 'stores/prescription.js'
import {useMedicineStore} from 'stores/medicine.js'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const store = usePrescriptionStore()
const medStore = useMedicineStore()

const presc = computed(() => store.prescriptions.find(p => p.id === Number(route.params.id)))
const medicine = computed(() => medStore.medicines.find(m => m.id === presc.value?.medicineId))

const statusLabel = (v) => ({ACTIVE: 'Aktif', USED: 'Kullanıldı', EXPIRED: 'Süresi Doldu'})[v] || v

const handleDelete = () => {
  $q.dialog({
    title: 'Sil',
    message: 'Bu reçete silinecek. Emin misiniz?',
    cancel: {label: 'Hayır', flat: true},
    ok: {label: 'Evet', flat: true, color: 'negative'}
  }).onOk(async () => {
    try {
      await store.delete(presc.value.id)
      $q.notify({type: 'positive', message: 'Silindi.', position: 'top-right'})
      router.push({name: 'prescriptions'})
    } catch (err) {
      $q.notify({type: 'negative', message: err.response?.data?.message || 'Silinemedi.', position: 'top-right'})
    }
  })
}

onMounted(async () => {
  await Promise.all([
    store.fetchAll(),
    medStore.fetchAll()
  ])
})
</script>
