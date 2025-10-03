<template>
  <LayoutMain>
    <template #slotlayout>
      <h1>Gestión de Empresas</h1>

      <!-- Formulario -->
      <el-form :model="empresa" label-width="180px" @submit.prevent>
        <el-form-item label="Nombre o Razón Social">
          <el-input v-model="empresa.nombre_razon_social" />
        </el-form-item>

        <el-form-item label="Nombre Comercial">
          <el-input v-model="empresa.nombre_comercial" />
        </el-form-item>

        <el-form-item label="NIT">
          <el-input v-model="empresa.nit" />
        </el-form-item>

        <el-form-item label="Dirección">
          <el-input v-model="empresa.direccion" />
        </el-form-item>

        <!-- País -->
        <el-form-item label="País">
          <CountrySelect v-model="empresa.pais" />
        </el-form-item>

        <!-- Departamento -->
        <el-form-item label="Departamento">
          <RegionSelect :country="empresa.pais" v-model="empresa.departamento" />
        </el-form-item>

        <!-- Ciudad -->
        <el-form-item label="Ciudad">
          <el-select
            v-model="empresa.ciudad"
            placeholder="Seleccione o escriba la ciudad"
            allow-create
            filterable
            clearable
            style="width: 100%;"
          >
            <el-option
              v-for="c in ciudades"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </el-form-item>

        <!-- Actividad Económica con autocomplete -->
        <el-form-item label="Actividad Económica">
          <el-select
            v-model="empresa.actividad_economica"
            placeholder="Seleccione una actividad"
            filterable
            remote
            clearable
            :remote-method="buscarActividad"
            :loading="cargandoActividades"
          >
            <el-option
              v-for="actividad in actividadesFiltradas"
              :key="actividad.codigo"
              :label="`${actividad.codigo} - ${actividad.descripcion}`"
              :value="actividad.codigo"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="guardarEmpresa">
            {{ empresa.id ? 'Actualizar' : 'Guardar' }}
          </el-button>
          <el-button @click="resetForm">Cancelar</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <!-- Tabla de empresas -->
      <el-table :data="empresas" style="width: 100%" v-loading="loading">
        <el-table-column prop="nombre_razon_social" label="Nombre o Razón Social" />
        <el-table-column prop="nombre_comercial" label="Nombre Comercial" />
        <el-table-column prop="nit" label="NIT" />
        <el-table-column prop="direccion" label="Dirección" />
        <el-table-column prop="ciudad" label="Ciudad" />
        <el-table-column prop="departamento" label="Departamento" />
        <el-table-column prop="pais" label="País" />
        <el-table-column label="Actividad Económica">
          <template #default="scope">
            {{ descripcionActividad(scope.row.actividad_economica) }}
          </template>
        </el-table-column>

        <el-table-column label="Acciones" width="180">
          <template #default="scope">
            <el-button size="small" @click="editarEmpresa(scope.row)">Editar</el-button>
            <el-button size="small" type="danger" @click="confirmarEliminacion(scope.row.id)">
              Eliminar
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </LayoutMain>
</template>

<script setup>
import Papa from 'papaparse'
import LayoutMain from '@/components/LayoutMain.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/services/api'
import { CountrySelect, RegionSelect } from 'vue3-country-region-select'

const router = useRouter()

// Estado principal
const empresa = ref({
  id: null,
  nombre_razon_social: '',
  nombre_comercial: '',
  nit: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  pais: '',
  actividad_economica: ''
})

const empresas = ref([])
const loading = ref(false)
const ciudades = ref([])
const actividades = ref([])
const actividadesFiltradas = ref([])
const cargandoActividades = ref(false)

// CRUD empresas
const cargarEmpresas = async () => {
  try {
    loading.value = true
    const { data } = await api.get('/empresas')
    empresas.value = data.data || data
  } catch (error) {
    console.error('Error al cargar empresas:', error)
    ElMessage.error('Error al cargar empresas. Verifica tu conexión o permisos.')
    if (error.response?.status === 401) router.push('/login')
  } finally {
    loading.value = false
  }
}

const guardarEmpresa = async () => {
  try {
    if (empresa.value.id) {
      await api.put(`/empresas/${empresa.value.id}`, empresa.value)
      ElMessage.success('Empresa actualizada correctamente')
    } else {
      await api.post('/empresas', empresa.value)
      ElMessage.success('Empresa creada correctamente')
    }
    resetForm()
    await cargarEmpresas()
  } catch (error) {
    console.error('Error al guardar empresa:', error)
    ElMessage.error(error.response?.data?.message || 'Error al guardar empresa')
  }
}

const editarEmpresa = (empresaSeleccionada) => {
  empresa.value = { ...empresaSeleccionada }
}

const confirmarEliminacion = async (id) => {
  try {
    await ElMessageBox.confirm(
      '¿Está seguro de eliminar esta empresa? Esta acción no se puede deshacer.',
      'Confirmar eliminación',
      { confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', type: 'warning' }
    )
    await eliminarEmpresa(id)
  } catch (error) {
    if (error !== 'cancel') ElMessage.info('Eliminación cancelada')
  }
}

const eliminarEmpresa = async (id) => {
  try {
    await api.delete(`/empresas/${id}`)
    ElMessage.success('Empresa eliminada correctamente')
    await cargarEmpresas()
  } catch (error) {
    console.error('Error al eliminar empresa:', error)
    ElMessage.error(error.response?.data?.message || 'Error al eliminar empresa')
  }
}

const resetForm = () => {
  empresa.value = {
    id: null,
    nombre_razon_social: '',
    nombre_comercial: '',
    nit: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: '',
    actividad_economica: ''
  }
}

// Mostrar descripción en tabla
const descripcionActividad = (codigo) => {
  const act = actividades.value.find(a => a.codigo === codigo)
  return act ? `${act.codigo} - ${act.descripcion}` : codigo
}

// Buscar actividad para autocomplete
const buscarActividad = (query) => {
  if (!query) {
    actividadesFiltradas.value = actividades.value
    return
  }
  const q = query.toLowerCase().trim()
  actividadesFiltradas.value = actividades.value.filter(
    a =>
      a.codigo.toLowerCase().includes(q) ||
      a.descripcion.toLowerCase().includes(q)
  )

  // Si el usuario escribió un código exacto, seleccionarlo automáticamente
  const exact = actividades.value.find(a => a.codigo.toLowerCase() === q)
  if (exact) {
    empresa.value.actividad_economica = exact.codigo
  }
}

// Cargar CSV de actividades económicas
const cargarActividadesCSV = async () => {
  try {
    cargandoActividades.value = true
    const response = await fetch('/ciiu.csv')
    const csvText = await response.text()
    const resultados = Papa.parse(csvText, { header: true, skipEmptyLines: true, delimiter: ';' })
    actividades.value = resultados.data
      .filter(row => row.CODIGO && row.DESCRIPCION)
      .map(row => ({
        codigo: row.CODIGO.trim(),
        descripcion: row.DESCRIPCION.trim()
      }))
    actividadesFiltradas.value = actividades.value
  } catch (error) {
    console.error('Error al cargar CIIU desde CSV:', error)
  } finally {
    cargandoActividades.value = false
  }
}

// Ciclo de vida
onMounted(() => {
  cargarEmpresas()
  cargarActividadesCSV()
})
</script>
