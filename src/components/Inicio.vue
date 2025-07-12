<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">Iniciar sesión</h2>
      <el-form :model="form" ref="formRef" label-position="top" class="login-form">
        <el-form-item label="Usuario" :rules="usernameRules" prop="username" required>
          <el-input
            v-model="form.username"
            placeholder="Introduce tu nombre de usuario"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>

        <el-form-item label="Contraseña" :rules="passwordRules" prop="password" required>
          <el-input
            v-model="form.password"
            placeholder="Introduce tu contraseña"
            type="password"
            prefix-icon="el-icon-lock"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" block @click="login">Iniciar sesión</el-button>
        </el-form-item>
      </el-form>
    </el-card>
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
        { min: 3, message: 'El nombre de usuario debe tener al menos 3 caracteres', trigger: 'blur' },
      ],
      passwordRules: [
        { required: true, message: 'Por favor ingresa tu contraseña', trigger: 'blur' },
        { min: 6, message: 'La contraseña debe tener al menos 6 caracteres', trigger: 'blur' },
      ],
    };
  },
  methods: {
    async login() {
      try {
        const valid = await this.$refs.formRef.validate();
        if (!valid) {
          ElMessage.warning('Por favor, completa los campos correctamente');
          return;
        }

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
          usuario: this.form.username,
          password: this.form.password,
        });

        console.log('Respuesta del backend:', response.data);

        if (response.data.token && response.data.username) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          ElMessage.success('Inicio de sesión exitoso');
          this.$router.push({ name: 'home' });
        } else {
          ElMessage.error('Credenciales inválidas');
        }

      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        ElMessage.error('Error al iniciar sesión. Verifica tus datos o intenta más tarde.');
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #cecaca;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}

.login-form {
  margin-top: 20px;
}
</style>

