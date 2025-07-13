<template>
  <div class="main-container">
    <div class="login-box">
      <!-- IZQUIERDA: MARA y logo -->
      <div class="left-side">
        <h1 class="brand-title">MARA</h1>
        <div class="brand-image-placeholder">
          <!-- Aquí puedes poner tu logo -->
          LOGO
        </div>
      </div>

      <!-- DERECHA: Login -->
      <div class="right-side">
        <el-card class="login-card">
          <h2 class="login-title">Iniciar sesión</h2>
          <el-form :model="form" ref="formRef" label-position="top" class="login-form" @submit.prevent="login">
            <el-form-item label="Usuario" :rules="usernameRules" required>
              <el-input
                v-model="form.username"
                placeholder="Introduce tu nombre de usuario"
                prefix-icon="el-icon-user"
              />
            </el-form-item>

            <el-form-item label="Contraseña" :rules="passwordRules" required>
              <el-input
                v-model="form.password"
                placeholder="Introduce tu contraseña"
                type="password"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" class="login-button" block @click="login">
                Iniciar sesión
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>

    <footer class="footer">
      <p>Software desarrollado por James Marín</p>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      usernameRules: [
        { required: true, message: 'Por favor ingresa tu nombre de usuario', trigger: 'blur' },
        { min: 3, message: 'Debe tener al menos 3 caracteres', trigger: 'blur' },
      ],
      passwordRules: [
        { required: true, message: 'Por favor ingresa tu contraseña', trigger: 'blur' },
        { min: 6, message: 'Debe tener al menos 6 caracteres', trigger: 'blur' },
      ],
    };
  },
  methods: {
    async login() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            const response = await axios.post('http://localhost:8000/api/login', {
              usuario: this.form.username,
              password: this.form.password,
            });

            if (response.data.token && response.data.username) {
              localStorage.setItem('token', response.data.token);
              localStorage.setItem('username', response.data.username);

              ElMessage.success('Inicio de sesión exitoso');
              this.$router.push({ name: 'home' });
            }
          } catch (error) {
            ElMessage.error('Credenciales incorrectas o hubo un error');
          }
        } else {
          ElMessage.warning('Por favor, completa los campos correctamente');
        }
      });
    },
  },
};
</script>

<style scoped>
/* Fondo general */
.main-container {
  background-color: #0d1b2a; /* Azul oscuro principal */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem;
  box-sizing: border-box;
}

/* Caja principal */
.login-box {
  display: flex;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  max-width: 900px;
  width: 100%;
  min-height: 400px;
}

/* IZQUIERDA: MARA y logo */
.left-side {
  flex: 1;
  background-color: #274c77; /* Azul petróleo para contraste */
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.brand-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  animation: fadeInUp 1s ease;
}

.brand-image-placeholder {
  width: 140px;
  height: 140px;
  border: 2px dashed #ffffff66;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff99;
  font-size: 0.9rem;
  animation: fadeIn 1.5s ease;
}

/* DERECHA: Login */
.right-side {
  flex: 1;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 320px;
  border-radius: 12px;
  box-shadow: none;
  padding: 0;
}

.login-title {
  text-align: center;
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #2d2d2d;
}

.login-button {
  background-color: #1d3557;
  border: none;
  font-weight: bold;
}
.login-button:hover {
  background-color: #16324f;
}

/* Footer */
.footer {
  color: #ffffffaa;
  text-align: center;
  margin-top: 2rem;
  font-size: 0.9rem;
}

/* Animaciones */
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

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
