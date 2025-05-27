<template>
  <LayoutMain>
    <template #slotlayout>
      <div class="libro-diario-container">
        <h2 class="titulo">Libro Diario</h2>

        <!-- Filtros -->
        <div class="filtros" style="margin-bottom: 20px;">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-input v-model="filtroTercero" placeholder="Buscar por tercero" clearable />
            </el-col>
            <el-col :span="6">
              <el-date-picker
                v-model="filtroFecha"
                type="daterange"
                placeholder="Seleccionar fecha"
                align="right"
                unlink-panels
                style="width: 100%;"
              />
            </el-col>
            <el-col :span="6">
              <el-input v-model="filtroCuenta" placeholder="Buscar por cuenta" clearable />
            </el-col>
            <el-col :span="6">
              <el-button
                type="warning"
                icon="el-icon-refresh"
                @click="limpiarFiltros"
                style="width: 100%;"
              >
                Limpiar Filtros
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- Tabla con totales -->
        <el-table
          :data="filtrada"
          style="width: 100%"
          border
          show-summary
          :summary-method="getSummaries"
        >
          <el-table-column prop="consecutivo" label="Consecutivo" width="100" />
          <el-table-column prop="tipo" label="Tipo" width="80" />
          <el-table-column prop="factura" label="Factura" width="100" />
          <el-table-column prop="cuenta" label="Cuenta" width="120" />
          <el-table-column prop="tercero" label="Tercero" width="150" />
          <el-table-column prop="fecha" label="Fecha" width="120" />
          <el-table-column prop="concepto" label="Concepto" />
          <el-table-column prop="debito" label="Débito" width="100" />
          <el-table-column prop="credito" label="Crédito" width="100" />
          <el-table-column prop="saldo_actual" label="Saldo" width="100" />
        </el-table>

        <!-- Botones de Exportación y Crear Asiento -->
        <div class="botones" style="margin-top: 20px;">
          <el-button
            type="success"
            icon="el-icon-download"
            @click="exportarExcel"
            style="margin-right: 10px;"
          >
            Exportar a Excel
          </el-button>

          <el-button
            type="danger"
            icon="el-icon-document"
            @click="exportarPDF"
            style="margin-right: 10px;"
          >
            Exportar a PDF
          </el-button>

          <div style="float: right;">
            <el-button
              type="primary"
              icon="el-icon-plus"
              @click="dialogVisible = true"
            >
              Crear Asiento
            </el-button>
          </div>
        </div>
      </div>

      <!-- Modal de Crear Asiento -->
      <el-dialog
        title="Crear Asiento"
        v-model="dialogVisible"
        width="50%"
        @close="resetFormulario"
      >
        <CrearAsiento @asientoGuardado="asientoGuardado" />
      </el-dialog>
    </template>
  </LayoutMain>
</template>

<script setup>
import LayoutMain from '@/components/LayoutMain.vue'
import { ref, computed, onMounted } from 'vue'
import CrearAsiento from '@/views/contabilidad/componentes/CrearAsiento.vue'
import axios from 'axios'

// Filtros
const filtroTercero = ref('')
const filtroFecha = ref([null, null])
const filtroCuenta = ref('')
const datos = ref([])
const dialogVisible = ref(false)

// Limpiar filtros
const limpiarFiltros = () => {
  filtroTercero.value = ''
  filtroCuenta.value = ''
  filtroFecha.value = [null, null]
}

// Cargar datos
const cargarAsientos = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/asientos')
    datos.value = response.data
  } catch (error) {
    console.error('Error al cargar los asientos:', error)
  }
}
onMounted(() => {
  cargarAsientos()
})

// Filtrado
const filtrada = computed(() => {
  return datos.value.filter((asiento) => {
    return (
      (filtroTercero.value === '' ||
        asiento.tercero.toLowerCase().includes(filtroTercero.value.toLowerCase())) &&
      (filtroCuenta.value === '' ||
        asiento.cuenta.toLowerCase().includes(filtroCuenta.value.toLowerCase())) &&
      (filtroFecha.value[0] === null ||
        new Date(asiento.fecha) >= new Date(filtroFecha.value[0])) &&
      (filtroFecha.value[1] === null ||
        new Date(asiento.fecha) <= new Date(filtroFecha.value[1]))
    )
  })
})

// Totales
const getSummaries = ({ columns, data }) => {
  const sums = []

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'Totales'
      return
    }

    if (column.property === 'debito') {
      const total = data.reduce((sum, item) => sum + parseFloat(item.debito || 0), 0)
      sums[index] = total.toFixed(2)
    } else if (column.property === 'credito') {
      const total = data.reduce((sum, item) => sum + parseFloat(item.credito || 0), 0)
      sums[index] = total.toFixed(2)
    } else {
      sums[index] = ''
    }
  })

  return sums
}

const asientoGuardado = (nuevosAsientos) => {
  // Primero, agregar los nuevos asientos
  datos.value.push(...nuevosAsientos);

  // Actualizar los saldos de las cuentas
  datos.value.forEach(asiento => {
    if (asiento.debito) {
      asiento.saldo_actual = (asiento.saldo_actual || 0) + asiento.debito;
    }
    if (asiento.credito) {
      asiento.saldo_actual = (asiento.saldo_actual || 0) - asiento.credito;
    }
  });

  // Cerrar el modal de crear asiento
  dialogVisible.value = false;
};


// Exportar
const exportarExcel = () => {
  console.log('Exportar a Excel')
}
const exportarPDF = () => {
  console.log('Exportar a PDF')
}
</script>
