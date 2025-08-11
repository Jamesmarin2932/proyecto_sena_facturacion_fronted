<template>
  <div class="empresa-container">
    <el-card class="empresa-card">
      <h2>Selecciona tu empresa</h2>

      <el-form @submit.prevent="seleccionar">
        <el-form-item label="Empresa">
          <el-select
            v-model="empresaSeleccionada"
            placeholder="Seleccione una empresa"
            style="width: 100%"
          >
            <el-option
              v-for="empresa in empresas"
              :key="empresa.id"
              :label="empresa.nombre"
              :value="empresa.id"
            />
          </el-select>
        </el-form-item>

        <el-button
          type="primary"
          @click="seleccionar"
          :disabled="!empresaSeleccionada"
        >
          Continuar
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import LayoutMain from '../components/LayoutMain.vue' // Layout con navbar

const router = useRouter()
const empresas = ref([])
const empresaSeleccionada = ref(null)

onMounted(() => {
  const storedEmpresas = JSON.parse(localStorage.getItem('empresas')) || []

  if (storedEmpresas.length === 0) {
    // Si no hay empresas, redirige a home
    ElMessage.warning('No hay empresas registradas')
    router.push('/home')
    return
  }

  empresas.value = storedEmpresas
})

const seleccionar = () => {
  if (!empresaSeleccionada.value) {
    ElMessage.error('Seleccione una empresa')
    return
  }

  // Buscamos el objeto empresa por su id
  const empresaObj = empresas.value.find(
    e => e.id === empresaSeleccionada.value
  )

  // Guardamos en localStorage
  localStorage.setItem('empresa_id', empresaSeleccionada.value)
  localStorage.setItem('empresa_nombre', empresaObj?.nombre || '')

  ElMessage.success(`Empresa "${empresaObj?.nombre}" seleccionada`)
  router.push('/home')
}

</script>

<style scoped>
.empresa-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px); /* Ajuste para navbar */
  background-color: #f4f4f4;
}

.empresa-card {
  width: 400px;
  padding: 2rem;
  text-align: center;
}
</style>
