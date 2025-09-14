<template>
  <LayoutMain>
    <template #slotlayout>
      <div class="libro-diario-container">
        <h2 class="titulo">Libro Diario</h2>

        <!-- Botones arriba -->
        <div class="botones" style="margin-bottom: 20px;">
          <el-button
            type="primary"
            icon="el-icon-plus"
            @click="nuevoAsiento"
            style="margin-right: 10px;"
          >
            Crear Asiento
          </el-button>
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
          >
            Exportar a PDF
          </el-button>
        </div>

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

        <!-- Tabla de datos -->
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

          <el-table-column label="Tercero" min-width="200">
            <template #default="{ row }">
              <div v-if="row.tercero">
                <div v-if="row.tercero.razon_social" class="tercero-info">
                  <strong>{{ row.tercero.razon_social }}</strong>
                  <div v-if="row.tercero.identificacion" class="tercero-details">
                    {{ row.tercero.identificacion }}
                  </div>
                </div>
                <div v-else class="tercero-info">
                  <strong>{{ row.tercero.nombres }} {{ row.tercero.apellidos }}</strong>
                  <div v-if="row.tercero.identificacion" class="tercero-details">
                    {{ row.tercero.identificacion }}
                  </div>
                </div>
              </div>
              <span v-else class="text-muted">-- Sin asignar --</span>
            </template>
          </el-table-column>

          <el-table-column label="Fecha" width="120">
            <template #default="{ row }">
              {{ formatDate(row.fecha) }}
            </template>
          </el-table-column>

          <el-table-column prop="concepto" label="Concepto" />
          <el-table-column prop="debito" label="Débito" width="100" />
          <el-table-column prop="credito" label="Crédito" width="100" />
          <el-table-column prop="saldo_actual" label="Saldo" width="100" />

          <!-- Columna de acciones -->
          <el-table-column fixed="right" label="Acciones" width="120">
  <template #default="{ row }">
    <el-button 
      type="primary" 
      size="small" 
      @click="editarAsiento(row.consecutivo, row.tipo)"
      icon="el-icon-edit"
    >
      Editar
    </el-button>
  </template>
</el-table-column>
        </el-table>

        <!-- Modal -->
        <el-dialog
          :title="modoEdicion ? 'Editar Asiento' : 'Crear Asiento'"
          v-model="dialogVisible"
          width="70%"
          @close="resetFormulario"
        >
          <CrearAsiento 
            :asiento="asientoSeleccionado"
            :modoEdicion="modoEdicion"
            @asientoGuardado="asientoGuardado"
            @cancelar="cancelarEdicion"
          />
        </el-dialog>
      </div>
    </template>
  </LayoutMain>
</template>

<script setup>
import LayoutMain from '@/components/LayoutMain.vue'
import CrearAsiento from '@/views/contabilidad/componentes/CrearAsiento.vue'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import api from '@/api';
import { ElMessage } from 'element-plus'

// Estados
const filtroTercero = ref('')
const filtroFecha = ref([null, null])
const filtroCuenta = ref('')
const datos = ref([])
const dialogVisible = ref(false)
const modoEdicion = ref(false)
const asientoSeleccionado = ref(null)

// Cargar asientos al iniciar
const cargarAsientos = async () => {
  try {
    const response = await api.get('/asientos')
    datos.value = response.data.reverse()
  } catch (error) {
    console.error('Error al cargar los asientos:', error)
    ElMessage.error('Error al cargar asientos')
  }
}

// Nuevo asiento
const nuevoAsiento = () => {
  modoEdicion.value = false
  asientoSeleccionado.value = null
  dialogVisible.value = true
}

// Editar asiento

const editarAsiento = async (consecutivo, tipo) => {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) {
      ElMessage.error('Seleccione una empresa primero')
      return
    }

    // ← AGREGAR FILTRO POR TIPO
    const response = await api.get(`/asientos/consecutivo/${consecutivo}`, {
      params: { tipo: tipo }, // ← Enviar el tipo como parámetro
      headers: { 
        'empresa_id': empresaId,
        'Accept': 'application/json'
      }
    })
    
    asientoSeleccionado.value = response.data
    modoEdicion.value = true
    dialogVisible.value = true
    
  } catch (error) {
    console.error('Error al cargar asiento:', error)
    ElMessage.error('Error al cargar asiento para edición')
  }
}
// Cuando se guarda un asiento (nuevo o editado)
const asientoGuardado = () => {
  dialogVisible.value = false
  cargarAsientos() // Recargar la lista
  ElMessage.success(modoEdicion.value ? 'Asiento actualizado' : 'Asiento creado')
}

