<!-- SeleccionarEmpresa.vue -->
<template>
  <div v-if="empresas.length === 0" class="loading">
    <h2>Cargando empresas...</h2>
  </div>

  <div v-else-if="empresas.length === 1" class="auto-redirect">
    <div class="redirect-message">
      <h2>📦 Bienvenido a {{ empresas[0].nombre_comercial }}</h2>
      <p>Redirigiendo a tu panel de control...</p>
      <el-progress :percentage="progressPercentage" :status="progressStatus" />
    </div>
  </div>

  <div v-else class="empresa-container">
    <el-card class="empresa-card">
      <h2>🏢 Selecciona tu empresa</h2>
      <p>Tienes acceso a {{ empresas.length }} empresas</p>

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
              :label="empresa.nombre_comercial"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const empresas = ref([])
const empresaSeleccionada = ref(null)
const progressPercentage = ref(0)
const progressStatus = ref('success')
let progressInterval = null

onMounted(() => {
  const storedEmpresas = JSON.parse(localStorage.getItem('empresas')) || []
  empresas.value = storedEmpresas

  // ✅ Redirección automática si solo tiene una empresa
  if (empresas.value.length === 1) {
    startAutoRedirect()
  }
})

const startAutoRedirect = () => {
  let progress = 0
  progressInterval = setInterval(() => {
    progress += 10
    progressPercentage.value = progress
    
    if (progress >= 100) {
      clearInterval(progressInterval)
      seleccionarAutomaticamente()
    }
  }, 150)
}

const seleccionarAutomaticamente = () => {
  const empresa = empresas.value[0]
  localStorage.setItem('empresa_id', empresa.id)
  localStorage.setItem('empresa_nombre', empresa.nombre_comercial)
  router.push('/home')
}

const seleccionar = () => {
  if (!empresaSeleccionada.value) {
    ElMessage.error('Seleccione una empresa')
    return
  }

  const empresaObj = empresas.value.find(e => e.id === empresaSeleccionada.value)

  localStorage.setItem('empresa_id', empresaSeleccionada.value)
  localStorage.setItem('empresa_nombre', empresaObj?.nombre_comercial || '')

  ElMessage.success(`Empresa "${empresaObj?.nombre_comercial}" seleccionada`)
  router.push('/home')
}

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})
</script>

<style scoped>
.auto-redirect {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.redirect-message {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.redirect-message h2 {
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.empresa-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px);
  background-color: #f4f4f4;
}

.empresa-card {
  width: 400px;
  padding: 2rem;
  text-align: center;
}
</style>