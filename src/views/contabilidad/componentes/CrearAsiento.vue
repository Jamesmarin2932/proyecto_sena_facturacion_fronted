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
        <template #default="{ row, $index }">
          <el-autocomplete
            v-model="row.cuenta"
            :fetch-suggestions="fetchSuggestions"
            placeholder="Código o nombre de cuenta"
            clearable
            @select="item => handleSelectCuenta(row)(item)"
          />
          <el-button
            v-if="form.detalles.length > 1"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="eliminarFila($index)"
            style="margin-top: 5px;"
          />
        </template>
      </el-table-column>

      <el-table-column label="Nombre Cuenta">
        <template #default="{ row }">
          <el-input v-model="row.nombreCuenta" placeholder="Nombre de cuenta" :disabled="true" />
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
    </el-table>

    <el-button type="primary" icon="el-icon-plus" @click="agregarFila" style="margin-top: 10px;">
      Agregar fila
    </el-button>

    <el-row justify="end" style="margin-top: 15px;">
      <el-col :span="6">
        <p><strong>Total Débito:</strong> {{ totalDebito }}</p>
        <p><strong>Total Crédito:</strong> {{ totalCredito }}</p>
        <p :style="{ color: diferencia === 0 ? 'green' : 'red' }">
          <strong>Diferencia:</strong> {{ diferencia }}
        </p>
      </el-col>
    </el-row>

    <el-row justify="end" style="margin-top: 20px;">
      <el-button 
        type="primary" 
        :disabled="diferencia !== 0 || !form.tipo || !form.consecutivo" 
        @click="guardarAsiento"
        :loading="guardando"
      >
        {{ modoEdicion ? 'Actualizar' : 'Guardar' }}
      </el-button>
      <el-button @click="cancelar">Cancelar</el-button>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import api from '@/api'

const props = defineProps({
  asiento: { type: Object, default: null },
  modoEdicion: { type: Boolean, default: false }
})

const emit = defineEmits(['asientoGuardado', 'cancelar'])

const form = reactive({
  tipo: '',
  fecha: '',
  factura: '',
  consecutivo: '',
  detalles: [{ cuenta: '', nombreCuenta: '', tercero_id: null, tercero_nombre: '', concepto: '', debito: 0, credito: 0, saldo: 0 }]
})

const modoManual = ref(false)
const cuentasContables = ref([])
const guardando = ref(false)
const cargandoConsecutivo = ref(false)

const cargarConsecutivoPorTipo = async (tipo) => {
  if (!tipo) return;

  cargandoConsecutivo.value = true;

  try {
    const empresaId = localStorage.getItem('empresa_id');
    if (!empresaId) throw new Error('Empresa no definida');

    const { data } = await api.get(`/asientos/ultimo-consecutivo/${tipo}`, {
      headers: { empresa_id: empresaId }
    });

    // ✅ CORRECCIÓN: Si el consecutivo es 0, asignamos 1 para el NUEVO asiento
    if (data?.consecutivo === 0 || data?.consecutivo === undefined) {
      form.consecutivo = 1;
      console.log('Primer asiento de este tipo, consecutivo asignado: 1');
    } else {
      // Si ya hay asientos, usamos el último + 1 para el NUEVO
      form.consecutivo = data.consecutivo + 1;
      console.log('Siguiente consecutivo:', form.consecutivo);
    }

  } catch (error) {
    // Si es 404, significa que no hay asientos todavía, asignamos 1
    if (error.response?.status === 404) {
      form.consecutivo = 1;
      console.warn('No existen asientos previos, se asigna consecutivo 1');
    } else {
      console.error('Error al obtener consecutivo por tipo:', error);
      ElMessage.error('Error al obtener consecutivo por tipo');
      form.consecutivo = '';
    }
  } finally {
    cargandoConsecutivo.value = false;
  }
};


// Watch para tipo de asiento
watch(() => form.tipo, (nuevoTipo, viejoTipo) => {
  if (!props.modoEdicion && nuevoTipo && nuevoTipo !== viejoTipo && !modoManual.value) {
    cargarConsecutivoPorTipo(nuevoTipo)
  }
})

// Cargar asiento para edición
watch(() => props.asiento, (nuevo) => {
  if (nuevo && props.modoEdicion) {
    cargarDatosAsiento(nuevo)
  }
}, { immediate: true })

