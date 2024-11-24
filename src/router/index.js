import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router'
import Inicio from '../components/Inicio.vue'
import Clientes from '../views/clientes/clientes.vue'
import  LayoutMain from '../components/LayoutMain.vue'
import  productos from '../views/productos/productos.vue'
import facturas from '@views/Facturas/facturas.vue'



const routes =[
    {
        path:'/',
        name: 'home',
        component:LayoutMain,
    
    },


    

    {
        path:'/inicio',
        name: 'inicio',
        component:Inicio,
    },

{
    path:'/clientes',
    name: 'clientes',
    component:Clientes,
},

{
    path:'/productos',
    name: 'productos',
    component:productos,
},

{
    path:'/facturas',
    name: 'facturas',
    component:facturas,
}

]

const router= createRouter({
history:createWebHistory(),
routes,
})

export default router;