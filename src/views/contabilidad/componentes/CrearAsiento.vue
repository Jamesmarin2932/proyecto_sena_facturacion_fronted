<template>
  <div>
    <!-- Cabecera -->
    <el-row :gutter="10">
      <el-col :span="5">
        <el-select
          v-model="form.tipo"
          placeholder="Tipo de asiento *"
          style="width: 100%;"
          :disabled="modoEdicion"
        >
          <el-option label="CC - Comprobante de Contabilidad" value="CC" />
          <el-option label="RC - Recibo de Caja" value="RC" />
          <el-option label="NC - Nota Contable" value="NC" />
          <el-option label="CE - Comprobante de Egreso" value="CE" />
        </el-select>
      </el-col>
      <el-col :span="5">
        <el-date-picker v-model="form.fecha" type="date" placeholder="Fecha" style="width: 100%;" />
      </el-col>
      <el-col :span="5">
        <el-input v-model="form.factura" placeholder="N° Factura" />
      </el-col>
      <el-col :span="5">
        <el-input
          v-model="form.consecutivo"
          placeholder="Consecutivo"
          :disabled="!modoManual || modoEdicion"
          :loading="cargandoConsecutivo"
        >
          <template #suffix>
            <el-icon v-if="cargandoConsecutivo" class="is-loading">
              <Loading />
            </el-icon>
          </template>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-button
          @click="toggleModoManual"
          type="warning"
          :disabled="modoEdicion"
        >
          {{ modoManual ? 'Automático' : 'Manual' }}
        </el-button>
      </el-col>
    </el-row>

    <el-divider />

    <!-- Tabla editable -->
    <el-table :data="form.detalles" border style="width: 100%;">
      <el-table-column label="Cuenta">
        <template #default="{ row }">
          <el-autocomplete
            v-model="row.cuenta"
            :fetch-suggestions="fetchSuggestions"
            placeholder="Código o nombre de cuenta"
            clearable
            @select="item => handleSelectCuenta(row)(item)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Nombre Cuenta">
        <template #default="{ row }">
          <el-input v-model="row.nombreCuenta" placeholder="Nombre de cuenta" disabled />
        </template>
      </el-table-column>

      <el-table-column label="Tercero">
        <template #default="{ row }">
          <el-autocomplete
            v-model="row.tercero_nombre"
            :fetch-suggestions="buscarTerceros"
            placeholder="Buscar tercero"
            clearable
            @select="item => handleSelectTercero(row, item)"
          />
        </template>
      </el-table-column>

      <el-table-column label="Descripción">
        <template #default="{ row }">
          <el-input v-model="row.concepto" placeholder="Descripción" />
        </template>
      </el-table-column>

      <el-table-column label="Débito">
        <template #default="{ row }">
          <el-input-number v-model="row.debito" :min="0" />
        </template>
      </el-table-column>

      <el-table-column label="Crédito">
        <template #default="{ row }">
          <el-input-number v-model="row.credito" :min="0" />
        </template>
      </el-table-column>

      <el-table-column label="Saldo">
        <template #default="{ row }">
          <el-input :value="row.debito - row.credito" disabled />
        </template>
      </el-table-column>

      <el-table-column width="60" align="center">
        <template #default="{ $index }">
          <el-button
            v-if="form.detalles.length > 1"
            type="danger"
            :icon="Delete"
            circle
            size="small"
            @click="eliminarFila($index)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-button 
      type="primary" 
      icon="el-icon-plus" 
      @click="agregarFila" 
      style="margin-top: 10px;"
      ref="agregarFilaBtn"
      @keydown.tab.prevent="agregarFilaConTab"
    >
      Agregar fila
    </el-button>

    <!-- Totales -->
    <el-row style="margin-top: 20px;" justify="end" :gutter="20">
      <el-col :span="6">
        <el-statistic title="Total Débito" :value="totalDebito" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Total Crédito" :value="totalCredito" />
      </el-col>
      <el-col :span="6">
        <el-statistic
          title="Diferencia"
          :value="diferencia"
          :value-style="{ color: diferencia === 0 ? 'green' : 'red' }"
        />
      </el-col>
    </el-row>

    <!-- Botones Guardar / Cancelar -->
    <el-row style="margin-top: 20px;" justify="end" :gutter="10">
      <el-col :span="3">
        <el-button @click="cancelar" type="default" :disabled="guardando">
          Cancelar
        </el-button>
      </el-col>
      <el-col :span="3">
        <el-button
          type="primary"
          :loading="guardando"
          :disabled="diferencia !== 0 || guardando"
          @click="guardarAsiento"
        >
          {{ props.modoEdicion ? 'Actualizar' : 'Guardar' }}
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Delete } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import api from '@/api'