// Cancelar edición
const cancelarEdicion = () => {
  dialogVisible.value = false
  modoEdicion.value = false
  asientoSeleccionado.value = null
}

// Resetear formulario
const resetFormulario = () => {
  modoEdicion.value = false
  asientoSeleccionado.value = null
}

// Resto del código permanece igual...
const limpiarFiltros = () => {
  filtroTercero.value = ''
  filtroCuenta.value = ''
  filtroFecha.value = [null, null]
}

const filtrada = computed(() => {
  const resultado = datos.value.filter((asiento) => {
    const nombreTercero = asiento.tercero
      ? (asiento.tercero.nombres + ' ' + asiento.tercero.apellidos).toLowerCase()
      : ''

    const cumpleTercero =
      filtroTercero.value === '' ||
      nombreTercero.includes(filtroTercero.value.toLowerCase())

    const cumpleCuenta =
      filtroCuenta.value === '' ||
      asiento.cuenta.toLowerCase().includes(filtroCuenta.value.toLowerCase())

    const fechaAsiento = new Date(asiento.fecha)
    const cumpleFechaDesde =
      filtroFecha.value[0] === null || fechaAsiento >= new Date(filtroFecha.value[0])
    const cumpleFechaHasta =
      filtroFecha.value[1] === null || fechaAsiento <= new Date(filtroFecha.value[1])

    return cumpleTercero && cumpleCuenta && cumpleFechaDesde && cumpleFechaHasta
  })

  let saldos = {}
  return resultado.map((asiento) => {
    const cuenta = asiento.cuenta
    const debito = parseFloat(asiento.debito || 0)
    const credito = parseFloat(asiento.credito || 0)

    if (!saldos[cuenta]) saldos[cuenta] = 0
    saldos[cuenta] += debito - credito

    return {
      ...asiento,
      saldo_actual: saldos[cuenta].toFixed(2)
    }
  })
})

const getSummaries = ({ columns, data }) => {
  const sums = []
  let totalDebito = 0
  let totalCredito = 0
  let totalSaldo = 0

  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'Totales'
      return
    }

    if (column.property === 'debito') {
      totalDebito = data.reduce((sum, item) => sum + parseFloat(item.debito || 0), 0)
      sums[index] = totalDebito.toFixed(2)
    } else if (column.property === 'credito') {
      totalCredito = data.reduce((sum, item) => sum + parseFloat(item.credito || 0), 0)
      sums[index] = totalCredito.toFixed(2)
    } else if (column.property === 'saldo_actual') {
      if (data.length > 0) {
        totalSaldo = parseFloat(data[data.length - 1].saldo_actual || 0)
      }
      sums[index] = totalSaldo.toFixed(2)
    } else {
      sums[index] = ''
    }
  })

  return sums
}

const formatDate = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString()
}

const exportarExcel = () => {
  const data = filtrada.value.map((item) => ({
    Consecutivo: item.consecutivo,
    Tipo: item.tipo,
    Factura: item.factura,
    Cuenta: item.cuenta,
    Tercero: item.tercero
      ? item.tercero.razon_social
        ? item.tercero.razon_social
        : item.tercero.nombres + ' ' + item.tercero.apellidos
      : '',
    Fecha: formatDate(item.fecha),
    Concepto: item.concepto,
    Débito: item.debito,
    Crédito: item.credito,
    Saldo: item.saldo_actual
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Libro Diario')
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'libro_diario.xlsx')
}

const exportarPDF = () => {
  const doc = new jsPDF()
  doc.text('Libro Diario', 14, 10)

  const columns = [
    'Consecutivo', 'Tipo', 'Factura', 'Cuenta', 'Tercero',
    'Fecha', 'Concepto', 'Débito', 'Crédito', 'Saldo'
  ]

  const rows = filtrada.value.map((item) => [
    item.consecutivo,
    item.tipo,
    item.factura,
    item.cuenta,
    item.tercero
      ? item.tercero.razon_social
        ? item.tercero.razon_social
        : item.tercero.nombres + ' ' + item.tercero.apellidos
      : '',
    formatDate(item.fecha),
    item.concepto,
    item.debito,
    item.credito,
    item.saldo_actual
  ])

  autoTable(doc, {
    startY: 15,
    head: [columns],
    body: rows,
    styles: { fontSize: 8 }
  })

  doc.save('libro_diario.pdf')
}

onMounted(() => {
  cargarAsientos()
})
</script>