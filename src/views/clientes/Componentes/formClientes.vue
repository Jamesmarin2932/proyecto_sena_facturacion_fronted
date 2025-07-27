<template>
  <el-card shadow="hover" class="max-w-4xl mx-auto mt-6 p-6 rounded-2xl">
    <h2 class="text-xl font-semibold mb-4"></h2>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :size="formSize"
      label-width="150px"
      @submit.prevent
    >
      <el-row :gutter="20">
        <!-- Tipo de Persona -->
        <el-col :span="12">
          <el-form-item label="Tipo de Persona" prop="tipo_persona">
            <el-select v-model="form.tipo_persona" placeholder="Seleccione">
              <el-option label="Natural" value="natural" />
              <el-option label="Jurídica" value="juridica" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- Tipo de Tercero -->
        <el-col :span="12">
          <el-form-item label="Tipo de Tercero" prop="tipo_tercero">
            <el-select v-model="form.tipo_tercero" placeholder="Seleccione">
              <el-option label="Cliente" value="cliente" />
              <el-option label="Proveedor" value="proveedor" />
              <el-option label="Ambos" value="ambos" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- Tipo y número de identificación -->
        <el-col :span="12">
          <el-form-item label="Tipo de ID" prop="tipo_identificacion">
            <el-select v-model="form.tipo_identificacion" placeholder="Seleccione">
              <el-option label="CC" value="CC" />
              <el-option label="NIT" value="NIT" />
              <el-option label="CE" value="CE" />
              <el-option label="PAS" value="PAS" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Número de ID" prop="numero_identificacion">
            <el-input v-model="form.numero_identificacion" />
          </el-form-item>
        </el-col>

        <!-- Nombres y apellidos (solo si es natural) -->
        <template v-if="form.tipo_persona === 'natural'">
          <el-col :span="12">
            <el-form-item label="Nombres">
              <el-input v-model="form.nombres" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Apellidos">
              <el-input v-model="form.apellidos" />
            </el-form-item>
          </el-col>
        </template>

        <!-- Razón social (solo si es jurídica) -->
        <template v-if="form.tipo_persona === 'juridica'">
          <el-col :span="24">
            <el-form-item label="Razón Social">
              <el-input v-model="form.razon_social" />
            </el-form-item>
          </el-col>
        </template>

        <!-- Dirección -->
        <el-col :span="12">
          <el-form-item label="Dirección" prop="direccion">
            <el-input v-model="form.direccion" />
          </el-form-item>
        </el-col>

       <!-- País, Departamento y Ciudad (ordenado correctamente) -->
<el-col :span="12">
  <el-form-item label="País">
    <CountrySelect v-model="form.pais" />
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="Departamento" prop="departamento">
    <RegionSelect :country="form.pais" v-model="form.departamento" />
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="Ciudad" prop="ciudad">
    <el-select
      v-model="form.ciudad"
      filterable
      allow-create
      default-first-option
      placeholder="Escriba o seleccione"
    >
      <el-option
        v-for="ciudad in ciudades"
        :key="ciudad"
        :label="ciudad"
        :value="ciudad"
      />
    </el-select>
  </el-form-item>
</el-col>

        <!-- Código Postal y País -->
        <el-col :span="12">
          <el-form-item label="Código Postal">
            <el-input v-model="form.codigo_postal" />
          </el-form-item>
        </el-col>


        <!-- Teléfono y Correo -->
        <el-col :span="12">
          <el-form-item label="Teléfono">
            <el-input v-model="form.telefono" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Correo">
            <el-input v-model="form.correo" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
  <el-form-item label="Cuenta Gasto/Costo">
    <el-input v-model="form.cuenta_gasto_costo" placeholder="Ej: 510505 - Gastos de Administración" />
  </el-form-item>
</el-col>

        <!-- Actividad Económica -->
        <el-col :span="24">
          <el-form-item label="Actividad Económica">
            <el-input v-model="form.actividad_economica" />
          </el-form-item>
        </el-col>

        <!-- Observaciones -->
        <el-col :span="24">
          <el-form-item label="Observaciones">
            <el-input type="textarea" v-model="form.observaciones" rows="3" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Botones -->
      <!-- Botones alineados a la derecha -->
<div class="flex justify-end mt-6 space-x-3">
  <el-button @click="$emit('cerrarFormulario')">Cancelar</el-button>
  <el-button type="primary" @click="guardarCliente">Guardar</el-button>
</div>

    </el-form>
  </el-card>
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

import api from '@/api'; // ✅ Este es el cliente Axios con baseURL a Render

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
const getClientes = async () => {
  try {
    const response = await api.get('/dato_clientes/getdata');
    clientes.value = response.data.data.reverse();
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    ElMessage({ type: 'error', message: 'Error al obtener los clientes' });
  }
};

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
    if (editandoFormulario.value) {
      const response = await api.put(`/dato_clientes/update/${clienteActualizado.id}`, clienteActualizado);
      if (response.status === 200) {
        ElMessage({ type: 'success', message: 'Cliente actualizado con éxito' });
        getClientes();
        cerrarFormularioHandler();
      }
    } else {
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



