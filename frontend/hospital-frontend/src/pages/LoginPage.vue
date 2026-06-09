<template>
  <q-page class="flex flex-center" style="min-height: 100vh">
    <q-card bordered flat style="width: 480px">

      <q-card-section class="text-center q-pb-none">
        <div class="text-h6">Hastane Yönetim</div>
      </q-card-section>

      <q-tabs v-model="tab" align="justify" dense>
        <q-tab label="Giriş" name="login"/>
        <q-tab label="Kayıt" name="register"/>
      </q-tabs>

      <q-separator/>

      <q-tab-panels v-model="tab" animated>

        <!-- GİRİŞ -->
        <q-tab-panel name="login">
          <q-form class="q-gutter-sm" @submit="handleLogin">
            <q-input v-model="loginForm.username" :rules="[v => !!v || 'Zorunlu']" dense label="Kullanıcı Adı"
                     outlined/>
            <q-input v-model="loginForm.password" :rules="[v => !!v || 'Zorunlu']"
                     :type="showPass ? 'text' : 'password'" dense label="Şifre" outlined>
              <template #append>
                <q-icon :name="showPass ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer" @click="showPass = !showPass"/>
              </template>
            </q-input>
            <q-btn :loading="loading" class="full-width" color="primary" flat label="Giriş Yap" type="submit"/>
          </q-form>
        </q-tab-panel>

        <!-- KAYIT -->
        <q-tab-panel name="register">
          <q-form class="q-gutter-sm" @submit="handleRegister">

            <q-select v-model="registerForm.role" :options="roleOptions" :rules="[v => !!v || 'Zorunlu']"
                      dense emit-value label="Rol *" map-options outlined/>

            <template v-if="registerForm.role">

              <!-- ORTAK -->
              <q-separator class="q-my-xs"/>
              <div class="text-caption text-grey-7 q-mb-xs">Temel Bilgiler</div>

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input v-model="registerForm.firstName" :rules="[v => !!v || 'Zorunlu']" dense label="Ad *"
                           outlined/>
                </div>
                <div class="col-6">
                  <q-input v-model="registerForm.lastName" :rules="[v => !!v || 'Zorunlu']" dense label="Soyad *"
                           outlined/>
                </div>
              </div>

              <q-input v-model="registerForm.username" :rules="[v => !!v || 'Zorunlu']" dense label="Kullanıcı Adı *"
                       outlined/>
              <q-input v-model="registerForm.email"
                       :rules="[v => !!v || 'Zorunlu', v => /.+@.+\..+/.test(v) || 'Geçerli e-posta giriniz']"
                       dense label="E-posta *" outlined/>
              <q-input v-model="registerForm.password"
                       :rules="[v => !!v || 'Zorunlu', v => v.length >= 6 || 'En az 6 karakter']"
                       :type="showRegPass ? 'text' : 'password'" dense label="Şifre *" outlined>
                <template #append>
                  <q-icon :name="showRegPass ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer" @click="showRegPass = !showRegPass"/>
                </template>
              </q-input>
              <q-input v-model="registerForm.phone" dense label="Telefon" mask="(###) ### ## ##" outlined/>

              <!-- HASTA ALANLARI -->
              <template v-if="registerForm.role === 'ROLE_PATIENT'">

                <q-separator class="q-my-xs"/>
                <div class="text-caption text-grey-7 q-mb-xs">Kimlik & Kişisel Bilgiler</div>

                <q-input v-model="registerForm.tcNo"
                         :rules="[v => !!v || 'Zorunlu', v => v.length === 11 || '11 karakter olmalı']"
                         dense label="TC No *" mask="###########" maxlength="11" outlined/>
                <q-input v-model="registerForm.birthDate" dense label="Doğum Tarihi" outlined type="date"/>

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select v-model="registerForm.gender" :options="genderOptions"
                              dense emit-value label="Cinsiyet" map-options outlined/>
                  </div>
                  <div class="col-6">
                    <q-select v-model="registerForm.bloodType" :options="bloodTypeOptions"
                              dense emit-value label="Kan Grubu" map-options outlined/>
                  </div>
                </div>

                <q-separator class="q-my-xs"/>
                <div class="text-caption text-grey-7 q-mb-xs">Adres Bilgileri</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-8">
                    <q-input v-model="registerForm.address" dense label="Adres" outlined/>
                  </div>
                  <div class="col-4">
                    <q-input v-model="registerForm.city" dense label="Şehir" outlined/>
                  </div>
                </div>

                <q-separator class="q-my-xs"/>
                <div class="text-caption text-grey-7 q-mb-xs">Sağlık Bilgileri</div>

                <q-input v-model="registerForm.allergies" autogrow dense hint="Varsa belirtiniz"
                         label="Alerjiler" outlined type="textarea"/>
                <q-input v-model="registerForm.chronicDiseases" autogrow dense hint="Varsa belirtiniz"
                         label="Kronik Hastalıklar" outlined type="textarea"/>

                <q-separator class="q-my-xs"/>
                <div class="text-caption text-grey-7 q-mb-xs">Acil İletişim</div>

                <q-input v-model="registerForm.emergencyContact" dense label="Acil İletişim Kişisi" outlined/>
                <q-input v-model="registerForm.emergencyContactPhone" dense label="Acil İletişim Telefonu"
                         mask="(###) ### ## ##" outlined/>

                <q-separator class="q-my-xs"/>
                <div class="text-caption text-grey-7 q-mb-xs">Sigorta Bilgileri</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select v-model="registerForm.insuranceType" :options="insuranceTypeOptions"
                              dense emit-value label="Sigorta Türü" map-options outlined/>
                  </div>
                  <div class="col-6">
                    <q-input v-model="registerForm.insuranceNumber" dense label="Sigorta No" outlined/>
                  </div>
                </div>

              </template>

              <!-- DOKTOR ALANLARI -->
              <template v-if="registerForm.role === 'ROLE_DOCTOR'">

                <q-separator class="q-my-xs"/>
                <div class="text-caption text-grey-7 q-mb-xs">Doktor Bilgileri</div>

                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-select v-model="registerForm.title" :options="titleOptions"
                              dense emit-value label="Unvan" map-options outlined/>
                  </div>
                  <div class="col-6">
                    <q-select v-model="registerForm.employmentType" :options="employmentTypeOptions"
                              dense emit-value label="Çalışma Türü" map-options outlined/>
                  </div>
                </div>

                <q-input v-model="registerForm.specialization" dense label="Uzmanlık Alanı" outlined/>
                <q-input v-model="registerForm.licenseNumber" dense label="Lisans No" outlined/>
                <q-input v-model="registerForm.experienceYears" :rules="[v => !v || v > 0 || 'Pozitif olmalı']" dense
                         label="Deneyim (Yıl)" outlined type="number"/>

                <q-select
                  v-model="registerForm.departmentId"
                  :options="departmentOptions"
                  :rules="[v => !!v || 'Zorunlu']"
                  dense emit-value input-debounce="0"
                  label="Departman *" map-options outlined use-input
                />

              </template>

            </template>

            <q-btn :loading="loading" class="full-width q-mt-sm" color="primary"
                   flat label="Kayıt Ol" type="submit"/>
          </q-form>
        </q-tab-panel>

      </q-tab-panels>

    </q-card>
  </q-page>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useQuasar} from 'quasar'
