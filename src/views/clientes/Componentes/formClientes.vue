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

        <!-- País, Departamento y Ciudad -->
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

        <!-- Código Postal -->
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

        <!-- Cuenta Gasto/Costo - MEJORADO -->
        <el-col :span="12">
          <el-form-item label="Cuenta Gasto/Costo">
            <el-select
              v-model="cuentaSeleccionada"
              filterable
              clearable
              remote
              reserve-keyword
              placeholder="Buscar por código o nombre..."
              :remote-method="buscarCuentas"
              :loading="cargandoCuentas"
              style="width: 100%"
            >
              <el-option
                v-for="cuenta in cuentasContablesFiltradas"
                :key="cuenta.id"
                :label="`${cuenta.codigo} - ${cuenta.nombre}`"
                :value="cuenta"
              >
                <span style="float: left; font-weight: bold">{{ cuenta.codigo }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px; margin-left: 10px">
                  {{ cuenta.nombre }}
                </span>
              </el-option>
            </el-select>
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
      <div class="flex justify-end mt-6 space-x-3">
        <el-button @click="$emit('cerrarFormulario')">Cancelar</el-button>
        <el-button type="primary" @click="guardarCliente">Guardar</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import axios from 'axios'
import api from '@/api' // ✅ Importa tu axios configurado
import { CountrySelect, RegionSelect } from 'vue3-country-region-select'
import { ElMessage } from 'element-plus'

const props = defineProps({
  cliente: Object
})
const emit = defineEmits(['guardar', 'cerrarFormulario'])

const formRef = ref(null)
const formSize = ref('default')

const form = reactive({
  // ... otros campos existentes ...
  cuenta_gasto_costo_id: null
})

// Cuenta seleccionada (objeto completo)
const cuentaSeleccionada = ref(null)

// Watcher para sincronizar con el formulario
watch(cuentaSeleccionada, (nuevaCuenta) => {
  if (nuevaCuenta) {
    form.cuenta_gasto_costo_id = nuevaCuenta.id
  } else {
    form.cuenta_gasto_costo_id = null
  }
})

// Watcher para cuando editas un cliente existente
watch(() => props.cliente, (nuevoCliente) => {
  if (nuevoCliente && nuevoCliente.cuenta_gasto_costo_id) {
    // Buscar la cuenta correspondiente al ID guardado
    const cuentaEncontrada = cuentasContables.value.find(
      cuenta => cuenta.id === nuevoCliente.cuenta_gasto_costo_id
    )
    if (cuentaEncontrada) {
      cuentaSeleccionada.value = cuentaEncontrada
    }
  } else {
    cuentaSeleccionada.value = null
  }
}, { immediate: true })

// ... rules existentes ...

const ciudades = ref([])
const countryCodes = {
  Colombia: 'co',
  México: 'mx',
  Argentina: 'ar',
  Perú: 'pe',
  Chile: 'cl',
  Ecuador: 'ec',
  Venezuela: 've',
  Panamá: 'pa',
  Uruguay: 'uy',
}

// ... watch de ciudades y código postal ...

/* ------------------ ✅ CUENTAS CONTABLES - CON SANCTUM ------------------ */
const cuentasContables = ref([])
const cuentasContablesFiltradas = ref([])
const cargandoCuentas = ref(false)

const cargarCuentasContables = async () => {
  try {
    cargandoCuentas.value = true
    
    // ✅ Usa tu api configurada
    const response = await api.get('/cuentas')
    
    cuentasContables.value = response.data
    cuentasContablesFiltradas.value = cuentasContables.value
    
    // Si estamos editando un cliente, buscar su cuenta
    if (props.cliente && props.cliente.cuenta_gasto_costo_id) {
      const cuentaExistente = cuentasContables.value.find(
        cuenta => cuenta.id === props.cliente.cuenta_gasto_costo_id
      )
      if (cuentaExistente) {
        cuentaSeleccionada.value = cuentaExistente
      }
    }
  } catch (error) {
    console.error('Error al cargar cuentas contables:', error)
    if (error.response?.status === 401) {
      ElMessage.error('Sesión expirada. Por favor inicie sesión nuevamente.')
    } else {
      ElMessage.error('Error al cargar las cuentas contables')
    }
    cuentasContables.value = []
  } finally {
    cargandoCuentas.value = false
  }
}

const buscarCuentas = (query) => {
  if (!query) {
    cuentasContablesFiltradas.value = cuentasContables.value
    return
  }
  
  const q = query.toLowerCase().trim()
  cuentasContablesFiltradas.value = cuentasContables.value.filter(c =>
    c.codigo.toLowerCase().includes(q) || 
    c.nombre.toLowerCase().includes(q)
  )
}

onMounted(() => {
  cargarCuentasContables()
})


const guardarCliente = () => {
  formRef.value.validate((valid) => {
    if (!valid) return
    emit('guardar', { ...form })
  })
}
</script>

<style scoped>
/* Mejorar la visualización de las opciones */
.el-select-dropdown__item {
  display: flex;
  justify-content: space-between;
  padding: 8px 20px;
}
</style>


