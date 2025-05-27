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
        <el-button @click="modoManual = !modoManual" type="warning">
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
          <el-input v-model="row.tercero" placeholder="Tercero" />
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
import { reactive, ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const emit = defineEmits(['asientoGuardado'])

const form = reactive({
  tipo: '',
  fecha: '',
  factura: '',
  consecutivo: '',
  detalles: [
    {
      cuenta: '',
      nombreCuenta: '',
      tercero: '',
      concepto: '',
      debito: 0,
      credito: 0,
      saldo: 0,
    },
  ],
})

const modoManual = ref(false)
const cuentasContables = ref([])

const cargarCuentasContables = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/cuentas-contables')
    // Aquí NO los transformes, guárdalos tal cual vienen
    cuentasContables.value = response.data
    console.log('Cuentas cargadas (crudas):', cuentasContables.value)
  } catch (error) {
    console.error('Error al cargar cuentas contables:', error)
  }
}



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
    tercero: '',
    concepto: '',
    debito: 0,
    credito: 0,
    saldo: 0,
  })
}

const cargarConsecutivo = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/asientos/ultimo-consecutivo')
    form.consecutivo = response.data.ultimo + 1
  } catch (error) {
    console.error('Error al obtener consecutivo:', error)
  }
}

const guardarAsiento = async () => {
  try {
    const payloads = form.detalles.map(item => ({
      consecutivo: form.consecutivo || null,
      tipo: form.tipo,
      fecha: dayjs(form.fecha).format('YYYY-MM-DD'),
      factura: form.factura,
      cuenta: item.cuenta,
      tercero: item.tercero,
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
  form.detalles = [
    {
      cuenta: '',
      nombreCuenta: '',
      tercero: '',
      concepto: '',
      debito: 0,
      credito: 0,
      saldo: 0,
    },
  ]
  if (!modoManual.value) cargarConsecutivo()
}

const fetchSuggestions = (queryString, cb) => {
  if (!Array.isArray(cuentasContables.value)) {
    console.warn('cuentasContables no es un arreglo')
    cb([])
    return
  }

  const results = cuentasContables.value
    .filter(cuenta => {
      const textoCodigo = cuenta.codigo.toLowerCase();
      const textoNombre = cuenta.nombre.toLowerCase();
      const query = queryString.toLowerCase();

      // Compara tanto el código como el nombre
      return textoCodigo.includes(query) || textoNombre.includes(query);
    })
    .map(c => ({
      value: c.codigo,
      label: `${c.codigo} - ${c.nombre}`,
      nombreCuenta: c.nombre
    }));

  console.log('Resultados sugeridos:', results); // 👈
  cb(results);
}




const handleSelectCuenta = (row) => (item) => {
  console.log('Cuenta seleccionada:', item) // 👈
  row.cuenta = item.value
  row.nombreCuenta = item.nombreCuenta
}


onMounted(() => {
  if (!modoManual.value) cargarConsecutivo()
  cargarCuentasContables()
})
</script>

<style scoped>
/* Puedes agregar estilos aquí si es necesario */
</style>