import {useAuthStore} from '../stores/auth'
import {register} from '../api/auth'
import {departmentApi} from '../api/department'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

const tab = ref('login')
const loading = ref(false)
const showPass = ref(false)
const showRegPass = ref(false)
const departments = ref([])

const loginForm = ref({
  username: '',
  password: ''
})

const emptyRegisterForm = {
  // Ortak
  firstName: '', lastName: '', username: '',
  email: '', password: '', role: null, phone: '',
  // Hasta
  tcNo: '', birthDate: '', gender: null, bloodType: null,
  address: '', city: '', allergies: '', chronicDiseases: '',
  emergencyContact: '', emergencyContactPhone: '',
  insuranceType: null, insuranceNumber: '',
  // Doktor
  title: null, specialization: '', licenseNumber: '',
  experienceYears: null, employmentType: null, departmentId: null
}

const registerForm = ref({...emptyRegisterForm})

const roleOptions = [
  {label: 'Doktor', value: 'ROLE_DOCTOR'},
  {label: 'Hasta', value: 'ROLE_PATIENT'}
]

const genderOptions = [
  {label: 'Erkek', value: 'MALE'},
  {label: 'Kadın', value: 'FEMALE'}
]

const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']
  .map(v => ({label: v, value: v}))

const insuranceTypeOptions = [
  {label: 'SGK', value: 'SGK'},
  {label: 'Özel Sigorta', value: 'PRIVATE'},
  {label: 'Sigortasız', value: 'NONE'}
]

const titleOptions = [
  {label: 'Dr.', value: 'Dr.'},
  {label: 'Doç. Dr.', value: 'Doç. Dr.'},
  {label: 'Prof. Dr.', value: 'Prof. Dr.'},
  {label: 'Uzm. Dr.', value: 'Uzm. Dr.'}
]

const employmentTypeOptions = [
  {label: 'Tam Zamanlı', value: 'FULL_TIME'},
  {label: 'Yarı Zamanlı', value: 'PART_TIME'},
  {label: 'Danışman', value: 'CONSULTANT'}
]

const departmentOptions = computed(() =>
  departments.value.map(d => ({label: `${d.name} - ${d.hospitalName}`, value: d.id}))
)

const handleLogin = async () => {
  loading.value = true
  try {
    await auth.login(loginForm.value.username, loginForm.value.password)
    if (auth.isAdmin) router.push('/admin')
    else if (auth.isDoctor) router.push('/doctor')
    else if (auth.isPatient) router.push('/patient')
  } catch {
    $q.notify({type: 'negative', message: 'Kullanıcı adı veya şifre hatalı.', position: 'top-right'})
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  loading.value = true
  try {
    await register(registerForm.value)
    $q.notify({type: 'positive', message: 'Kayıt başarılı. Giriş yapabilirsiniz.', position: 'top-right'})
    registerForm.value = {...emptyRegisterForm}
    tab.value = 'login'
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata oluştu.', position: 'top-right'})
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const {data} = await departmentApi.getAll()
    departments.value = data
  } catch (err) {
    console.error('Departmanlar yüklenemedi:', err)
  }
})
</script>
