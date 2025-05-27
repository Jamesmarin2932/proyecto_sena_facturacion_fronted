<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">Iniciar sesión</h2>
      <el-form :model="form" ref="formRef" label-position="top" class="login-form" @submit.prevent="login">
        <el-form-item label="Usuario" :rules="usernameRules" required>
          <el-input
            v-model="form.username"
            placeholder="Introduce tu nombre de usuario"
            prefix-icon="el-icon-user"
          ></el-input>
        </el-form-item>

        <el-form-item label="Contraseña" :rules="passwordRules" required>
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
        username: '', // El campo para el nombre de usuario
        password: '', // El campo para la contraseña
      },
      // Reglas de validación para los campos
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
  // Validamos el formulario antes de proceder
  this.$refs.formRef.validate(async (valid) => {
    if (valid) {
      try {
        // Enviar las credenciales al backend para autenticar al usuario
        const response = await axios.post('http://localhost:8000/api/login', {
          usuario: this.form.username,
          password: this.form.password,
        });

        // Verifica la respuesta de la API
        console.log(response.data); // Agrega esto para ver lo que se recibe

        // Si el inicio de sesión es exitoso
        if (response.data.token && response.data.username) {
          // Guardar el token de acceso y el nombre de usuario en el almacenamiento local
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username); // Guarda el nombre de usuario

          // Mensaje de éxito
          ElMessage.success('Inicio de sesión exitoso');
          // Redirigir al usuario a la página principal
          this.$router.push({ name: 'home' });
        }
      } catch (error) {
        // Si las credenciales son incorrectas o hay un error en la solicitud
        ElMessage.error('Credenciales incorrectas o hubo un error');
      }
    } else {
      // Si no es válido, mostramos un mensaje de advertencia
      ElMessage.warning('Por favor, completa los campos correctamente');
    }
  });
}
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

.signup-link {
  text-align: center;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.signup-link a {
  color: #409eff;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}
</style>
