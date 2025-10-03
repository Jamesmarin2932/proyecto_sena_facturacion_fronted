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
    datos.value = response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
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
    const nombreTercero = a.tercero
      ? (a.tercero.razon_social || `${a.tercero.nombres} ${a.tercero.apellidos}`).toLowerCase()
      : ''
    const cumpleTercero = !filtroTercero.value || nombreTercero.includes(filtroTercero.value.toLowerCase())
    const cumpleCuenta = !filtroCuenta.value || a.cuenta.toLowerCase().includes(filtroCuenta.value.toLowerCase())
    const cumpleTipo   = !filtroTipo.value || a.tipo === filtroTipo.value
    const cumpleConsec = !filtroConsecutivo.value || String(a.consecutivo).includes(filtroConsecutivo.value)

    // ✅ Ajuste de rango de fechas
    const fecha = new Date(a.fecha)

    let fDesdeOk = true
    let fHastaOk = true
    if (filtroFecha.value[0]) {
      const inicio = new Date(filtroFecha.value[0])
      inicio.setHours(0, 0, 0, 0)           // <-- medianoche
      fDesdeOk = fecha >= inicio
    }
    if (filtroFecha.value[1]) {
      const fin = new Date(filtroFecha.value[1])
      fin.setHours(23, 59, 59, 999)         // <-- final del día
      fHastaOk = fecha <= fin
    }

    return cumpleTercero && cumpleCuenta && cumpleTipo && cumpleConsec && fDesdeOk && fHastaOk
  })

  // saldo acumulado
  let saldos = {}
  return resultado
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .map(asiento => {
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
  const datosExport = filtrada.value.map(a => ({
    Consecutivo: a.consecutivo,
    Tipo: a.tipo,
    Cuenta: a.cuenta,
    Tercero: a.tercero ? (a.tercero.razon_social || `${a.tercero.nombres} ${a.tercero.apellidos}`) : '',
    Fecha: formatDate(a.fecha),
    Concepto: a.concepto,
    Débito: a.debito,
    Crédito: a.credito,
    Saldo: a.saldo_actual
  }))
  const ws = XLSX.utils.json_to_sheet(datosExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'LibroDiario')
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'libro_diario.xlsx')
}

/* ========= NUEVO: EXPORTAR UN ASIENTO DETALLADO ========= */
const exportarAsientoPDF = async (tipo, consecutivo) => {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa primero')

    // data es un ARRAY de movimientos
    const { data } = await api.get(`/asientos/${tipo}/${consecutivo}`, {
      headers: { empresa_id: empresaId }
    })

    if (!Array.isArray(data) || data.length === 0) {
      return ElMessage.error('No se encontraron registros para este asiento')
    }

    // Datos generales: todos los movimientos comparten estos campos
    const primer = data[0]
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    doc.setFontSize(16)
    doc.text('COMPROBANTE DE ASIENTO CONTABLE', 300, 40, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`No. Comprobante: ${primer.consecutivo}`, 40, 70)
    doc.text(`Tipo: ${primer.tipo}`, 200, 70)
    doc.text(`Fecha: ${formatDate(primer.fecha)}`, 350, 70)

    if (primer.tercero) {
      const t = primer.tercero
      const nombreTercero = t.razon_social || `${t.nombres} ${t.apellidos}`
      doc.text(`Tercero: ${nombreTercero}`, 40, 90)
      doc.text(`Identificación: ${t.numero_identificacion || ''}`, 40, 105)
    }

    doc.text(`Concepto: ${primer.concepto || ''}`, 40, 125)

    // Detalle de cuentas
    const body = data.map(d => [
      d.cuenta,
      d.tercero ? (d.tercero.razon_social || `${d.tercero.nombres} ${d.tercero.apellidos}`) : '',
      d.concepto || '',
      parseFloat(d.debito).toLocaleString(),
      parseFloat(d.credito).toLocaleString()
    ])

    autoTable(doc, {
      startY: 150,
      head: [['Cuenta', 'Tercero', 'Detalle', 'Débito', 'Crédito']],
      body,
      foot: [[
        '', '', 'TOTALES',
        data.reduce((s, i) => s + parseFloat(i.debito), 0).toLocaleString(),
        data.reduce((s, i) => s + parseFloat(i.credito), 0).toLocaleString()
      ]]
    })

    const finalY = doc.lastAutoTable.finalY + 40
    doc.text('Preparado por: _______________________', 40, finalY)
    doc.text('Revisado por: _______________________', 300, finalY)
    doc.text('Aprobado por: _______________________', 40, finalY + 30)

    doc.save(`Asiento-${primer.tipo}-${primer.consecutivo}.pdf`)
  } catch (e) {
    console.error(e)
    ElMessage.error('No se pudo generar el PDF detallado')
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