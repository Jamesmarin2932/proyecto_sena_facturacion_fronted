<template>
    <LayoutMain>
      <template #slotlayout>
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">Gestión de Cuentas Contables</h2>
  
          <!-- Formulario -->
          <el-card class="mb-6">
            <el-form
              :model="form"
              :rules="rules"
              ref="formRef"
              label-width="120px"
              class="w-full"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Código" prop="codigo">
                    <el-input v-model="form.codigo" placeholder="Código de la cuenta" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Nombre" prop="nombre">
                    <el-input v-model="form.nombre" placeholder="Nombre de la cuenta" />
                  </el-form-item>
                </el-col>
              </el-row>
  
              <el-form-item>
                <el-button type="primary" @click="guardarCuenta">Guardar</el-button>
                <el-button @click="cancelarEdicion" v-if="modoEdicion">Cancelar</el-button>
              </el-form-item>
            </el-form>
          </el-card>
  
          <!-- Tabla de cuentas -->
          <el-card>
            <el-table :data="cuentas" style="width: 100%">
              <el-table-column prop="codigo" label="Código" width="120" />
              <el-table-column prop="nombre" label="Nombre" />
              <el-table-column label="Acciones" width="180">
                <template #default="scope">
                  <el-button size="small" @click="editarCuenta(scope.row)">Editar</el-button>
                  <el-button size="small" type="danger" @click="eliminarCuenta(scope.row.id)">Eliminar</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </template>
    </LayoutMain>
  </template>
  
  <script setup>
import LayoutMain from '@/components/LayoutMain.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// Establece base URL del backend
const API_BASE = 'http://localhost:8000/api'

const cuentas = ref([])
const form = ref({ codigo: '', nombre: '' })
const modoEdicion = ref(false)
const cuentaEditandoId = ref(null)
const formRef = ref()

const rules = {
  codigo: [{ required: true, message: 'El código es obligatorio', trigger: 'blur' }],
  nombre: [{ required: true, message: 'El nombre es obligatorio', trigger: 'blur' }],
}

const cargarCuentas = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/cuentas`)
    cuentas.value = data
  } catch (error) {
    ElMessage.error('Error al cargar las cuentas')
  }
}

const guardarCuenta = async () => {
  await formRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (modoEdicion.value) {
        await axios.put(`${API_BASE}/cuentas/${cuentaEditandoId.value}`, form.value)
        ElMessage.success('Cuenta actualizada correctamente')
      } else {
        await axios.post(`${API_BASE}/cuentas`, form.value)
        ElMessage.success('Cuenta creada correctamente')
      }
      limpiarFormulario()
      cargarCuentas()
    } catch (error) {
      ElMessage.error('Error al guardar la cuenta')
    }
  })
}

const editarCuenta = (cuenta) => {
  form.value = { codigo: cuenta.codigo, nombre: cuenta.nombre }
  cuentaEditandoId.value = cuenta.id
  modoEdicion.value = true
}

const cancelarEdicion = () => {
  limpiarFormulario()
}

const eliminarCuenta = async (id) => {
  try {
    await axios.delete(`${API_BASE}/cuentas/${id}`)
    ElMessage.success('Cuenta eliminada')
    cargarCuentas()
  } catch (error) {
    ElMessage.error('Error al eliminar la cuenta')
  }
}

const limpiarFormulario = () => {
  form.value = { codigo: '', nombre: '' }
  modoEdicion.value = false
  cuentaEditandoId.value = null
  formRef.value?.clearValidate()
}

onMounted(() => {
  cargarCuentas()
})
</script>

  