const props = defineProps({
  asiento: { type: Object, default: null },
  modoEdicion: { type: Boolean, default: false }
})
const emit = defineEmits(['asientoGuardado', 'cancelar'])

/* ======= STATE ======= */
const form = reactive({
  tipo: '',
  fecha: '',
  factura: '',
  consecutivo: '',
  detalles: [
    { cuenta: '', nombreCuenta: '', tercero_id: null, tercero_nombre: '', concepto: '', debito: 0, credito: 0, saldo: 0 }
  ]
})
const modoManual          = ref(false)
const cuentasContables    = ref([])
const guardando           = ref(false)
const cargandoConsecutivo = ref(false)
const agregarFilaBtn      = ref(null) // Referencia al botón de agregar fila

/* ======= FUNCIONES ======= */
function obtenerNombreCuenta(codigo) {
  const cta = cuentasContables.value.find(c => c.codigo === codigo)
  return cta ? cta.nombre : 'Cuenta no encontrada'
}

async function cargarCuentasContables() {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    const globales  = await api.get('/cuentas/contables')
    const empresa   = await api.get(`/empresas/${empresaId}/cuentas-todas`)
    cuentasContables.value = [
      ...globales.data.map(c => ({ codigo: c.codigo, nombre: c.nombre })),
      ...empresa.data.map(c => ({ codigo: c.codigo, nombre: c.nombre }))
    ]
  } catch (err) {
    console.error('Error al cargar cuentas contables:', err)
    ElMessage.error('Error al cargar cuentas contables')
  }
}

async function cargarConsecutivoPorTipo(tipo) {
  if (!tipo) return
  cargandoConsecutivo.value = true
  try {
    const empresaId = localStorage.getItem('empresa_id')
    const { data }  = await api.get(`/asientos/ultimo-consecutivo/${tipo}`, {
      headers: { empresa_id: empresaId }
    })
    form.consecutivo = data?.consecutivo ? data.consecutivo + 1 : 1
  } catch (err) {
    if (err.response?.status === 404) {
      form.consecutivo = 1
    } else {
      console.error('Error al obtener consecutivo:', err)
      ElMessage.error('Error al obtener consecutivo por tipo')
      form.consecutivo = ''
    }
  } finally {
    cargandoConsecutivo.value = false
  }
}

async function cargarDatosAsiento(asientoData) {
  try {
    if (Array.isArray(asientoData) && asientoData.length) {
      const a0 = asientoData[0]
      form.tipo        = a0.tipo
      form.fecha       = a0.fecha
      form.factura     = a0.factura
      form.consecutivo = a0.consecutivo
      modoManual.value = true
      await cargarCuentasContables()
      form.detalles = asientoData.map(i => ({
        id: i.id,
        cuenta: i.cuenta,
        nombreCuenta: obtenerNombreCuenta(i.cuenta),
        tercero_id: i.tercero_id,
        tercero_nombre: i.tercero
          ? (i.tercero.razon_social || `${i.tercero.nombres} ${i.tercero.apellidos}`)
          : '',
        concepto: i.concepto,
        debito:  parseFloat(i.debito),
        credito: parseFloat(i.credito),
        saldo:   parseFloat(i.debito) - parseFloat(i.credito)
      }))
    }
  } catch (err) {
    console.error('Error al cargar datos del asiento:', err)
    ElMessage.error('Error al cargar el asiento')
  }
}

function agregarFila() {
  form.detalles.push({ cuenta: '', nombreCuenta: '', tercero_id: null, tercero_nombre: '', concepto: '', debito: 0, credito: 0, saldo: 0 })
  
  // Enfocar el primer campo de la nueva fila
  nextTick(() => {
    const inputs = document.querySelectorAll('.el-table .el-input__inner')
    if (inputs.length > 0) {
      inputs[inputs.length - 8].focus() // Enfocar el primer campo de la nueva fila
    }
  })
}

function agregarFilaConTab() {
  agregarFila()
}

function eliminarFila(i) {
  if (form.detalles.length > 1) form.detalles.splice(i, 1)
}

