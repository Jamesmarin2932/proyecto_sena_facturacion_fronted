<template>
  <layout-main>
    <template #slotlayout>
      <header-button 
        v-if="!mostrarFormulario"
        :titulo="'DATOS DE PRODUCTOS'" 
        :tituloboton="'Crear producto'" 
        :abrir="abrirFormulario" 
      />

      <!-- Formulario para gestión de producto -->
      <formulario :titulo="'Gestión de productos'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
        <template #slotform>
          <formProductos :producto="producto" @guardar="guardarProducto" />
        </template>
      </formulario>

      <!-- Tabla de productos -->
      <div v-if="!mostrarFormulario">
        <el-table :data="productos" stripe style="width: 100%">
          <el-table-column prop="Codigo" label="Código" width="180" />
          <el-table-column prop="Nombre" label="Nombre" width="180" />
          <el-table-column prop="Descripcion" label="Descripción" width="180" />
          <el-table-column prop="Precio" label="Precio" width="180" />
          <el-table-column prop="Stock" label="Stock" width="180" />
          <el-table-column fixed="right" label="Opciones" min-width="120">
            <template #default="registro">
              <el-button link type="primary" :icon="EditPen" @click="editarFormulario(registro.row.id)" />
              <el-button link type="danger" :icon="Delete" @click="eliminarFormulario(registro.row.id)" />
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
import formProductos from './Componentes/formProductos.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const mostrarFormulario = ref(false);
const editandoFormulario = ref(false);
const producto = ref({});
const productos = ref([]);

const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  producto.value = {}; 
};

const eliminarFormulario = (id) => {
  ElMessageBox.confirm(
    `¿Está seguro de eliminar el producto?`, 
    'ELIMINAR REGISTRO',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      type: 'error',
    }
  )
  .then(async () => {
    const url = `http://localhost:8000/api/nombre_productos/delete/${id}`;

    try {
      const response = await axios.delete(url);
      if (response.status === 200) {
        ElMessage({
          type: 'success',
          message: 'Producto eliminado con éxito',
        });
        productos.value = productos.value.filter(p => p.id !== id);
      } else {
        ElMessage({
          type: 'error',
          message: 'La eliminación no fue exitosa',
        });
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      ElMessage({
        type: 'error',
        message: 'Hubo un error al eliminar el producto',
      });
    }
  })
  .catch(() => {
    ElMessage({
      type: 'info',
      message: 'Solicitud cancelada',
    });
  });
};

const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/nombre_productos/getdataById/${id}`);
    producto.value = { ...response.data.data };
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    ElMessage({
      type: 'error',
      message: 'Hubo un error al cargar los datos del producto',
    });
  }
};

const obtenerProductos = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/nombre_productos/getdata');
    productos.value = response.data.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
  }
};

onMounted(() => {
  obtenerProductos();
});
</script>

<style scoped>
</style>
