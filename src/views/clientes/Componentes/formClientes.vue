<template>
  <el-card shadow="hover" class="max-w-4xl mx-auto mt-6 p-6 rounded-2xl">
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

        <!-- Nombres / Apellidos -->
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

        <!-- Razón social -->
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

        <!-- País / Departamento / Ciudad -->
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

        <!-- Teléfono / Correo -->
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

        <!-- Cuenta Gasto/Costo -->
        <el-col :span="12">
          <el-form-item label="Cuenta Gasto/Costo">
            <el-select
              v-model="cuentaSeleccionada"
              filterable
              allow-create
              default-first-option
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
                :value="cuenta.id"
              >
                <span style="float:left;font-weight:bold">{{ cuenta.codigo }}</span>
                <span style="float:right;color:#8492a6;font-size:13px;margin-left:10px">
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
        <el-button type="primary" @click="submitForm">Guardar</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { CountrySelect, RegionSelect } from 'vue3-country-region-select'
import api from '@/api'
import { ElMessage } from 'element-plus'

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

// ahora cuentaSeleccionada guarda el `id` de la cuenta (número/string) o un texto libre cuando el usuario crea
const cuentaSeleccionada = ref(null)

/* cuando llega props.cliente solo asignamos al form; la selección de cuenta
   la inicializamos después de que se carguen las cuentas (ver watcher de cuentasContables) */
watch(
  () => props.cliente,
  (val) => {
    Object.assign(form, val || {})
  },
  { immediate: true }
)

/* cuando cambia la selección: puede ser
   - null -> limpiar
   - string (texto libre creado por allow-create) -> guardarlo tal cual
   - id (número/string) -> buscar la cuenta por id y armar el label en form.cuenta_gasto
*/
watch(cuentaSeleccionada, (nueva) => {
  if (nueva === null || nueva === undefined || nueva === '') {
    form.cuenta_gasto = ''
    return
  }

  if (typeof nueva === 'string') {
    // podría ser un id en texto o un texto libre; intentamos resolver a cuenta por id primero
    const byId = cuentasContables.value.find(c => String(c.id) === nueva)
    if (byId) {
      form.cuenta_gasto = `${byId.codigo} - ${byId.nombre}`
    } else {
      // texto libre
      form.cuenta_gasto = nueva
    }
    return
  }

  // si es número (o cualquier otro tipo), buscar por id
  const encontrada = cuentasContables.value.find(c => c.id === nueva || String(c.id) === String(nueva))
  if (encontrada) {
    form.cuenta_gasto = `${encontrada.codigo} - ${encontrada.nombre}`
  } else {
    form.cuenta_gasto = ''
  }
})

/* cuando las cuentas se cargan, si el cliente ya trae cuenta_gasto intentamos
   seleccionar la cuenta correspondiente (por id o por label), si no, dejamos el texto */
watch(cuentasContables, (lista) => {
  if (!lista || !lista.length) return

  const val = props.cliente && props.cliente.cuenta_gasto
  if (!val) return

  // buscar por id
  let encontrada = lista.find(c => c.id === val || String(c.id) === String(val))
  if (encontrada) {
    cuentaSeleccionada.value = encontrada.id
    return
  }

  // buscar por label "codigo - nombre" o por codigo
  encontrada = lista.find(c => `${c.codigo} - ${c.nombre}` === val || c.codigo === val)
  if (encontrada) {
    cuentaSeleccionada.value = encontrada.id
    return
  }

  // si no se encuentra, dejamos el texto libre
  if (typeof val === 'string') {
    cuentaSeleccionada.value = val
  }
}, { immediate: true })

const cargarCuentasContables = async () => {
  try {
    cargandoCuentas.value = true
    const { data } = await api.get('/cuentas/contables')
    cuentasContables.value = data
    cuentasContablesFiltradas.value = data
  } catch (e) {
    ElMessage.error('Error al cargar las cuentas contables')
  } finally {
    cargandoCuentas.value = false
  }
}

function buscarCuentas(query) {
  if (!query) {
    cuentasContablesFiltradas.value = cuentasContables.value
    return
  }
  const q = query.toLowerCase().trim()
  cuentasContablesFiltradas.value = cuentasContables.value.filter(
    c => (c.codigo && c.codigo.toLowerCase().includes(q)) || (c.nombre && c.nombre.toLowerCase().includes(q))
  )
}

onMounted(cargarCuentasContables)

const rules = {
  tipo_persona: [{ required: true, message: 'Seleccione tipo de persona', trigger: 'change' }],
  tipo_tercero: [{ required: true, message: 'Seleccione tipo de tercero', trigger: 'change' }],
  tipo_identificacion: [{ required: true, message: 'Seleccione tipo de ID', trigger: 'change' }],
  numero_identificacion: [{ required: true, message: 'Ingrese número de ID', trigger: 'blur' }],
  direccion: [{ required: true, message: 'Ingrese la dirección', trigger: 'blur' }]
}

function submitForm() {
  formRef.value.validate((valid) => {
    if (!valid) return
    emit('guardar', { ...form })
  })
}
</script>

<style scoped>
.el-select-dropdown__item {
  display: flex;
  justify-content: space-between;
  padding: 8px 20px;
}
</style>
