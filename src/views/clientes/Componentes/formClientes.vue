<template>
  <div class="p-6 bg-gray-50 min-h-screen font-inter">
    <el-card class="max-w-5xl mx-auto rounded-2xl shadow-lg border-0 bg-white/90 backdrop-blur-sm transition-all hover:shadow-xl">
      <h2 class="text-2xl font-semibold text-gray-700 mb-6 border-b pb-3 flex items-center gap-2">
        <i class="el-icon-user text-blue-500"></i>
       
      </h2>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="160px"
        :size="formSize"
        @submit.prevent
      >
        <el-row :gutter="20">
          <!-- Tipo de persona -->
          <el-col :span="12">
            <el-form-item label="Tipo de Persona" prop="tipo_persona">
              <el-select v-model="form.tipo_persona" placeholder="Seleccione" class="modern-select">
                <el-option label="Natural" value="natural" />
                <el-option label="Jurídica" value="juridica" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Tipo de tercero -->
          <el-col :span="12">
            <el-form-item label="Tipo de Tercero" prop="tipo_tercero">
              <el-select v-model="form.tipo_tercero" placeholder="Seleccione" class="modern-select">
                <el-option label="Cliente" value="cliente" />
                <el-option label="Proveedor" value="proveedor" />
                <el-option label="Ambos" value="ambos" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Tipo y número de identificación -->
          <el-col :span="12">
            <el-form-item label="Tipo de ID" prop="tipo_identificacion">
              <el-select v-model="form.tipo_identificacion" placeholder="Seleccione" class="modern-select">
                <el-option label="CC" value="CC" />
                <el-option label="NIT" value="NIT" />
                <el-option label="CE" value="CE" />
                <el-option label="PAS" value="PAS" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Número de ID" prop="numero_identificacion">
              <el-input v-model="form.numero_identificacion" class="modern-input" />
            </el-form-item>
          </el-col>

          <!-- Nombres / Apellidos -->
          <template v-if="form.tipo_persona === 'natural'">
            <el-col :span="12">
              <el-form-item label="Nombres">
                <el-input v-model="form.nombres" class="modern-input" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Apellidos">
                <el-input v-model="form.apellidos" class="modern-input" />
              </el-form-item>
            </el-col>
          </template>

          <!-- Razón social -->
          <template v-if="form.tipo_persona === 'juridica'">
            <el-col :span="24">
              <el-form-item label="Razón Social">
                <el-input v-model="form.razon_social" class="modern-input" />
              </el-form-item>
            </el-col>
          </template>

          <!-- Dirección -->
          <el-col :span="12">
            <el-form-item label="Dirección" prop="direccion">
              <el-input v-model="form.direccion" class="modern-input" />
            </el-form-item>
          </el-col>

          <!-- País / Departamento / Ciudad -->
          <el-col :span="12">
            <el-form-item label="País">
              <CountrySelect v-model="form.pais" class="modern-select" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Departamento" prop="departamento">
              <RegionSelect :country="form.pais" v-model="form.departamento" class="modern-select" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Ciudad" prop="ciudad">
              <el-select v-model="form.ciudad" filterable allow-create placeholder="Seleccione o escriba" class="modern-select">
                <el-option v-for="ciudad in ciudades" :key="ciudad" :label="ciudad" :value="ciudad" />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Código postal -->
          <el-col :span="12">
            <el-form-item label="Código Postal">
              <el-input v-model="form.codigo_postal" class="modern-input" />
            </el-form-item>
          </el-col>

          <!-- Teléfono / Correo -->
          <el-col :span="12">
            <el-form-item label="Teléfono">
              <el-input v-model="form.telefono" class="modern-input" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Correo">
              <el-input v-model="form.correo" class="modern-input" />
            </el-form-item>
          </el-col>

          <!-- Cuenta contable -->
          <el-col :span="12">
            <el-form-item label="Cuenta Gasto/Costo">
              <el-select
                v-model="cuentaSeleccionada"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="Buscar cuenta..."
                :remote-method="buscarCuentas"
                :loading="cargandoCuentas"
                class="modern-select"
              >
                <el-option
                  v-for="cuenta in cuentasContablesFiltradas"
                  :key="cuenta.id"
                  :label="`${cuenta.codigo} - ${cuenta.nombre}`"
                  :value="cuenta.id"
                >
                  <div class="flex justify-between">
                    <span class="font-semibold text-gray-700">{{ cuenta.codigo }}</span>
                    <span class="text-gray-500 text-sm">{{ cuenta.nombre }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Actividad económica -->
          <el-col :span="24">
            <el-form-item label="Actividad Económica">
              <el-select v-model="form.actividad_economica" filterable allow-create placeholder="Seleccione una actividad" class="modern-select">
                <el-option
                  v-for="actividad in actividades"
                  :key="actividad.codigo"
                  :label="`${actividad.codigo} - ${actividad.descripcion}`"
                  :value="actividad.codigo"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <!-- Observaciones -->
          <el-col :span="24">
            <el-form-item label="Observaciones">
              <el-input type="textarea" v-model="form.observaciones" rows="3" class="modern-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- Botones -->
        <div class="flex justify-end mt-8 space-x-4">
          <el-button plain @click="$emit('cerrarFormulario')" class="rounded-xl px-6 py-2">
            Cancelar
          </el-button>
          <el-button type="primary" @click="submitForm" class="rounded-xl bg-blue-500 hover:bg-blue-600 px-6 py-2">
            Guardar
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { CountrySelect, RegionSelect } from 'vue3-country-region-select'
import api from '@/api'
import { ElMessage } from 'element-plus'
import Papa from 'papaparse'

const props = defineProps({
  cliente: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['guardar', 'cerrarFormulario'])

const formRef = ref(null)
const formSize = ref('default')
const form = reactive({
  id: null,
  tipo_persona: '',
  tipo_tercero: '',
  tipo_identificacion: '',
  numero_identificacion: '',
  nombres: '',
  apellidos: '',
  razon_social: '',
  direccion: '',
  pais: '',
  departamento: '',
  ciudad: '',
  codigo_postal: '',
  telefono: '',
  correo: '',
  cuenta_gasto: '',
  actividad_economica: '',
  observaciones: ''
})

const ciudades = ref([])
const cuentasContables = ref([])
const cuentasContablesFiltradas = ref([])
const cargandoCuentas = ref(false)
const cuentaSeleccionada = ref(null)
const actividades = ref([])

watch(() => props.cliente, (val) => Object.assign(form, val || {}), { immediate: true })
watch(cuentaSeleccionada, (nueva) => {
  const encontrada = cuentasContables.value.find(c => c.id === nueva)
  form.cuenta_gasto = encontrada ? `${encontrada.codigo} - ${encontrada.nombre}` : ''
})

async function cargarCuentasContables() {
  try {
    cargandoCuentas.value = true
    const empresaId = localStorage.getItem('empresa_id')
    const { data } = await api.get(`/empresas/${empresaId}/cuentas-todas`)
    cuentasContables.value = data.map(c => ({ id: c.id, codigo: c.codigo, nombre: c.nombre }))
    cuentasContablesFiltradas.value = [...cuentasContables.value]
  } catch (e) {
    ElMessage.error('Error al cargar cuentas')
  } finally {
    cargandoCuentas.value = false
  }
}

function buscarCuentas(query) {
  const q = query.toLowerCase()
  cuentasContablesFiltradas.value = cuentasContables.value.filter(
    c => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q)
  )
}

async function cargarActividadesCSV() {
  try {
    const response = await fetch('/ciiu.csv')
    const csv = await response.text()
    const resultados = Papa.parse(csv, { header: true, skipEmptyLines: true, delimiter: ';' })
    actividades.value = resultados.data.map(r => ({
      codigo: r.CODIGO,
      descripcion: r.DESCRIPCION
    }))
  } catch (error) {
    console.error('Error al cargar CIIU:', error)
  }
}

onMounted(() => {
  cargarCuentasContables()
  cargarActividadesCSV()
})

const rules = {
  tipo_persona: [{ required: true, message: 'Seleccione tipo de persona', trigger: 'change' }],
  tipo_tercero: [{ required: true, message: 'Seleccione tipo de tercero', trigger: 'change' }],
  tipo_identificacion: [{ required: true, message: 'Seleccione tipo de ID', trigger: 'change' }],
  numero_identificacion: [{ required: true, message: 'Ingrese número de ID', trigger: 'blur' }],
  direccion: [{ required: true, message: 'Ingrese la dirección', trigger: 'blur' }]
}

function submitForm() {
  formRef.value.validate(valid => valid && emit('guardar', { ...form }))
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.font-inter {
  font-family: 'Inter', sans-serif;
}

.modern-input .el-input__inner,
.modern-select .el-input__inner {
  background-color: #f9fafb;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  padding: 10px 12px;
  transition: all 0.3s ease;
}

.modern-input .el-input__inner:focus,
.modern-select .el-input__inner:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px #bfdbfe;
}

.el-form-item__label {
  font-weight: 600;
  color: #374151;
}

.el-card {
  border: none;
}
</style>

