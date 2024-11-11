<template>
  <layout-main>
    <template #slotlayout>
      <header-button v-if="!mostrarFormulario"
        :titulo="'DATOS PRODUCTOS' "
        :tituloboton="'Crear producto'"
        :abrir="abrirFormulario"
      />

      
      <formulario :titulo="'Gestión de productos'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
       
        <template #slotform>
          <formproductos />
        </template>
      </formulario>

      <!-- Tabla de datos de clientes -->
      <div v-if="!mostrarFormulario" :is-edit="editandoFormulario">
        
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column prop="Codigo" label="Codigo" width="180" />
          <el-table-column prop="Nombre" label="Nombre" width="180" />
          <el-table-column prop="Descripcion" label="Descripcion" width="180" />
          <el-table-column prop="Precio" label="Precio" width="180" />
          <el-table-column prop="Stock" label="Stock" width="180" />
          
          <el-table-column fixed="right" label="Opciones" min-width="120">
            <template #default>
              <el-button link type="primary" :icon="EditPen" @click="editarFormulario" ></el-button>
              <el-button link type="danger" :icon="Delete"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </layout-main>
</template>



<script lang="ts" setup>
import { reactive, ref } from 'vue'
import LayoutMain from '../../components/LayoutMain.vue';
import formproductos from './componentes/formproductos.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import {Delete,EditPen} from "@element-plus/icons-vue";
import Formproductos from './componentes/formproductos.vue';


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

const mostrarFormulario =ref( false);
const editandoFormulario=ref(false);




const abrirFormulario =()=>{
  mostrarFormulario.value=true;
  editandoFormulario.value=false
  
}

const editarFormulario= async()=>{

  mostrarFormulario.value=true;
  editandoFormulario.value=true
}

const tableData = [
  {
    Codigo: '001',
    Nombre: 'Manzana',
    Descripcion: 'Manzana gala',
    Precio: '2000',
    Stock: '100',
   
  },]

</script>

<style scoped>

</style>
