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
        <el-table :data="paginada" style="width: 100%" border show-summary :summary-method="getSummaries">
          <el-table-column prop="consecutivo" label="Consecutivo" width="100" sortable />
          <el-table-column prop="tipo" label="Tipo" width="80" sortable />
          <el-table-column prop="factura" label="Factura" width="100" sortable />
          <el-table-column prop="cuenta" label="Cuenta" width="120" sortable />
          <el-table-column label="Tercero" min-width="200" sortable :sort-by="row => row.tercero ? (row.tercero.razon_social || `${row.tercero.nombres} ${row.tercero.apellidos}`) : ''">
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
          <el-table-column label="Fecha" width="120" sortable>
            <template #default="{ row }">{{ formatDate(row.fecha) }}</template>
          </el-table-column>
          <el-table-column prop="concepto" label="Concepto" sortable />
          <el-table-column prop="debito" label="Débito" width="100" sortable />
          <el-table-column prop="credito" label="Crédito" width="100" sortable />
          <el-table-column prop="saldo_actual" label="Saldo" width="100" sortable />

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
                :loading="exportandoPDF"
              >
                Ver PDF
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 🔹 PAGINACIÓN -->
        <div style="margin-top: 20px; text-align: center;">
          <el-pagination
            background
            layout="prev, pager, next, jumper, ->, sizes, total"
            :total="filtrada.length"
            v-model:current-page="paginaActual"
            v-model:page-size="registrosPorPagina"
            :page-sizes="[5, 10, 20, 50]"
          />
        </div>

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
import { ref, computed, onMounted, watch } from 'vue'
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
const exportandoPDF = ref(false)

/* 🔹 NUEVAS VARIABLES PARA EMPRESA Y USUARIO */
const empresaInfo = ref({})

/* 🔹 NUEVAS VARIABLES DE PAGINACIÓN */
const paginaActual = ref(1)
const registrosPorPagina = ref(10)

/* ========= CARGA ========= */
const cargarAsientos = async () => {
  try {
    const response = await api.get('/asientos')
    // 🔹 ORDENAR POR FECHA MÁS RECIENTE PRIMERO Y LUEGO POR CONSECUTIVO MÁS ALTO
    datos.value = response.data.sort((a, b) => {
      // Primero por fecha (más reciente primero)
      const fechaCompare = new Date(b.fecha) - new Date(a.fecha)
      if (fechaCompare !== 0) return fechaCompare
      
      // Si misma fecha, por consecutivo más alto primero
      return b.consecutivo - a.consecutivo
    })
    console.log('✅ Asientos cargados ordenados por fecha reciente y consecutivo alto')
  } catch (error) {
    console.error('Error al cargar los asientos:', error)
    ElMessage.error('Error al cargar asientos')
  }
}

// 🔹 NUEVA FUNCIÓN PARA CARGAR INFORMACIÓN DE LA EMPRESA
const cargarEmpresaInfo = async () => {
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (empresaId) {
      const { data } = await api.get(`/empresas/${empresaId}`)
      empresaInfo.value = data
      console.log('✅ Información de empresa cargada:', data)
    } else {
      console.warn('No se encontró empresa_id en localStorage')
      // Intentar cargar desde el string 'empresas' en localStorage
      const empresasStorage = localStorage.getItem('empresas')
      if (empresasStorage) {
        try {
          const empresas = JSON.parse(empresasStorage)
          if (empresas.length > 0) {
            empresaInfo.value = empresas[0]
            console.log('✅ Empresa cargada desde localStorage empresas:', empresas[0])
          }
        } catch (e) {
          console.error('Error al parsear empresas desde localStorage:', e)
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar información de la empresa:', error)
    // Si hay error, usar valores por defecto del localStorage
    const empresasStorage = localStorage.getItem('empresas')
    if (empresasStorage) {
      try {
        const empresas = JSON.parse(empresasStorage)
        if (empresas.length > 0) {
          empresaInfo.value = empresas[0]
        }
      } catch (e) {
        console.error('Error al parsear empresas desde localStorage:', e)
      }
    }
  }
}

// 🔹 FUNCIÓN PARA CARGAR TODOS LOS DATOS NECESARIOS
const cargarDatosIniciales = async () => {
  await Promise.all([
    cargarAsientos(),
    cargarEmpresaInfo()
  ])
}

onMounted(() => {
  cargarDatosIniciales()
})

/* ========= FILTROS ========= */
const limpiarFiltros = () => {
  filtroTercero.value = ''
  filtroCuenta.value = ''
  filtroFecha.value = [null, null]
  filtroTipo.value = ''
  filtroConsecutivo.value = ''
  paginaActual.value = 1
}

/* Cuando cambian los filtros, volver a página 1 */
watch([filtroTercero, filtroCuenta, filtroFecha, filtroTipo, filtroConsecutivo], () => {
  paginaActual.value = 1
})

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
      inicio.setHours(0, 0, 0, 0)
      fDesdeOk = fecha >= inicio
    }
    if (filtroFecha.value[1]) {
      const fin = new Date(filtroFecha.value[1])
      fin.setHours(23, 59, 59, 999)
      fHastaOk = fecha <= fin
    }

    return cumpleTercero && cumpleCuenta && cumpleTipo && cumpleConsec && fDesdeOk && fHastaOk
  })

  // 🔹 MANTENER EL ORDEN ORIGINAL (MÁS RECIENTES PRIMERO) PARA EL SALDO ACUMULADO
  let saldos = {}
  return resultado.map(asiento => {
    const c = asiento.cuenta
    const d = parseFloat(asiento.debito || 0)
    const cr = parseFloat(asiento.credito || 0)
    if (!saldos[c]) saldos[c] = 0
    saldos[c] += d - cr
    return { ...asiento, saldo_actual: saldos[c].toFixed(2) }
  })
})