const cargarDatosAsiento = async (asientoData) => {
  try {
    if (asientoData && asientoData.length > 0) {
      const primerDetalle = asientoData[0]
      form.tipo = primerDetalle.tipo
      form.fecha = primerDetalle.fecha
      form.factura = primerDetalle.factura
      form.consecutivo = primerDetalle.consecutivo
      modoManual.value = true
      await cargarCuentasContables()
      form.detalles = asientoData.map(item => ({
        id: item.id,
        cuenta: item.cuenta,
        nombreCuenta: obtenerNombreCuenta(item.cuenta),
        tercero_id: item.tercero_id,
        tercero_nombre: item.tercero ? (item.tercero.razon_social || `${item.tercero.nombres} ${item.tercero.apellidos}`) : '',
        concepto: item.concepto,
        debito: parseFloat(item.debito),
        credito: parseFloat(item.credito),
        saldo: parseFloat(item.debito) - parseFloat(item.credito)
      }))
    }
  } catch (error) {
    console.error('Error al cargar datos del asiento:', error)
    ElMessage.error('Error al cargar el asiento')
  }
}

const obtenerNombreCuenta = (codigo) => {
  const cuenta = cuentasContables.value.find(c => c.codigo === codigo)
  return cuenta ? cuenta.nombre : 'Cuenta no encontrada'
}

const cargarCuentasContables = async () => {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    const globales = await api.get('/cuentas/contables')
    const empresa = await api.get(`/empresas/${empresaId}/cuentas-todas`)
    cuentasContables.value = [
      ...globales.data.map(c => ({ codigo: c.codigo, nombre: c.nombre })),
      ...empresa.data.map(c => ({ codigo: c.codigo, nombre: c.nombre }))
    ]
  } catch (error) {
    console.error('Error al cargar cuentas contables:', error)
    ElMessage.error('Error al cargar cuentas contables')
  }
}

const totalDebito = computed(() => form.detalles.reduce((acc, i) => acc + Number(i.debito), 0))
const totalCredito = computed(() => form.detalles.reduce((acc, i) => acc + Number(i.credito), 0))
const diferencia = computed(() => totalDebito.value - totalCredito.value)

const agregarFila = () => form.detalles.push({ cuenta: '', nombreCuenta: '', tercero_id: null, tercero_nombre: '', concepto: '', debito: 0, credito: 0, saldo: 0 })
const eliminarFila = (i) => { if (form.detalles.length > 1) form.detalles.splice(i, 1) }

const buscarTerceros = async (query, cb) => {
  if (!query || query.length < 2) { cb([]); return }
  try {
    const response = await api.get('/dato_clientes/getdata')
    const clientes = Array.isArray(response.data) ? response.data : response.data.data || []
    const resultados = clientes.filter(c => {
      const campos = [c.nombres, c.apellidos, c.razon_social, c.identificacion, c.email, c.telefono].map(s => s?.toLowerCase() || '')
      return campos.some(s => s.includes(query.toLowerCase()))
    }).map(c => ({
      value: c.razon_social || [c.nombres, c.apellidos].filter(Boolean).join(' '),
      id: c.id,
      datos: c
    }))
    cb(resultados)
  } catch { cb([]) }
}

const handleSelectTercero = (row, item) => { row.tercero_id = item.id; row.tercero_nombre = item.value }

const fetchSuggestions = (query, cb) => {
  if (!query) return cb([])
  const results = cuentasContables.value.filter(c => c.codigo.toLowerCase().includes(query.toLowerCase()) || c.nombre.toLowerCase().includes(query.toLowerCase()))
    .map(c => ({ value: `${c.codigo} - ${c.nombre}`, label: `${c.codigo} - ${c.nombre}`, codigo: c.codigo, nombreCuenta: c.nombre }))
  cb(results)
}

const handleSelectCuenta = (row) => (item) => { row.cuenta = item.codigo; row.nombreCuenta = item.nombreCuenta }

const guardarAsiento = async () => {
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
  } catch (error) {
    console.error(error)
    ElMessage.error(error.response?.data?.error || 'Error al guardar asiento')
  } finally {
    guardando.value = false
  }
}

const cancelar = () => {
  form.tipo = ''; form.fecha = ''; form.factura = ''; form.consecutivo = ''; form.detalles = [{ cuenta: '', nombreCuenta: '', tercero_id: null, tercero_nombre: '', concepto: '', debito: 0, credito: 0, saldo: 0 }]
  modoManual.value = false
  emit('cancelar')
}

const toggleModoManual = () => {
  modoManual.value = !modoManual.value
  if (!modoManual.value && !props.modoEdicion && form.tipo) cargarConsecutivoPorTipo(form.tipo)
}

onMounted(() => cargarCuentasContables())
</script>

<style scoped>
/* Estilos personalizados si los necesitas */
</style>
