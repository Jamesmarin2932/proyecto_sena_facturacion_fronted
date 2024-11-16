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
    <el-form-item label="Tipo de identificación" prop="Tipodeidentificacion">
      <el-select v-model="ruleForm.Tipodeidentificacion" placeholder="Seleccione tipo de identificación">
        <el-option label="C.C" value="CC" />
        <el-option label="NIT" value="NIT" />
        <el-option label="Cédula de Extranjería" value="CEDULA_EXTRANJERIA" />
      </el-select>
    </el-form-item>

    <el-form-item label="Número" prop="Numero">
      <el-input v-model="ruleForm.Numero" />
    </el-form-item>

    <el-form-item label="Nombres" prop="Nombres">
      <el-input v-model="ruleForm.Nombres" />
    </el-form-item>

    <el-form-item label="Apellidos" prop="Apellidos">
      <el-input v-model="ruleForm.Apellidos" />
    </el-form-item>

    <el-form-item label="Dirección" prop="Direccion">
      <el-input v-model="ruleForm.Direccion" />
    </el-form-item>

    <el-form-item label="Ciudad" prop="Ciudad">
      <el-input v-model="ruleForm.Ciudad" />
    </el-form-item>

    <el-form-item label="Teléfono" prop="Telefono">
      <el-input v-model="ruleForm.Telefono" />
    </el-form-item>

    <el-form-item label="Correo" prop="Correo">
      <el-input v-model="ruleForm.Correo" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="guardarCliente">Guardar</el-button>
    </el-form-item>
  </el-form>


</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const formSize = ref('default');
const ruleFormRef = ref(null);
const ruleForm = reactive({

  Tipodeidentificacion: '',
  Numero: '',
  Nombres: '',
  Apellidos: '',
  Direccion: '',
  Ciudad: '',
  Telefono: '',
  Correo: ''
});

const rules = reactive({
  Tipodeidentificacion: [
    { required: true, message: 'Por favor ingrese el tipo de identificación', trigger: 'blur' },
  ],
  Numero: [
    { required: true, message: 'Por favor ingrese el número', trigger: 'blur' },
  ],
  Nombres: [
    { required: true, message: 'Por favor ingrese el nombre', trigger: 'blur' },
  ],
  Apellidos: [
    { required: true, message: 'Por favor ingrese el apellido', trigger: 'blur' },
  ],
  Direccion: [
    { required: true, message: 'Por favor ingrese la dirección', trigger: 'blur' },
  ],
  Ciudad: [
    { required: true, message: 'Por favor ingrese la ciudad', trigger: 'blur' },
  ],
  Telefono: [
    { required: true, message: 'Por favor ingrese el teléfono', trigger: 'blur' },
  ],
  Correo: [
    { required: true, message: 'Por favor ingrese el correo', trigger: 'blur' },
    { type: 'email', message: 'El correo no es válido', trigger: 'blur' }
  ],
});

const guardarCliente = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await crearCliente();
      
     
      Object.keys(ruleForm).forEach(key => {
        ruleForm[key] = '';
      });

      ruleFormRef.value.resetFields();
    } else {
      ElMessage.error('Error al validar el formulario');
    }
  });
};


const crearCliente = async () => {
  const url = 'http://127.0.0.1:8000/api/dato_clientes/save';
  
  const dataFormulario = {
    tipo_identificacion: ruleForm.Tipodeidentificacion,
    numero_identificacion: ruleForm.Numero,
    nombres: ruleForm.Nombres,
    apellidos: ruleForm.Apellidos,
    direccion: ruleForm.Direccion,
    ciudad: ruleForm.Ciudad,
    telefono: ruleForm.Telefono,
    correo: ruleForm.Correo,
  };

  try {
    const response = await axios.post(url, dataFormulario);
    ElMessage.success('Cliente creado con éxito');
  } catch (error) {
    ElMessage.error('Error al guardar los datos');
  }
};
</script>

<style scoped>
.form-spacing {
  margin-top: 30px;
}
</style>

