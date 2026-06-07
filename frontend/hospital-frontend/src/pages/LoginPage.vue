<template>
  <q-page class="flex flex-center" style="min-height: 100vh">
    <q-card bordered flat style="width: 380px">

      <q-card-section class="text-center q-pb-none">
        <div class="text-h6">Hastane Yönetim</div>
      </q-card-section>

      <q-tabs v-model="tab" align="justify" dense>
        <q-tab label="Giriş" name="login"/>
        <q-tab label="Kayıt" name="register"/>
      </q-tabs>

      <q-separator/>

      <q-tab-panels v-model="tab" animated>

        <q-tab-panel name="login">
          <q-form class="q-gutter-sm" @submit="handleLogin">
            <q-input v-model="loginForm.username" :rules="[v => !!v || 'Zorunlu']" dense label="Kullanıcı Adı"
                     outlined/>
            <q-input v-model="loginForm.password" :rules="[v => !!v || 'Zorunlu']"
                     :type="showPass ? 'text' : 'password'" dense
                     label="Şifre" outlined>
              <template #append>
                <q-icon :name="showPass ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer" @click="showPass = !showPass"/>
              </template>
            </q-input>
            <q-btn :loading="loading" class="full-width" color="primary"
                   flat label="Giriş Yap" type="submit"/>
          </q-form>
        </q-tab-panel>

        <q-tab-panel name="register">
          <q-form class="q-gutter-sm" @submit="handleRegister">

            <q-input v-model="registerForm.firstName" :rules="[v => !!v || 'Zorunlu']" class="col" dense label="Ad"
                     outlined/>
            <q-input v-model="registerForm.lastName" :rules="[v => !!v || 'Zorunlu']" class="col" dense label="Soyad"
                     outlined/>
            <q-input v-model="registerForm.username" :rules="[v => !!v || 'Zorunlu']" dense label="Kullanıcı Adı"
                     outlined/>
            <q-input v-model="registerForm.email" :rules="[v => !!v || 'Zorunlu']" dense label="E-posta"
                     outlined/>
            <q-input v-model="registerForm.password"
                     :rules="[v => !!v || 'Zorunlu', v => v.length >= 6 || 'En az 6 karakter']"
                     :type="showRegPass ? 'text' : 'password'" dense
                     label="Şifre"
                     outlined>
              <template #append>
                <q-icon :name="showRegPass ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer" @click="showRegPass = !showRegPass"/>
              </template>
            </q-input>
            <q-select v-model="registerForm.role" :options="roleOptions" :rules="[v => !!v || 'Zorunlu']" dense
                      emit-value label="Rol" map-options
                      outlined/>
            <q-btn :loading="loading" class="full-width" color="primary"
                   flat label="Kayıt Ol" type="submit"/>
          </q-form>
        </q-tab-panel>

      </q-tab-panels>

    </q-card>
  </q-page>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {useQuasar} from 'quasar'
import {useAuthStore} from '../stores/auth'
import {register} from '../api/auth'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

const tab = ref('login')
const loading = ref(false)
const showPass = ref(false)
const showRegPass = ref(false)

const loginForm = ref({username: '', password: ''})

const registerForm = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  role: null
})

const roleOptions = [
  {label: 'Doktor', value: 'ROLE_DOCTOR'},
  {label: 'Hasta', value: 'ROLE_PATIENT'}
]

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
    registerForm.value = {firstName: '', lastName: '', username: '', email: '', password: '', role: null}
    tab.value = 'login'
  } catch (err) {
    $q.notify({type: 'negative', message: err.response?.data?.message || 'Hata oluştu.', position: 'top-right'})
  } finally {
    loading.value = false
  }
}
</script>
