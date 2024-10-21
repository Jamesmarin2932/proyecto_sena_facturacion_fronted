<template>
  <layout-main>
    <template #slotlayout>
      <header-button 
        :titulo="'DATOS DE CLIENTES'"
        :tituloboton="'Crear cliente'"
      />

      
      <formulario :titulo="'Titulo del formulario'">
       
        <template #slotform>
          <form-clientes />
        </template>
      </formulario>

      <!-- Tabla de datos de clientes -->
      <div>
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column prop="Tipo_de_identificacion" label="Tipo de identificación" width="180" />
          <el-table-column prop="Numero" label="Número" width="180" />
          <el-table-column prop="Nombres" label="Nombres" width="180" />
          <el-table-column prop="Apellidos" label="Apellidos" width="180" />
          <el-table-column prop="Dirección" label="Dirección" width="180" />
          <el-table-column prop="Ciudad" label="Ciudad" width="180" />
          <el-table-column prop="Telefono" label="Teléfono" width="180" />
          <el-table-column prop="Correo" label="Correo" />
          <el-table-column fixed="right" label="Opciones" min-width="120">
            <template #default>
              <el-button link type="primary" :icon="EditPen"></el-button>
              <el-button link type="danger" :icon="Delete"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </layout-main>
</template>



<script lang="ts" setup>
import { reactive } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue';
import formClientes from './Componentes/formClientes.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import {Delete,EditPen} from "@element-plus/icons-vue";


// do not use same name with ref
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const onSubmit = () => {
  console.log('submit!')
}

const tableData = [
  {
    Tipo_de_identificacion: 'cc',
    Numero: '100225588',
    Nombres: 'Alberto salas',
    Apellidos: 'Garcia',
    Dirección: 'carrra 12',
    Ciudad: 'Bogota',
    Telefono: '854412',
    Correo: 'Albert@gmh45',
  },]

</script>

<style scoped>

</style>
