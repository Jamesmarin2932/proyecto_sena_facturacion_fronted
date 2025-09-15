<template>
  <LayoutMain>
    <template #slotlayout>
      <div class="libro-diario-container">
        <h2 class="titulo">Libro Diario</h2>

        <!-- Botones arriba -->
        <div class="botones" style="margin-bottom: 20px;">
          <el-button type="primary" icon="el-icon-plus" @click="nuevoAsiento" style="margin-right: 10px;">
            Crear Asiento
          </el-button>
          <el-button type="success" icon="el-icon-download" @click="exportarExcel" style="margin-right: 10px;">
            Exportar a Excel
          </el-button>
          <el-button type="danger" icon="el-icon-document" @click="exportarPDF">
            Exportar todo a PDF
          </el-button>
        </div>

        <!-- Filtros -->
        <div class="filtros" style="margin-bottom: 20px;">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-input v-model="filtroTercero" placeholder="Buscar por tercero" clearable />
            </el-col>
            <el-col :span="4">
              <el-date-picker v-model="filtroFecha" type="daterange" placeholder="Seleccionar fecha" style="width: 100%;" />
            </el-col>
            <el-col :span="4">
              <el-input v-model="filtroCuenta" placeholder="Buscar por cuenta" clearable />
            </el-col>
            <el-col :span="4">
              <el-select v-model="filtroTipo" placeholder="Tipo de asiento" clearable>
                <el-option label="CC" value="CC" />
                <el-option label="RC" value="RC" />
                <el-option label="NC" value="NC" />
                <el-option label="CE" value="CE" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input v-model="filtroConsecutivo" placeholder="Consecutivo" clearable />
            </el-col>
            <el-col :span="4">
              <el-button type="warning" icon="el-icon-refresh" @click="limpiarFiltros" style="width: 100%;">
                Limpiar Filtros
              </el-button>
            </el-col>
          </el-row>
        </div>

        <!-- Tabla de datos -->
        <el-table :data="filtrada" style="width: 100%" border show-summary :summary-method="getSummaries">
          <el-table-column prop="consecutivo" label="Consecutivo" width="100" />
          <el-table-column prop="tipo" label="Tipo" width="80" />
          <el-table-column prop="factura" label="Factura" width="100" />
          <el-table-column prop="cuenta" label="Cuenta" width="120" />
          <el-table-column label="Tercero" min-width="200">
            <template #default="{ row }">
              <div v-if="row.tercero">
                <strong>{{ row.tercero.razon_social || (row.tercero.nombres + ' ' + row.tercero.apellidos) }}</strong>
                <div v-if="row.tercero.identificacion" class="tercero-details">
                  {{ row.tercero.identificacion }}
                </div>
              </div>
              <span v-else class="text-muted">-- Sin asignar --</span>
            </template>
          </el-table-column>
          <el-table-column label="Fecha" width="120">
            <template #default="{ row }">{{ formatDate(row.fecha) }}</template>
          </el-table-column>
          <el-table-column prop="concepto" label="Concepto" />
          <el-table-column prop="debito" label="Débito" width="100" />
          <el-table-column prop="credito" label="Crédito" width="100" />
          <el-table-column prop="saldo_actual" label="Saldo" width="100" />

          <!-- Acciones -->
          <el-table-column fixed="right" label="Acciones" width="180">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-edit"
                @click="editarAsiento(row.consecutivo, row.tipo)"
              >
                Editar
              </el-button>
              <el-button
                type="danger"
                size="small"
                icon="el-icon-document"
                @click="exportarAsientoPDF(row.tipo, row.consecutivo)"
              >
                Ver PDF
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- Modal Crear/Editar -->
        <el-dialog :title="modoEdicion ? 'Editar Asiento' : 'Crear Asiento'" v-model="dialogVisible" width="70%" @close="resetFormulario">
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
import api from '@/api'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/* ========= ESTADOS ========= */
const filtroTercero = ref('')
const filtroFecha = ref([null, null])
const filtroCuenta = ref('')
const filtroTipo = ref('')
const filtroConsecutivo = ref('')
const datos = ref([])
const dialogVisible = ref(false)
const modoEdicion = ref(false)
const asientoSeleccionado = ref(null)

/* ========= CARGA ========= */
const cargarAsientos = async () => {
  try {
    const response = await api.get('/asientos')
    // Ordenar por fecha más reciente primero
    datos.value = response.data.sort((a, b) => {
      return new Date(b.fecha) - new Date(a.fecha);
    });
  } catch (error) {
    console.error('Error al cargar los asientos:', error)
    ElMessage.error('Error al cargar asientos')
  }
}
onMounted(cargarAsientos)

/* ========= FILTROS ========= */
const limpiarFiltros = () => {
  filtroTercero.value = ''
  filtroCuenta.value = ''
  filtroFecha.value = [null, null]
  filtroTipo.value = ''
  filtroConsecutivo.value = ''
}