async function buscarTerceros(query, cb) {
  if (!query || query.length < 2) return cb([])
  try {
    const { data } = await api.get('/dato_clientes/getdata')
    const clientes = Array.isArray(data) ? data : data.data || []
    const results = clientes.filter(c => {
      const campos = [c.nombres, c.apellidos, c.razon_social, c.identificacion, c.email, c.telefono]
        .map(s => s?.toLowerCase() || '')
      return campos.some(s => s.includes(query.toLowerCase()))
    }).map(c => ({
      value: c.razon_social || [c.nombres, c.apellidos].filter(Boolean).join(' '),
      id: c.id
    }))
    cb(results)
  } catch { cb([]) }
}

function handleSelectTercero(row, item) {
  row.tercero_id    = item.id
  row.tercero_nombre = item.value
}

function fetchSuggestions(query, cb) {
  if (!query) return cb([])
  const res = cuentasContables.value
    .filter(c =>
      c.codigo.toLowerCase().includes(query.toLowerCase()) ||
      c.nombre.toLowerCase().includes(query.toLowerCase())
    )
    .map(c => ({
      value: `${c.codigo} - ${c.nombre}`,
      label: `${c.codigo} - ${c.nombre}`,
      codigo: c.codigo,
      nombreCuenta: c.nombre
    }))
  cb(res)
}
function handleSelectCuenta(row) {
  return item => {
    row.cuenta       = item.codigo
    row.nombreCuenta = item.nombreCuenta
  }
}

async function guardarAsiento() {
  if (!form.tipo || !form.consecutivo) return ElMessage.error('Tipo y consecutivo son requeridos')
  if (form.detalles.some(d => !d.tercero_id)) return ElMessage.error('Seleccione un tercero para todas las filas')

  guardando.value = true
  try {
    const empresaId = localStorage.getItem('empresa_id')
    const payloads = form.detalles.map(d => ({
      id: d.id,
      consecutivo: form.consecutivo,
      tipo: form.tipo,
      fecha: dayjs(form.fecha).format('YYYY-MM-DD'),
      factura: form.factura,
      cuenta: d.cuenta,
      tercero_id: d.tercero_id,
      concepto: d.concepto,
      debito: d.debito,
      credito: d.credito,
      saldo: d.debito - d.credito
    }))
    if (props.modoEdicion) {
      await api.put(`/asientos/consecutivo/${form.consecutivo}`, { asientos: payloads }, { headers: { empresa_id: empresaId } })
    } else {
      await api.post('/asientos/save', { asientos: payloads }, { headers: { empresa_id: empresaId } })
    }
    ElMessage.success(props.modoEdicion ? 'Asiento actualizado' : 'Asiento creado')
    emit('asientoGuardado')
    cancelar()
  } catch (err) {
    console.error(err)
    ElMessage.error(err.response?.data?.error || 'Error al guardar asiento')
  } finally {
    guardando.value = false
  }
}

function cancelar() {
  Object.assign(form, {
    tipo: '', fecha: '', factura: '', consecutivo: '',
    detalles: [{ cuenta: '', nombreCuenta: '', tercero_id: null, tercero_nombre: '', concepto: '', debito: 0, credito: 0, saldo: 0 }]
  })
  modoManual.value = false
  emit('cancelar')
}

function toggleModoManual() {
  modoManual.value = !modoManual.value
  if (!modoManual.value && !props.modoEdicion && form.tipo) {
    cargarConsecutivoPorTipo(form.tipo)
  }
}

/* ======= COMPUTED ======= */
const totalDebito  = computed(() => form.detalles.reduce((a, i) => a + Number(i.debito), 0))
const totalCredito = computed(() => form.detalles.reduce((a, i) => a + Number(i.credito), 0))
const diferencia   = computed(() => totalDebito.value - totalCredito.value)

/* ======= LIFECYCLE ======= */
onMounted(() => {
  cargarCuentasContables()
})

watch(() => form.tipo, (nuevo, viejo) => {
  if (!props.modoEdicion && nuevo && nuevo !== viejo && !modoManual.value) {
    cargarConsecutivoPorTipo(nuevo)
  }
})

watch(() => props.asiento, (nuevo) => {
  if (Array.isArray(nuevo) && nuevo.length && props.modoEdicion) {
    cargarDatosAsiento(nuevo)
  }
}, { immediate: true })
</script>

<style scoped>
/* Puedes agregar estilos personalizados si lo requieres */
</style>
