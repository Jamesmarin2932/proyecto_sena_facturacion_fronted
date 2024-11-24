<template>
    <layout-main>
      <template #slotlayout>
        <header-button 
          v-if="!mostrarFormulario"
          :titulo="'DATOS DE FACTURAS'" 
          :tituloboton="'Crear factura'" 
          :abrir="abrirFormulario" 
        />
  
        <formulario :titulo="'Gestión de facturas'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
          <template #slotform>
            <FormFacturas />
          </template>
        </formulario>
  
        <!-- Tabla de datos de clientes -->
        <div v-if="!mostrarFormulario">
          <el-table :data="clientes" stripe style="width: 100%">
    <el-table-column prop="numero_factura" label="N° Factura" width="180" />
    <el-table-column prop="tipo_identificacion" label="Tipo de identificación" width="180" />
    <el-table-column prop="cliente" label="Cliente" width="180" />
    <el-table-column prop="fecha" label="Fecha" width="180" />
    <el-table-column prop="producto" label="Producto" width="180" />
    <el-table-column prop="cantidad" label="Cantidad" width="180" />
    <el-table-column prop="sub_total" label="Sub total" width="180" />
    <el-table-column prop="descuento" label="Descuento" width="180" />
    <el-table-column prop="iva" label="Iva" />
    <el-table-column prop="total" label="Total" />
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
import FormFacturas from './componentes/formFacturas.vue';
  
  
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
  
  
  const getFacturas = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/descripcion_facturas/getdata');
      console.log(response.data);
      clientes.value = response.data.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };
  
  onMounted(() => {
    getFacturas();  
  });
  </script>
  
  <style scoped>
  </style>
  