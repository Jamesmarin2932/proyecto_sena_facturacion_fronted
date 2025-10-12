import { createRouter, createWebHistory } from 'vue-router'

// Componentes principales
import LayoutMain from '../components/LayoutMain.vue'
import Inicio from '../components/Inicio.vue'
import SeleccionEmpresa from '../views/SeleccionEmpresa.vue'

// Módulos
const Clientes = () => import('../views/clientes/clientes.vue')
const Productos = () => import('../views/productos/productos.vue')
const Facturas = () => import('../views/Facturas/Facturas.vue')
const Usuarios = () => import('../views/usuarios/usuarios.vue')

// Bancos
const Bancos = () => import('../views/bancos/bancos.vue')
const DescargarPlantilla = () => import('../views/bancos/componentes/descargador.vue')
const ImportarMovimientos = () => import('../views/bancos/componentes/importador.vue')

// Contabilidad
const Contabilidad = () => import('../views/contabilidad/contabilidad.vue')
const LibroDiario = () => import('../views/contabilidad/componentes/librodiario.vue')
const GestionCuentas = () => import('../views/contabilidad/componentes/GestionCuentas.vue')

// Empresas
const Empresas = () => import('../views/empresas/Empresas.vue')

const routes = [
  { path: '/', name: 'inicio', component: Inicio },
  { path: '/seleccionar-empresa', name: 'seleccionarEmpresa', component: SeleccionEmpresa },
  { path: '/home', name: 'home', component: LayoutMain },
  { path: '/clientes', name: 'clientes', component: Clientes },
  { path: '/productos', name: 'productos', component: Productos },
  { path: '/facturas', name: 'facturas', component: Facturas },
  { path: '/usuarios', name: 'usuarios', component: Usuarios },

  // Bancos y subrutas
  {
    path: '/bancos',
    name: 'bancos',
    component: Bancos,
    children: [
      { path: 'descargar', name: 'descargarPlantilla', component: DescargarPlantilla },
      { path: 'importar', name: 'importarMovimientos', component: ImportarMovimientos }
    ]
  },

  // Contabilidad y subrutas
  {
    path: '/contabilidad',
    name: 'contabilidad',
    component: Contabilidad,
    redirect: '/contabilidad/librodiario',
    children: [
      { path: 'librodiario', name: 'librodiario', component: LibroDiario },
      { path: 'cuentas', name: 'cuentas', component: GestionCuentas }
    ]
  },

  // Empresas
  { path: '/empresas', name: 'empresas', component: Empresas }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
