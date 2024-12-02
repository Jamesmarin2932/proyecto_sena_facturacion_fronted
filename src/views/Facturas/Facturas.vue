<template>
  <layout-main>
    <template #slotlayout>
      <header-button 
        v-if="!mostrarFormulario"
        :titulo="'DATOS DE FACTURAS'" 
        :tituloboton="'Crear factura'" 
        :abrir="abrirFormulario" 
      />

      <!-- Formulario para gestión de facturas -->
      <formulario :titulo="'Gestión de facturas'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
        <template #slotform>
          <FormFacturas />
        </template>
      </formulario>

      <!-- Tabla de datos de facturas -->
      <div v-if="!mostrarFormulario">
        <el-table :data="facturas" stripe style="width: 100%">
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
            <template #default="registro">
              <!-- Botón de edición -->
              <el-button link type="primary" :icon="EditPen" @click="editarFormulario(registro.row.id)" />
              <!-- Botón de eliminación -->
              <el-button link type="danger" :icon="Delete" @click="eliminarFactura(registro.row.id)" />
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
import FormFacturas from '../facturas/componentes/formFacturas.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const mostrarFormulario = ref(false);
const editandoFormulario = ref(false);
const facturas = ref([]); // Aquí guardamos las facturas
const factura = ref({}); // Para almacenar los datos de la factura que se editará

// Abrir formulario de creación
const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  factura.value = {};
};

// Método para eliminar una factura
const eliminarFactura = (id) => {
  ElMessageBox.confirm(
    `¿Está seguro de eliminar esta factura?`,
    'ELIMINAR FACTURA',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      type: 'error',
    }
  )
  .then(async () => {
    const url = `http://127.0.0.1:8000/api/descripcion_facturas/delete`;

    try {
      const response = await axios.delete(url, { data: { id } });

      if (response.status === 200) {
        ElMessage({
          type: 'success',
          message: 'Factura eliminada con éxito',
        });
        // Eliminar la factura de la lista en el frontend
        facturas.value = facturas.value.filter(factura => factura.id !== id);
      } else {
        ElMessage({
          type: 'error',
          message: 'La eliminación no fue exitosa',
        });
      }
    } catch (error) {
      console.error('Error al eliminar la factura:', error);
      ElMessage({
        type: 'error',
        message: 'Hubo un error al eliminar la factura',
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

// Método para editar una factura
const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/descripcion_facturas/getdataById/${id}`);
    
    // Asignar los datos de la respuesta a la variable
    factura.value = response.data.data;
  } catch (error) {
    console.error('Error al cargar la factura:', error);
    ElMessage.error('Hubo un error al cargar la factura');
  }
};

// Obtener las facturas al cargar la página
const getFacturas = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/descripcion_facturas/getdata');
    facturas.value = response.data.data;
  } catch (error) {
    console.error('Error al obtener facturas:', error);
  }
};

onMounted(() => {
  getFacturas();
});
</script>

<style scoped>
</style>
