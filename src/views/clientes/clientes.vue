<template>
  <layout-main>
    <template #slotlayout>
      <h1 class="titulo-seccion">DATOS DE TERCEROS</h1>

      <div class="botones-container" v-if="!mostrarFormulario">
        <el-button type="primary" @click="abrirFormulario">Crear tercero</el-button>
        <el-button type="success" @click="exportarExcel">Exportar a Excel</el-button>
      </div>

      <!-- Formulario para gestión de cliente -->
      <formulario 
        :titulo="''" 
        v-model:is-open="mostrarFormulario"
        @cerrarFormulario="cerrarFormularioHandler"
      >
        <template #slotform>
          <formClientes 
            :cliente="cliente" 
            @guardar="actualizarCliente"
            @cerrarFormulario="cerrarFormularioHandler"
          />
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
            <template #default="scope">
              <el-button link type="primary" :icon="EditPen" @click="editarFormulario(scope.row.id)" />
              <el-button link type="danger" :icon="Delete" @click="eliminarFormulario(scope.row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </layout-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { EditPen, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formClientes from '../clientes/Componentes/formClientes.vue';
import api from '@/api'; // Asegúrate de que apunte a src/api.js

const mostrarFormulario = ref(false);
const editandoFormulario = ref(false);
const cliente = ref({});
const clientes = ref([]);

// Abrir formulario nuevo cliente
const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  cliente.value = {};
};

// Cerrar formulario y limpiar cliente
const cerrarFormularioHandler = () => {
  mostrarFormulario.value = false;
  cliente.value = {};
};

// Obtener clientes
const getClientes = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/dato_clientes/getdata');
    clientes.value = response.data.data.reverse();

  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
};

// Editar cliente
const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/dato_clientes/getdataById/${id}`);
    cliente.value = { ...response.data.data };
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    ElMessage({
      type: 'error',
      message: 'Hubo un error al cargar los datos del cliente',
    });
  }
};

// Actualizar cliente (crear o editar)
const actualizarCliente = async (clienteActualizado) => {
  try {
    if (editandoFormulario.value) {
      // Actualizar cliente existente
      const response = await axios.put(`http://127.0.0.1:8000/api/dato_clientes/update/${clienteActualizado.id}`, clienteActualizado);
      if (response.status === 200) {
        ElMessage({ type: 'success', message: 'Cliente actualizado con éxito' });
        getClientes();
        cerrarFormularioHandler();
      }
    } else {
      // Crear nuevo cliente
      const response = await api.post('/dato_clientes/save', clienteActualizado);

      if (response.status === 200 || response.status === 201) {
        ElMessage({ type: 'success', message: 'Tercero creado con éxito' });
        getClientes();
        cerrarFormularioHandler();
      } else {
        ElMessage({ type: 'error', message: 'Error al crear tercero' });
      }
    }
  } catch (error) {
    console.error('Error al guardar el cliente:', error);
    ElMessage({ type: 'error', message: 'Hubo un error al guardar el cliente' });
  }
};

// Eliminar cliente
const eliminarFormulario = (id) => {
  ElMessageBox.confirm(
    '¿Está seguro de eliminar el cliente?',
    'ELIMINAR REGISTRO',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      type: 'error',
    }
  )
  .then(async () => {
    try {
      const response = await axios.delete(`http://127.0.0.1:8000/api/dato_clientes/delete/${id}`);
      if (response.status === 200) {
        ElMessage({ type: 'success', message: 'Cliente eliminado con éxito' });
        clientes.value = clientes.value.filter(c => c.id !== id);
      } else {
        ElMessage({ type: 'error', message: 'La eliminación no fue exitosa' });
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      ElMessage({ type: 'error', message: 'Hubo un error al eliminar el cliente' });
    }
  })
  .catch(() => {
    ElMessage({ type: 'info', message: 'Solicitud cancelada' });
  });
};

// Función para exportar la tabla a Excel
const exportarExcel = () => {
  if (!clientes.value.length) {
    ElMessage({ type: 'warning', message: 'No hay datos para exportar' });
    return;
  }

  const datosParaExportar = clientes.value.map(cliente => ({
  "Tipo de identificación": cliente.tipo_identificacion,
  "Número": cliente.numero_identificacion,
  "Nombres": cliente.nombres,
  "Apellidos": cliente.apellidos,
  "Razon social":cliente.razon_social,
  "Tipo perosna":cliente.tipo_persona,
  "Pais":cliente.pais,
  "Departamento":cliente.departamento,
  "Dirección": cliente.direccion,
  "Ciudad": cliente.ciudad,
  "Codigo postal":cliente.codigo_postal,
  "Teléfono": cliente.telefono,
  "Correo": cliente.correo,
  "Tipo de tercero": cliente.tipo_tercero,
  "Cuenta gasto":cliente.cuenta_gasto,
  "Actividad económica": cliente.actividad_economica,
  "Responsable IVA": cliente.responsable_iva ? 'Sí' : 'No',
"Observaciones":cliente.observaciones,
  // Otros campos que tengas
}));


  const worksheet = XLSX.utils.json_to_sheet(datosParaExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  try {
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "clientes.xlsx");
  } catch (e) {
    console.error(e);
    ElMessage({ type: "error", message: "Error al exportar a Excel" });
  }
};

onMounted(() => {
  getClientes();
});
</script>
<style scoped>
.titulo-seccion {
  text-align: center;
  margin: 20px 0 10px;
  font-size: 22px;
  font-weight: bold;
}

.botones-container {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

</style>