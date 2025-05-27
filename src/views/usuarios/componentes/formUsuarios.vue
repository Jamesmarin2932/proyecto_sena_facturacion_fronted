<template>
  <el-form 
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
    class="demo-ruleForm form-spacing"
    :size="formSize"
    status-icon
  >
    <el-form-item label="Nombre" prop="Nombre">
      <el-input v-model="ruleForm.Nombre" />
    </el-form-item>

    <el-form-item label="Identificación" prop="Identificacion">
      <el-input v-model="ruleForm.Identificacion" />
    </el-form-item>

    <el-form-item label="Usuario" prop="Usuario">
      <el-input v-model="ruleForm.Usuario" />
    </el-form-item>

    <el-form-item label="Contraseña" prop="Contrasena">
      <el-input v-model="ruleForm.Contrasena" type="password" />
    </el-form-item>

    <el-form-item label="Confirmar Contraseña" prop="ConfirmarContrasena">
      <el-input v-model="ruleForm.ConfirmarContrasena" type="password" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="guardarUsuario">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const formSize = ref('default');
const ruleFormRef = ref(null);

const ruleForm = reactive({
  Nombre: '',
  Identificacion: '',
  Usuario: '',
  Contrasena: '',
  ConfirmarContrasena: '',
});

const rules = reactive({
  Nombre: [
    { required: true, message: 'Por favor ingrese el nombre', trigger: 'blur' },
  ],
  Identificacion: [
    { required: true, message: 'Por favor ingrese la identificación', trigger: 'blur' },
  ],
  Usuario: [
    { required: true, message: 'Por favor ingrese el nombre de usuario', trigger: 'blur' },
  ],
  Contrasena: [
    { required: true, message: 'Por favor ingrese la contraseña', trigger: 'blur' },
  ],
  ConfirmarContrasena: [
    { required: true, message: 'Por favor confirme la contraseña', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== ruleForm.Contrasena) {
          callback(new Error('Las contraseñas no coinciden'));
        } else {
          callback();
        }
      }, trigger: 'blur' 
    },
  ],
});

const guardarUsuario = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await crearUsuario();
      ruleFormRef.value.resetFields();
    } else {
      ElMessage.error('Error al validar el formulario');
    }
  });
};

const crearUsuario = async () => {
  const nuevoUsuario = {
    nombre_usuario: ruleForm.Nombre,
    identificacion: ruleForm.Identificacion,
    usuario: ruleForm.Usuario,
    password: ruleForm.Contrasena,
    password_confirmation: ruleForm.ConfirmarContrasena,
  };

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/users/register', nuevoUsuario);
    ElMessage.success('Usuario registrado con éxito');
    // Si es necesario, hacer login o redirigir aquí
    // Redirigir a la página principal o dashboard
    // this.$router.push('/dashboard'); // Solo si usas Vue Router
  } catch (error) {
    ElMessage.error('Error al crear el usuario: ' + error.response.data.errors);
  }
};
</script>

<style scoped>
.form-spacing {
  margin-top: 30px;
}
</style>

