<template>
  <div class="main-container">
    <div class="login-box">
      <!-- LADO IZQUIERDO: IMAGEN -->
      <div class="left-side"></div>

      <!-- LADO DERECHO: FORMULARIO -->
      <div class="right-side">
        <el-card class="login-card">
          <!-- LOGO -->
          <div class="logo-container">
            <img src="/imagenes/MARALOGO1.png" alt="Logo" class="logo-img" />
          </div>

          <!-- TÍTULO -->
          <h2 class="login-title">Inicio de Sesión</h2>

          <!-- FORMULARIO -->
          <el-form :model="form" ref="formRef" @submit.prevent="login" class="login-form">
            <el-form-item prop="usuario" :rules="usuarioRules">
              <el-input v-model="form.usuario" placeholder="Usuario" size="large">
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password" :rules="passwordRules">
              <el-input v-model="form.password" type="password" placeholder="Contraseña" show-password size="large">
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <div class="button-container">
              <el-button 
                type="primary" 
                size="large" 
                class="login-button" 
                @click="login"
                :loading="loading"
              >
                {{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </div>

    <footer class="footer">
      <p>Software desarrollado por James Marín</p>
    </footer>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import api from '@/api' // ✅ Usar tu instancia de api configurada

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  usuario: '',
  password: '',
})

const usuarioRules = [{ required: true, message: 'Ingrese el usuario', trigger: 'blur' }]
const passwordRules = [{ required: true, message: 'Ingrese la contraseña', trigger: 'blur' }]

const login = async () => {
  try {
    // Validar formulario
    await formRef.value.validate()
    loading.value = true

    // ✅ Usar tu instancia de api (que incluye la baseURL automáticamente)
    const response = await api.post('/login', form)

    console.log('Respuesta completa del login:', response.data)
    
    const empresas = Array.isArray(response.data.empresas) ? response.data.empresas : []
    const userData = response.data.user || {}

    // Guardar datos en localStorage
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('username', userData.nombre_usuario || userData.usuario || '')
    localStorage.setItem('empresas', JSON.stringify(empresas))

    // Manejar redirección según número de empresas
    if (empresas.length === 1) {
      // ✅ Una sola empresa - selección automática
      localStorage.setItem('empresa_id', empresas[0].id)
      localStorage.setItem('empresa_nombre', empresas[0].nombre_comercial || '')
      
      ElMessage.success(`Bienvenido a ${empresas[0].nombre_comercial}`)
      router.push('/home')
      
    } else if (empresas.length > 1) {
      // ✅ Múltiples empresas - ir a selección
      ElMessage.success('Inicio de sesión exitoso')
      router.push('/seleccionar-empresa')
      
    } else {
      // ❌ Sin empresas
      ElMessage.error('No tienes empresas asociadas. Contacta al administrador.')
      // Limpiar datos por seguridad
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

  } catch (error) {
    console.error('Error en login:', error)
    
    // Mensaje de error específico
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Credenciales incorrectas'
    
    ElMessage.error(errorMessage)
    
  } finally {
    loading.value = false
  }
}

// ✅ Limpiar datos antiguos al cargar el componente
localStorage.removeItem('empresa_id')
localStorage.removeItem('empresa_nombre')
</script>

<style scoped>
.main-container {
  background-color: #f4f4f4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-box {
  display: flex;
  flex: 1;
}

.left-side {
  flex: 1;
  background: url('/imagenes/MARALOGO1.png') no-repeat center center;
  background-size: cover;
  min-height: 400px;
}

.right-side {
  flex: 1;
  background-color: rgb(1, 44, 75);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-in;
}

.logo-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.logo-img {
  width: 120px;
  height: auto;
}

.login-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #1d3557;
  font-weight: bold;
}

.login-form {
  width: 100%;
}

:deep(.el-input__inner) {
  border-radius: 12px;
  padding-left: 40px;
  height: 50px;
  font-size: 1rem;
}

:deep(.el-input__prefix) {
  display: flex;
  align-items: center;
  padding-left: 10px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.login-button {
  width: 100%;
  height: 50px;
  font-size: 1.1rem;
  background-color: #1d3557;
  font-weight: bold;
  border-radius: 10px;
  border: none;
}

.login-button:hover {
  background-color: #16324f;
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.login-button:active {
  transform: translateY(0);
}

.footer {
  text-align: center;
  padding: 1.5rem;
  font-size: 0.9rem;
  color: #666;
  background-color: #fff;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 968px) {
  .login-box {
    flex-direction: column;
  }

  .left-side {
    min-height: 250px;
    flex: none;
  }

  .right-side {
    padding: 1.5rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
    max-width: 350px;
  }

  .login-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }

  .logo-img {
    width: 100px;
  }
}

@media (max-width: 480px) {
  .right-side {
    padding: 1rem;
  }

  .login-card {
    padding: 1.5rem;
    border-radius: 15px;
  }

  .login-title {
    font-size: 1.5rem;
  }

  :deep(.el-input__inner) {
    height: 45px;
    font-size: 0.9rem;
  }

  .login-button {
    height: 45px;
    font-size: 1rem;
  }
}
</style>