/* 🔹 PAGINACIÓN: mostrar solo los registros de la página actual */
const paginada = computed(() => {
  const inicio = (paginaActual.value - 1) * registrosPorPagina.value
  const fin = inicio + registrosPorPagina.value
  return filtrada.value.slice(inicio, fin)
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
/* =========================
   FORMATEO DE FECHAS
========================= */
const formatDate = f => {
  if (!f) return ''

  // Si f es string tipo "YYYY-MM-DDTHH:MM:SS", solo extraemos la parte de fecha
  const fechaStr = typeof f === 'string' ? f.split('T')[0] : f.toISOString().split('T')[0]

  const [year, month, day] = fechaStr.split('-')
  return `${day}/${month}/${year}`
}

/* =========================
   EXPORTAR EXCEL
========================= */
const exportarExcel = () => {
  const datosExport = filtrada.value.map(a => ({
    Consecutivo: a.consecutivo,
    Tipo: a.tipo,
    Cuenta: a.cuenta,
    Tercero: a.tercero ? (a.tercero.razon_social || `${a.tercero.nombres} ${a.tercero.apellidos}`) : '',
    Fecha: formatDate(a.fecha),  // 🔹 Fecha corregida
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

/* =========================
   EXPORTAR PDF ASIENTO
========================= */
const exportarAsientoPDF = async (tipo, consecutivo) => {
  exportandoPDF.value = true
  try {
    const empresaId = localStorage.getItem('empresa_id')
    if (!empresaId) return ElMessage.error('Seleccione una empresa primero')

    if (!empresaInfo.value.nombre_razon_social && !empresaInfo.value.nombre_comercial) {
      await cargarEmpresaInfo()
    }

    const { data } = await api.get(`/asientos/${tipo}/${consecutivo}`, {
      headers: { empresa_id: empresaId }
    })

    if (!Array.isArray(data) || data.length === 0) {
      ElMessage.error('No se encontraron registros para este asiento')
      return
    }

    const primer = data[0]
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })

    const nombreEmpresa = empresaInfo.value.nombre_razon_social || empresaInfo.value.nombre_comercial || 'EMPRESA'
    const nombreUsuario = primer.usuario_creador || 'Usuario'
    const nombreCuenta = primer.cuenta_info?.nombre || ''

    // Formateamos la fecha correctamente
    const fechaFormateada = formatDate(primer.fecha)

    // ENCABEZADO
    doc.setFontSize(16)
    doc.text(nombreEmpresa, 300, 30, { align: 'center' })

    doc.setFontSize(14)
    doc.text('COMPROBANTE DE ASIENTO CONTABLE', 300, 50, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`No. Comprobante: ${primer.consecutivo}`, 40, 80)
    doc.text(`Tipo: ${primer.tipo}`, 200, 80)
    doc.text(`Fecha: ${fechaFormateada}`, 350, 80) // 🔹 Fecha corregida

    if (primer.tercero) {
      const t = primer.tercero
      const nombreTercero = t.razon_social || `${t.nombres} ${t.apellidos}`
      doc.text(`Tercero: ${nombreTercero}`, 40, 100)
      doc.text(`Identificación: ${t.identificacion || ''}`, 40, 115)
    }

    doc.text(`Concepto: ${primer.concepto || ''}`, 40, 135)
    doc.text(`Cuenta: ${primer.cuenta} - ${nombreCuenta}`, 40, 150)

    // Tabla de cuentas
    const body = data.map(d => [
      `${d.cuenta} - ${d.cuenta_info?.nombre || ''}`,
      d.tercero ? (d.tercero.razon_social || `${d.tercero.nombres} ${d.tercero.apellidos}`) : '',
      d.concepto || '',
      parseFloat(d.debito).toLocaleString(),
      parseFloat(d.credito).toLocaleString()
    ])

    autoTable(doc, {
      startY: 170,
      head: [['Cuenta / Nombre', 'Tercero', 'Detalle', 'Débito', 'Crédito']],
      body,
      foot: [[
        '', '', 'TOTALES',
        data.reduce((s, i) => s + parseFloat(i.debito), 0).toLocaleString(),
        data.reduce((s, i) => s + parseFloat(i.credito), 0).toLocaleString()
      ]]
    })

    const finalY = doc.lastAutoTable.finalY + 40
    doc.text(`Preparado por: ${nombreUsuario}`, 40, finalY)
    doc.text('Revisado por: _______________________', 300, finalY)
    doc.text('Aprobado por: _______________________', 40, finalY + 30)

    doc.save(`Asiento-${primer.tipo}-${primer.consecutivo}.pdf`)
    ElMessage.success('PDF generado correctamente')
  } catch (e) {
    console.error('Error al generar PDF:', e)
    ElMessage.error('No se pudo generar el PDF detallado')
  } finally {
    exportandoPDF.value = false
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