const filtrada = computed(() => {
  const resultado = datos.value.filter(a => {
    const nombreTercero = a.tercero ? (a.tercero.razon_social || `${a.tercero.nombres} ${a.tercero.apellidos}`).toLowerCase() : ''
    const cumpleTercero = !filtroTercero.value || nombreTercero.includes(filtroTercero.value.toLowerCase())
    const cumpleCuenta = !filtroCuenta.value || a.cuenta.toLowerCase().includes(filtroCuenta.value.toLowerCase())
    const cumpleTipo = !filtroTipo.value || a.tipo === filtroTipo.value
    const cumpleConsec = !filtroConsecutivo.value || String(a.consecutivo).includes(filtroConsecutivo.value)
    const fecha = new Date(a.fecha)
    const fDesde = !filtroFecha.value[0] || fecha >= new Date(filtroFecha.value[0])
    const fHasta = !filtroFecha.value[1] || fecha <= new Date(filtroFecha.value[1])
    return cumpleTercero && cumpleCuenta && cumpleTipo && cumpleConsec && fDesde && fHasta
  })
  
  // Ordenar por fecha más reciente primero (por si los filtros alteran el orden)
  const resultadoOrdenado = resultado.sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });
  
  // saldo acumulado
  let saldos = {}
  return resultadoOrdenado.map(asiento => {
    const c = asiento.cuenta
    const d = parseFloat(asiento.debito || 0)
    const cr = parseFloat(asiento.credito || 0)
    if (!saldos[c]) saldos[c] = 0
    saldos[c] += d - cr
    return { ...asiento, saldo_actual: saldos[c].toFixed(2) }
  })
})

/* ========= ACCIONES ========= */
const nuevoAsiento = () => {
  modoEdicion.value = false
  asientoSeleccionado.value = null
  dialogVisible.value = true
}

const editarAsiento = async (consec, tipo) => {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa primero')
    const { data } = await api.get(`/asientos/${tipo}/${consec}`, {
      headers: { empresa_id: empresaId }
    })
    asientoSeleccionado.value = data
    modoEdicion.value = true
    dialogVisible.value = true
  } catch (e) {
    console.error(e)
    ElMessage.error('Error al cargar asiento')
  }
}

const asientoGuardado = () => {
  dialogVisible.value = false
  cargarAsientos()
  ElMessage.success(modoEdicion.value ? 'Asiento actualizado' : 'Asiento creado')
}
const cancelarEdicion = () => { dialogVisible.value = false }
const resetFormulario = () => { modoEdicion.value = false; asientoSeleccionado.value = null }

const getSummaries = ({ columns, data }) => {
  const sums = []
  columns.forEach((col, i) => {
    if (i === 0) return sums[i] = 'Totales'
    if (col.property === 'debito')
      sums[i] = data.reduce((s, d) => s + parseFloat(d.debito || 0), 0).toFixed(2)
    else if (col.property === 'credito')
      sums[i] = data.reduce((s, d) => s + parseFloat(d.credito || 0), 0).toFixed(2)
    else if (col.property === 'saldo_actual')
      sums[i] = data.length ? parseFloat(data[data.length - 1].saldo_actual || 0).toFixed(2) : '0.00'
    else sums[i] = ''
  })
  return sums
}
const formatDate = f => f ? new Date(f).toLocaleDateString() : ''

/* ========= EXPORTAR TODO ========= */
const exportarExcel = () => {
  const ws = XLSX.utils.json_to_sheet(filtrada.value)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'LibroDiario')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'libro_diario.xlsx')
}
const exportarPDF = () => {
  const doc = new jsPDF()
  doc.text('Libro Diario', 14, 15)
  autoTable(doc, {
    head: [['Consec', 'Tipo', 'Cuenta', 'Tercero', 'Fecha', 'Concepto', 'Débito', 'Crédito']],
    body: filtrada.value.map(a => [
      a.consecutivo,
      a.tipo,
      a.cuenta,
      a.tercero ? (a.tercero.razon_social || `${a.tercero.nombres} ${a.tercero.apellidos}`) : '',
      formatDate(a.fecha),
      a.concepto,
      a.debito,
      a.credito
    ])
  })
  doc.save('libro_diario.pdf')
}

/* ========= NUEVO: EXPORTAR SOLO UN ASIENTO ========= */
const exportarAsientoPDF = async (tipo, consecutivo) => {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa primero')
    const { data } = await api.get(`/asientos/${tipo}/${consecutivo}`, {
      headers: { empresa_id: empresaId }
    })
    if (!Array.isArray(data) || !data.length) return ElMessage.error('Asiento no encontrado')

    const doc = new jsPDF()
    const a0 = data[0]
    doc.text(`Asiento ${a0.tipo}-${a0.consecutivo}`, 14, 15)
    doc.text(`Fecha: ${formatDate(a0.fecha)}`, 14, 25)
    doc.text(`Factura: ${a0.factura || '---'}`, 14, 35)
    autoTable(doc, {
      startY: 45,
      head: [['Cuenta', 'Tercero', 'Concepto', 'Débito', 'Crédito']],
      body: data.map(i => [
        i.cuenta,
        i.tercero ? (i.tercero.razon_social || `${i.tercero.nombres} ${i.tercero.apellidos}`) : '',
        i.concepto,
        i.debito,
        i.credito
      ])
    })
    doc.save(`Asiento-${a0.tipo}-${a0.consecutivo}.pdf`)
  } catch (e) {
    console.error(e)
    ElMessage.error('No se pudo generar el PDF del asiento')
  }
}
</script>

<style scoped>
.libro-diario-container {
  padding: 20px;
}
.titulo {
  margin-bottom: 15px;
}
</style>