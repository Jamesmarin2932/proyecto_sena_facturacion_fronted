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
import { EditPen, Delete } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formClientes from '../clientes/Componentes/formClientes.vue';
import axios from "axios";


import api from '@/services/api';  // ajusta la ruta según tu estructura

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

// Cerrar formulario
const cerrarFormularioHandler = () => {
  mostrarFormulario.value = false;
  cliente.value = {};
};

// ✅ Obtener clientes

// ✅ Obtener clientes filtrados por empresa_id
async function getClientes() {
  try {
    const token = localStorage.getItem("token");
    const empresaId = localStorage.getItem("empresa_id");

    if (!empresaId) {
      console.error("No hay empresa seleccionada");
      return;
    }

    const response = await axios.get(
      "http://127.0.0.1:8000/api/dato_clientes/getdata",
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          empresa_id: empresaId // 🔹 Lo enviamos como parámetro
        }
      }
    );

    if (response.data.status === 200) {
      clientes.value = response.data.data; // 🔹 Llenar tabla
    } else {
      clientes.value = [];
    }

    console.log("Clientes cargados:", clientes.value);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    clientes.value = [];
  }
}



// ✅ Editar cliente
const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await api.get(`/dato_clientes/getdataById/${id}`);
    cliente.value = { ...response.data.data };
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    ElMessage({ type: 'error', message: 'Hubo un error al cargar los datos del cliente' });
  }
};

// ✅ Crear o actualizar cliente
const actualizarCliente = async (clienteActualizado) => {
  try {
    const empresa_id = localStorage.getItem('empresa_id');

    if (!empresa_id) {
      ElMessage.error('No se encontró empresa seleccionada. Por favor selecciona una empresa.');
      return;
    }

    const clienteConEmpresa = { ...clienteActualizado, empresa_id };

    if (editandoFormulario.value) {
      const response = await api.put(`/dato_clientes/update/${clienteActualizado.id}`, clienteConEmpresa);
      if (response.status === 200) {
        ElMessage.success('Cliente actualizado con éxito');
        getClientes();
        cerrarFormularioHandler();
      }
    } else {
      const response = await api.post('/dato_clientes', clienteConEmpresa);
      if (response.status === 200 || response.status === 201) {
        ElMessage.success('Cliente creado con éxito');
        getClientes();
        cerrarFormularioHandler();
      } else {
        ElMessage.error('Error al crear tercero');
      }
    }
  } catch (error) {
    console.error('Error al guardar el cliente:', error);
    const msg = error.response?.data?.message || 'Hubo un error al guardar el cliente';
    ElMessage.error(msg);
  }
};


// ✅ Eliminar cliente
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
      const response = await api.delete(`/dato_clientes/delete/${id}`);
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

// Exportar Excel
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
    "Razon social": cliente.razon_social,
    "Tipo persona": cliente.tipo_persona,
    "Pais": cliente.pais,
    "Departamento": cliente.departamento,
    "Dirección": cliente.direccion,
    "Ciudad": cliente.ciudad,
    "Código postal": cliente.codigo_postal,
    "Teléfono": cliente.telefono,
    "Correo": cliente.correo,
    "Tipo de tercero": cliente.tipo_tercero,
    "Cuenta gasto": cliente.cuenta_gasto,
    "Actividad económica": cliente.actividad_economica,
    "Responsable IVA": cliente.responsable_iva ? 'Sí' : 'No',
    "Observaciones": cliente.observaciones,
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