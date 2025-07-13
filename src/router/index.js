import { createRouter, createWebHistory } from 'vue-router'

// Componentes principales
import LayoutMain from '../components/LayoutMain.vue'
import Inicio from '../components/Inicio.vue'

// Módulos
import Clientes from '../views/clientes/clientes.vue'
import Productos from '../views/productos/productos.vue'
import Facturas from '../views/Facturas/Facturas.vue'
import Usuarios from '../views/usuarios/usuarios.vue'

// Bancos
import Bancos from '../views/bancos/bancos.vue'
import DescargarPlantilla from '../views/bancos/componentes/descargador.vue'
import ImportarMovimientos from '../views/bancos/componentes/importador.vue'

// Contabilidad
import Contabilidad from '../views/contabilidad/contabilidad.vue'
import LibroDiario from '../views/contabilidad/componentes/librodiario.vue'

const routes = [
  { path: '/', name: 'inicio', component: Inicio },
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
      {
        path: 'descargar',
        name: 'descargarPlantilla',
        component: DescargarPlantilla
      },
      {
        path: 'importar',
        name: 'importarMovimientos',
        component: ImportarMovimientos
      }
    ]
  },

  // Contabilidad y subrutas
  {
    path: '/contabilidad',
    name: 'contabilidad',
    component: Contabilidad,
    children: [
      {
        path: 'librodiario',
        name: 'librodiario',
        component: LibroDiario
      },
      {
        path: 'cuentas',
        name: 'cuentas',
        component: () => import('../views/contabilidad/componentes/GestionCuentas.vue')
      }
    ]
  }



]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
