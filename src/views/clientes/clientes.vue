<template>
  <layout-main>
    <template #slotlayout>
      <header-button 
        v-if="!mostrarFormulario"
        :titulo="'DATOS DE CLIENTES'" 
        :tituloboton="'Crear cliente'" 
        :abrir="abrirFormulario" 
      />

      <formulario :titulo="'Gestión de clientes'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
        <template #slotform>
          <formClientes />
        </template>
      </formulario>

      <!-- Tabla de datos de clientes -->
      <div v-if="!mostrarFormulario">
        <el-table :data="clientes" stripe style="width: 100%">
  <el-table-column prop="tipo_identificacion" label="Tipo de identificación" width="180" />
  <el-table-column prop="numero_identificacion" label="Número" width="180" />
  <el-table-column prop="nombres" label="Nombres" width="180" />
  <el-table-column prop="apellidos" label="Apellidos" width="180" />
  <el-table-column prop="direccion" label="Dirección" width="180" />
  <el-table-column prop="ciudad" label="Ciudad" width="180" />
  <el-table-column prop="telefono" label="Teléfono" width="180" />
  <el-table-column prop="correo" label="Correo" />
  <el-table-column fixed="right" label="Opciones" min-width="120">
    <template #default>
      <el-button link type="primary" :icon="EditPen" @click="editarFormulario"></el-button>
      <el-button link type="danger" :icon="Delete"></el-button>
    </template>
  </el-table-column>
</el-table>

      </div>
    </template>
  </layout-main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { EditPen, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formClientes from '../clientes/Componentes/formClientes.vue';


const mostrarFormulario = ref(false);
const editandoFormulario = ref(false);


const clientes = ref([]);


const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
};


const editarFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;
};


const getClientes = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/dato_clientes/getdata');
    console.log(response.data);
    clientes.value = response.data.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
};

onMounted(() => {
  getClientes();  
});
</script>

<style scoped>
</style>
