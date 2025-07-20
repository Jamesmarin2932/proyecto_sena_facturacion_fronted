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
    <el-input
      v-model="form.usuario"
      placeholder="Usuario"
      size="large"
    >
      <template #prefix>
        <el-icon><i class="el-icon-user"></i></el-icon>
      </template>
    </el-input>
  </el-form-item>

  <el-form-item prop="password" :rules="passwordRules">
    <el-input
      v-model="form.password"
      type="password"
      placeholder="Contraseña"
      show-password
      size="large"
    >
      <template #prefix>
        <el-icon><i class="el-icon-lock"></i></el-icon>
      </template>
    </el-input>
  </el-form-item>

  <div class="button-container">
    <el-button
      type="primary"
      size="large"
      class="login-button"
      @click="login"
    >
      Iniciar sesión
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
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter() // ✅ cambio aquí

const formRef = ref(null)

const form = reactive({
  usuario: '',
  password: '',
})

const usuarioRules = [{ required: true, message: 'Ingrese el usuario', trigger: 'blur' }]
const passwordRules = [{ required: true, message: 'Ingrese la contraseña', trigger: 'blur' }]

const login = async () => {
  try {
    await formRef.value.validate()
    const response = await axios.post('http://127.0.0.1:8000/api/login', form)

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    ElMessage.success('Inicio de sesión exitoso')
    router.push('/home')
  } catch (error) {
  console.log(error.response)
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

.login-box {
  display: flex;
  height: 100vh;
}

.left-side {
  width: 800px; /* ✅ ancho fijo */
  min-width: 700px;
  background: url('/public/imagenes/MARALOGO1.PNG') no-repeat center center;
  background-size: cover;
}


.right-side {
  flex: 1; /* sigue ocupando el resto */
  background-color: rgb(1, 44, 75);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}


.login-card {
  width: 100%;
  max-width: 400px;
  padding: 4rem 3rem;
  min-height: 500px;
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.6s ease-in;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* LOGO */
.logo-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}
.logo-img {
  width: 120px; /* ✅ MÁS GRANDE */
  height: auto;
}

/* TÍTULO */
.login-title {
  font-size: 2.5rem; /* ✅ MÁS GRANDE */
  text-align: center;
  margin-bottom: 2.5rem;
  color: #1d3557;
  font-weight: bold;
}

/* FORMULARIO */
.login-form {
  width: 100%;
}

/* INPUTS CON ÍCONO */
.input-with-icon ::v-deep(.el-input__inner) {
  border-radius: 12px;
  padding-left: 50px;
  height: 60px; /* ✅ MÁS ALTOS */
  font-size: 1.2rem; /* ✅ TEXTO MÁS GRANDE */
}

/* BOTÓN */
.button-container {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}

.login-button {
  width: 100%;
  height: 60px; /* ✅ MÁS ALTO */
  font-size: 1.2rem; /* ✅ TEXTO MÁS GRANDE */
  background-color: #1d3557;
  font-weight: bold;
  border-radius: 10px;
}
.login-button:hover {
  background-color: #16324f;
}

/* PIE DE PÁGINA */
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

  .login-card {
    min-height: auto;
    padding: 3rem 2rem;
  }

  .login-title {
    font-size: 2rem;
  }

  .logo-img {
    width: 90px;
  }

  .input-with-icon ::v-deep(.el-input__inner),
  .login-button {
    height: 50px;
    font-size: 1rem;
  }
}
</style>
