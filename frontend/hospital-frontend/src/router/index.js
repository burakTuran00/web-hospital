import {createRouter, createWebHashHistory} from 'vue-router'

const routes = [
  {
    path: '/login',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      {path: '', name: 'login', component: () => import('../pages/LoginPage.vue')}
    ]
  },
  {
    path: '/admin',
    component: () => import('../layouts/MainLayout.vue'),
    meta: {requiresAuth: true, roles: ['ROLE_ADMIN']},
    children: [
      {path: '', name: 'dashboard', component: () => import('../pages/admin/DashboardPage.vue')},
      {path: 'hospitals', name: 'hospitals', component: () => import('../pages/admin/hospital/HospitalPage.vue')},
      {
        path: 'hospitals/:id',
        name: 'hospital-detail',
        component: () => import('../pages/admin/hospital/HospitalDetailPage.vue')
      },
      {
        path: 'departments',
        name: 'departments',
        component: () => import('../pages/admin/department/DepartmentPage.vue')
      },
      {path: 'doctors', name: 'doctors', component: () => import('../pages/admin/doctor/DoctorPage.vue')},
      {
        path: 'doctors/:id',
        name: 'doctor-detail',
        component: () => import('../pages/admin/doctor/DoctorDetailPage.vue')
      },
      {path: 'patients', name: 'patients', component: () => import('../pages/admin/patient/PatientPage.vue')},
      {
        path: 'patients/:id',
        name: 'patient-detail',
        component: () => import('../pages/admin/patient/PatientDetailPage.vue')
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: () => import('../pages/admin/appointment/AppointmentPage.vue')
      },
      {
        path: 'appointments/:id',
        name: 'appointment-detail',
        component: () => import('../pages/admin/appointment/AppointmentDetailPage.vue')
      },
      {path: 'medicines', name: 'medicines', component: () => import('../pages/admin/medicine/MedicinePage.vue')},
      {
        path: 'prescriptions',
        name: 'prescriptions',
        component: () => import('../pages/admin/prescription/PrescriptionPage.vue')
      },
      {
        path: 'prescriptions/:id',
        name: 'prescription-detail',
        component: () => import('../pages/admin/prescription/PrescriptionDetailPage.vue')
      }
    ]
  },
  {
    path: '/doctor',
    component: () => import('../layouts/MainLayout.vue'),
    meta: {requiresAuth: true, roles: ['ROLE_DOCTOR']},
    children: [
      {path: '', name: 'doctor-dashboard', component: () => import('../pages/doctor/DashboardPage.vue')},
      {
        path: 'appointments',
        name: 'doctor-appointments',
        component: () => import('../pages/doctor/AppointmentPage.vue')
      },
      {path: 'patients', name: 'doctor-patients', component: () => import('../pages/doctor/PatientPage.vue')},
      {
        path: 'prescriptions',
        name: 'doctor-prescriptions',
        component: () => import('../pages/doctor/PrescriptionPage.vue')
      }
    ]
  },
  {
    path: '/patient',
    component: () => import('../layouts/MainLayout.vue'),
    meta: {requiresAuth: true, roles: ['ROLE_PATIENT']},
    children: [
      {path: '', name: 'patient-dashboard', component: () => import('../pages/patient/DashboardPage.vue')},
      {
        path: 'appointments',
        name: 'patient-appointments',
        component: () => import('../pages/patient/AppointmentPage.vue')
      },
      {
        path: 'prescriptions',
        name: 'patient-prescriptions',
        component: () => import('../pages/patient/PrescriptionPage.vue')
      }
    ]
  },
  {path: '/:catchAll(.*)*', redirect: '/login'}
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')
  if (to.meta.requiresAuth && !token) return '/login'
  if (to.path === '/login' && token) {
    const roles = getRolesFromToken(token)
    return getRoleHome(roles)
  }
  if (to.meta.roles && token) {
    const roles = getRolesFromToken(token)
    const hasRole = to.meta.roles.some(r => roles.includes(r))
    if (!hasRole) return getRoleHome(roles)
  }
})

const getRolesFromToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.realm_access?.roles || []
  } catch {
    return []
  }
}

const getRoleHome = (roles) => {
  if (roles.includes('ROLE_ADMIN')) return '/admin'
  if (roles.includes('ROLE_DOCTOR')) return '/doctor'
  if (roles.includes('ROLE_PATIENT')) return '/patient'
  return '/login'
}

export default router
