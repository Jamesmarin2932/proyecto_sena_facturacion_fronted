<template>
  <layout-main>
    <template #slotlayout>
      <h1 class="titulo-seccion">DATOS DE TERCEROS</h1>

      <div class="botones-container" v-if="!mostrarFormulario">
        <el-button type="primary" @click="nuevoCliente">Crear tercero</el-button>
        <el-button type="success" @click="exportarExcel">Exportar a Excel</el-button>
      </div>

      <formulario v-model:is-open="mostrarFormulario" @cerrarFormulario="cerrarFormulario">
        <template #slotform>
          <formClientes :cliente="cliente" @guardar="guardarCliente" @cerrarFormulario="cerrarFormulario" />
        </template>
      </formulario>

      <div v-if="!mostrarFormulario">
        <el-table :data="clientes" stripe style="width: 100%">
          <el-table-column prop="tipo_identificacion" label="Tipo ID" width="120" />
          <el-table-column prop="numero_identificacion" label="Número" width="120" />
          <el-table-column prop="nombres" label="Nombres" width="160" />
          <el-table-column prop="apellidos" label="Apellidos" width="160" />
          <el-table-column prop="direccion" label="Dirección" />
          <el-table-column prop="telefono" label="Teléfono" width="120" />
          <el-table-column prop="correo" label="Correo" />
          <el-table-column fixed="right" label="Opciones" width="120">
            <template #default="scope">
              <el-button link type="primary" :icon="EditPen" @click="editarCliente(scope.row)" />
              <el-button link type="danger" :icon="Delete" @click="eliminarCliente(scope.row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </layout-main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { EditPen, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import api from '@/services/api'
import LayoutMain from '../../components/LayoutMain.vue'
import formulario from '../../components/formulario.vue'
import formClientes from './Componentes/formClientes.vue'

const mostrarFormulario = ref(false)
const cliente = ref({})
const clientes = ref([])

function nuevoCliente() {
  cliente.value = {}
  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  cliente.value = {}
}

async function cargarClientes() {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa')

    const { data } = await api.get('/dato_clientes/getdata', { params: { empresa_id: empresaId } })
    clientes.value = data.data || []
  } catch (err) {
    console.error(err)
    ElMessage.error('Error al cargar clientes')
  }
}

function editarCliente(c) {
  cliente.value = { ...c }
  mostrarFormulario.value = true
}

async function guardarCliente(payload) {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa')

    // agrega empresa_id al payload
    payload.empresa_id = empresaId

    if (payload.id) {
      await api.put(`/dato_clientes/update/${payload.id}`, payload)
      ElMessage.success('Cliente actualizado')
    } else {
      await api.post('/dato_clientes/save', payload)
      ElMessage.success('Cliente creado')
    }

    cerrarFormulario()
    cargarClientes()
  } catch (err) {
    console.error(err)
    ElMessage.error('Error al guardar cliente')
  }
}

async function eliminarCliente(id) {
  try {
    await ElMessageBox.confirm('¿Eliminar este cliente?', 'Confirmar', { type: 'warning' })
    
    // Agrega el empresa_id al request de eliminación
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa')
    
    await api.delete(`/dato_clientes/delete/${id}`, {
      data: { empresa_id: empresaId } // Envía empresa_id en el body
    })
    
    ElMessage.success('Cliente eliminado')
    cargarClientes()
  } catch (err) {
    if (err !== 'cancel') {
      console.error(err)
      ElMessage.error('Error al eliminar cliente')
    }
  }
}


function exportarExcel() {
  if (!clientes.value.length) return ElMessage.warning('No hay datos')
  const ws = XLSX.utils.json_to_sheet(clientes.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'clientes.xlsx')
}

onMounted(cargarClientes)
</script>

<style scoped>
.titulo-seccion {
  text-align: center;
  margin: 20px 0;
  font-size: 22px;
  font-weight: bold;
}
.botones-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
