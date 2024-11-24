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

      <!-- Tabla de datos de productos -->
      <div v-if="!mostrarFormulario" :is-edit="editandoFormulario">
        
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column prop="Codigo" label="Código" width="180" />
          <el-table-column prop="Nombre" label="Nombre" width="180" />
         <el-table-column prop="Descripcion" label="Descripción" width="180" />
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



<script setup>
import { ref, onMounted } from 'vue';
import { EditPen, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formproductos from '../productos/componentes/formproductos.vue';

const mostrarFormulario = ref(false);
const editandoFormulario = ref(false);
const tableData = ref([]);

const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
};

const getProductos = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/nombre_productos/getdata');
    tableData.value = response.data.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
};

onMounted(() => {
  getProductos();
});


</script>

<style scoped>

</style>
