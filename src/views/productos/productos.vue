<template>
  <layout-main>
    <template #slotlayout>
      <div class="header-container" v-if="!mostrarFormulario">
        <h1 class="titulo">DATOS DE PRODUCTOS</h1>
        <div class="botones">
          <el-button type="primary" @click="abrirFormulario">Crear producto</el-button>
          <el-button type="success" @click="exportarExcel" style="margin-left: 10px;">Exportar a Excel</el-button>
        </div>
      </div>

      <!-- Formulario para gestión de producto -->
      <formulario
        :titulo="'Gestión de productos'"
        v-model:is-open="mostrarFormulario"
        :is-edit="editandoFormulario"
      >
        <template #slotform>
          <formProductos
            :producto="producto"
            @guardar="guardarProducto"
            @cerrarFormulario="mostrarFormulario = false"
          />
        </template>
      </formulario>

      <!-- Tabla de productos -->
      <div v-if="!mostrarFormulario" style="margin-top: 20px;">
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
import formulario from '../../components/formulario.vue';
import formProductos from './componentes/formProductos.vue';
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
    '¿Está seguro de eliminar el producto?',
    'ELIMINAR REGISTRO',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      type: 'error',
    }
  )
    .then(async () => {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/nombre_productos/delete/${id}`);
        if (response.status === 200) {
          ElMessage.success('Producto eliminado con éxito');
          productos.value = productos.value.filter(p => p.id !== id);
        }
      } catch (error) {
        ElMessage.error('Error al eliminar el producto');
      }
    })
    .catch(() => {
      ElMessage.info('Eliminación cancelada');
    });
};

const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/nombre_productos/getdataById/${id}`);
    producto.value = { ...response.data.data };
  } catch (error) {
    ElMessage.error('Error al cargar los datos del producto');
  }
};

const guardarProducto = async (productoForm) => {
  if (editandoFormulario.value) {
    // Actualizar producto
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/nombre_productos/update/${productoForm.id}`,
        productoForm
      );
      if (response.status === 200) {
        ElMessage.success('Producto actualizado con éxito');
        obtenerProductos();
        mostrarFormulario.value = false;
      }
    } catch (error) {
      ElMessage.error('Error al actualizar el producto');
    }
  } else {
    // Crear producto nuevo
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/nombre_productos/save',
        productoForm
      );
      if (response.status === 201) {
        ElMessage.success('Producto creado con éxito');
        obtenerProductos();
        mostrarFormulario.value = false;
      }
    } catch (error) {
      ElMessage.error('Error al crear el producto');
    }
  }
};

const exportarExcel = () => {
  ElMessage.info('Función exportar aún no implementada');
};

const obtenerProductos = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/nombre_productos/getdata');
    productos.value = response.data.data;
  } catch (error) {
    ElMessage.error('Error al obtener productos');
  }
};

onMounted(() => {
  obtenerProductos();
});
</script>

<style scoped>
.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 10px;
}

.titulo {
  flex: 1;
  text-align: center;
  margin: 0;
  font-weight: 600;
  font-size: 20px;
}

.botones {
  display: flex;
  gap: 10px;
}
</style>
