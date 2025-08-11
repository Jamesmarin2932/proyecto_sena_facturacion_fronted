<template>
  <LayoutMain>
    <template #slotlayout>
      <h1>Gestión de Empresas</h1>

      <!-- Formulario -->
      <el-form :model="empresa" label-width="180px" @submit.prevent>
        <el-form-item label="Nombre o Razón Social">
          <el-input v-model="empresa.nombre_razon_social" />
        </el-form-item>

        <el-form-item label="Nombre Comercial">
          <el-input v-model="empresa.nombre_comercial" />
        </el-form-item>

        <el-form-item label="NIT">
          <el-input v-model="empresa.nit" />
        </el-form-item>

        <el-form-item label="Dirección">
          <el-input v-model="empresa.direccion" />
        </el-form-item>

        <el-form-item label="Ciudad">
          <el-input v-model="empresa.ciudad" />
        </el-form-item>

        <el-form-item label="Departamento">
          <el-input v-model="empresa.departamento" />
        </el-form-item>

        <el-form-item label="País">
          <el-input v-model="empresa.pais" />
        </el-form-item>

        <el-form-item label="Actividad Económica">
          <el-input v-model="empresa.actividad_economica" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="guardarEmpresa">
            {{ empresa.id ? 'Actualizar' : 'Guardar' }}
          </el-button>
          <el-button @click="resetForm">Cancelar</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <!-- Tabla -->
      <el-table :data="empresas" style="width: 100%">
        <el-table-column prop="nombre_razon_social" label="Nombre o Razón Social" />
        <el-table-column prop="nombre_comercial" label="Nombre Comercial" />
        <el-table-column prop="nit" label="NIT" />
        <el-table-column prop="direccion" label="Dirección" />
        <el-table-column prop="ciudad" label="Ciudad" />
        <el-table-column prop="departamento" label="Departamento" />
        <el-table-column prop="pais" label="País" />
        <el-table-column prop="actividad_economica" label="Actividad Económica" />

        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" @click="editarEmpresa(scope.row)">Editar</el-button>
            <el-button size="small" type="danger" @click="eliminarEmpresa(scope.row.id)">Eliminar</el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </LayoutMain>
</template>

<script setup>
import LayoutMain from '../../components/LayoutMain.vue'
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const empresa = ref({
  id: null,
  nombre_razon_social: '',
  nombre_comercial: '',
  nit: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  pais: '',
  actividad_economica: ''
})

const empresas = ref([])

const cargarEmpresas = async () => {
  try {
    const { data } = await axios.get('/api/empresas')
    empresas.value = data
  } catch {
    ElMessage.error('Error al cargar empresas')
  }
}

const guardarEmpresa = async () => {
  try {
    if (empresa.value.id) {
      await axios.put(`/api/empresas/${empresa.value.id}`, empresa.value)
      ElMessage.success('Empresa actualizada')
    } else {
      await axios.post('/api/empresas', empresa.value)
      ElMessage.success('Empresa creada')
    }
    resetForm()
    cargarEmpresas()
  } catch {
    ElMessage.error('Error al guardar empresa')
  }
}

const editarEmpresa = (emp) => {
  empresa.value = { ...emp }
}

const eliminarEmpresa = async (id) => {
  try {
    await ElMessageBox.confirm('¿Está seguro de eliminar esta empresa?', 'Confirmar', { type: 'warning' })
    await axios.delete(`/api/empresas/${id}`)
    ElMessage.success('Empresa eliminada')
    cargarEmpresas()
  } catch {}
}

const resetForm = () => {
  empresa.value = {
    id: null,
    nombre_razon_social: '',
    nombre_comercial: '',
    nit: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: '',
    actividad_economica: ''
  }
}

onMounted(cargarEmpresas)
</script>

