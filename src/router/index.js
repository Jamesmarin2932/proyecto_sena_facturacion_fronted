import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import Ejemplo from '../views/ejemplo.vue'
import Clientes from '../views/clientes.vue'

const routes =[

    {
        path:'/inicio',
        name: 'inicio',
        component:Ejemplo,
    },

{
    path:'/clientes',
    name: 'clientes',
    component:Clientes,
}

]

const router= createRouter({
history:createWebHistory(),
routes,
})

export default router;