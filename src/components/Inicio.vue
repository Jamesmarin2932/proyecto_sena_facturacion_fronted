<template>
  <div class="main-container">
    <div class="login-box">
      <!-- LADO IZQUIERDO: IMAGEN -->
      <div class="left-side"></div>

      <!-- LADO DERECHO: FORMULARIO -->
      <div class="right-side">
        <el-card class="login-card">
          <h2 class="login-title">Iniciar sesión</h2>

          <el-form :model="form" ref="formRef" @submit.prevent="login" class="login-form">
            <el-form-item prop="username" :rules="usernameRules">
              <el-input
                v-model="form.username"
                placeholder="Usuario"
                prefix-icon="el-icon-user"
                size="large"
                class="input-with-icon"
              />
            </el-form-item>

            <el-form-item prop="password" :rules="passwordRules">
              <el-input
                v-model="form.password"
                placeholder="Contraseña"
                prefix-icon="el-icon-lock"
                show-password
                size="large"
                class="input-with-icon"
              />
            </el-form-item>

            <el-button type="primary" class="login-button" size="large" @click="login" block>
              Iniciar sesión
            </el-button>
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
import axios from 'axios'
import router from '@/router'

const formRef = ref(null)

const form = reactive({
  username: '',
  password: '',
})

const usernameRules = [{ required: true, message: 'Ingrese el usuario', trigger: 'blur' }]
const passwordRules = [{ required: true, message: 'Ingrese la contraseña', trigger: 'blur' }]

const login = async () => {
  try {
    await formRef.value.validate()
    const response = await axios.post('/api/login', form)

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    ElMessage.success('Inicio de sesión exitoso')
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error('Credenciales incorrectas')
  }
}
</script>

<style scoped>
/* CONTENEDOR PRINCIPAL */
.main-container {
  background-color: #f4f4f4;
  min-height: 100vh;
}

/* ESTRUCTURA PRINCIPAL */
.login-box {
  display: flex;
  height: 100vh;
}

/* IMAGEN IZQUIERDA */
.left-side {
  flex: 1;
  background: url('/public/imagenes/MARALOGO1.PNG') no-repeat center center;
  background-size: cover;
}

/* FORMULARIO DERECHO */
.right-side {
  flex: 1;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* CARD DE LOGIN */
.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  animation: fadeIn 0.5s ease-in;
}

/* TÍTULO */
.login-title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1d3557;
}

/* INPUTS CON ÍCONO */
.input-with-icon ::v-deep(.el-input__inner) {
  border-radius: 8px;
  padding-left: 40px;
  height: 45px;
}

/* BOTÓN LOGIN */
.login-button {
  background-color: #1d3557;
  font-weight: bold;
  margin-top: 1rem;
}
.login-button:hover {
  background-color: #16324f;
}

/* FOOTER */
.footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.85rem;
  color: #aaa;
}

/* ANIMACIÓN DE ENTRADA */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .login-box {
    flex-direction: column;
  }

  .left-side {
    height: 200px;
  }

  .right-side {
    padding: 2rem 1rem;
  }
}
</style>
