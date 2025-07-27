<template>
  <div>
    <!-- Cabecera -->
    <el-row :gutter="10">
      <el-col :span="5">
        <el-select v-model="form.tipo" placeholder="Tipo de asiento" style="width: 100%;">
          <el-option label="CC" value="CC" />
          <el-option label="RC" value="RC" />
          <el-option label="NC" value="NC" />
          <el-option label="CE" value="CE" />
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
          :disabled="!modoManual"
        />
      </el-col>
      <el-col :span="4">
        <el-button @click="toggleModoManual" type="warning">
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
      <el-button type="primary" :disabled="diferencia !== 0" @click="guardarAsiento">Guardar</el-button>
      <el-button @click="cancelar">Cancelar</el-button>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const emit = defineEmits(['asientoGuardado'])

const form = reactive({
  tipo: '',
  fecha: '',
  factura: '',
  consecutivo: '',
  detalles: [{
    cuenta: '',
    nombreCuenta: '',
    tercero_id: null,
    tercero_nombre: '',
    concepto: '',
    debito: 0,
    credito: 0,
    saldo: 0,
  }],
})

const modoManual = ref(false)
const cuentasContables = ref([])

const cargarCuentasContables = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/cuentas-contables')
    cuentasContables.value = response.data
  } catch (error) {
    console.error('Error al cargar cuentas contables:', error)
  }
}

const cargarConsecutivo = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/asientos/ultimo-consecutivo')
    form.consecutivo = response.data.consecutivo + 1
  } catch (error) {
    console.error('Error al obtener consecutivo:', error)
  }
}

const toggleModoManual = () => {
  modoManual.value = !modoManual.value
}

watch(modoManual, (nuevoValor) => {
  if (!nuevoValor) {
    cargarConsecutivo()
  }
})

const totalDebito = computed(() =>
  form.detalles.reduce((acc, item) => acc + Number(item.debito), 0)
)

const totalCredito = computed(() =>
  form.detalles.reduce((acc, item) => acc + Number(item.credito), 0)
)

const diferencia = computed(() => totalDebito.value - totalCredito.value)

const agregarFila = () => {
  form.detalles.push({
    cuenta: '',
    nombreCuenta: '',
    tercero_id: null,
    tercero_nombre: '',
    concepto: '',
    debito: 0,
    credito: 0,
    saldo: 0,
  })
}

const buscarTerceros = async (queryString, cb) => {
  try {
    const response = await api.get('/dato_clientes/getdata');
    const clientes = Array.isArray(res.data) ? res.data : res.data.data || []

    const resultados = clientes
      .filter(c => {
        const nombreCompleto = `${c.nombres} ${c.apellidos}`.toLowerCase()
        return nombreCompleto.includes(queryString.toLowerCase())
      })
      .map(c => ({
        value: `${c.nombres} ${c.apellidos}`,
        id: c.id
      }))

    cb(resultados)
  } catch (error) {
    console.error('Error al buscar terceros:', error)
    cb([])
  }
}

const handleSelectTercero = (row, item) => {
  row.tercero_id = item.id
  row.tercero_nombre = item.value
}

const fetchSuggestions = (queryString, cb) => {
  if (!Array.isArray(cuentasContables.value)) {
    cb([])
    return
  }

  const results = cuentasContables.value
    .filter(cuenta => {
      const query = queryString.toLowerCase()
      return cuenta.codigo.toLowerCase().includes(query) || cuenta.nombre.toLowerCase().includes(query)
    })
    .map(c => ({
      value: c.codigo,
      label: `${c.codigo} - ${c.nombre}`,
      nombreCuenta: c.nombre
    }))

  cb(results)
}

const handleSelectCuenta = (row) => (item) => {
  row.cuenta = item.value
  row.nombreCuenta = item.nombreCuenta
}

const guardarAsiento = async () => {
  const sinTercero = form.detalles.some(item => !item.tercero_id)
  if (sinTercero) {
    ElMessage.error('Por favor, selecciona un tercero para todas las filas.')
    return
  }

  try {
    const payloads = form.detalles.map(item => ({
      consecutivo: form.consecutivo || null,
      tipo: form.tipo,
      fecha: dayjs(form.fecha).format('YYYY-MM-DD'),
      factura: form.factura,
      cuenta: item.cuenta,
      tercero_id: item.tercero_id, // ✅ Aquí guardamos el ID
      concepto: item.concepto,
      debito: item.debito,
      credito: item.credito,
      saldo: item.debito - item.credito,
    }))

    await axios.post('http://127.0.0.1:8000/api/asientos', { asientos: payloads })
    ElMessage.success('Asiento guardado correctamente')
    cancelar()
  } catch (error) {
    console.error('Error al guardar asiento:', error)
    ElMessage.error('Error al guardar asiento')
  }
}


const cancelar = () => {
  form.tipo = ''
  form.fecha = ''
  form.factura = ''
  form.consecutivo = ''
  form.detalles = [{
    cuenta: '',
    nombreCuenta: '',
    tercero_id: null,
    tercero_nombre: '',
    concepto: '',
    debito: 0,
    credito: 0,
    saldo: 0,
  }]
  if (!modoManual.value) cargarConsecutivo()
 emit('cancelar')

}

onMounted(() => {
  cargarCuentasContables()
  if (!modoManual.value) cargarConsecutivo()
})
</script>

<style scoped>
/* Estilos personalizados si los necesitas */
</style>
