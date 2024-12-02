<template>
  <el-form 
    ref="ruleFormRef"
    style="max-width: 100%"
    :model="formulario2"
    :rules="rules"
    label-width="auto"
    class="demo-formulario2 form-spacing"
    :size="formSize"
    status-icon
  >
    <el-form-item label="Codigo" prop="codigo">
      <el-input v-model="formulario2.codigo" />
    </el-form-item>

    <el-form-item label="Nombre" prop="nombre">
      <el-input v-model="formulario2.nombre" />
    </el-form-item>

    <el-form-item label="Descripcion" prop="descripcion">
      <el-input v-model="formulario2.descripcion" />
    </el-form-item>

    <el-form-item label="Precio" prop="precio">
      <el-input v-model="formulario2.precio" />
    </el-form-item>

    <el-form-item label="Stock" prop="stock">
      <el-input v-model="formulario2.stock" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="guardarProducto">Guardar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const formSize = ref('default');
const ruleFormRef = ref(null);
const formulario2 = reactive({
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  stock: ''
});

const rules = reactive({
  codigo: [{ required: true, message: 'Por favor ingrese un código', trigger: 'blur' }],
  nombre: [{ required: true, message: 'Por favor ingrese un nombre', trigger: 'blur' }],
  descripcion: [{ required: true, message: 'Por favor ingrese una descripción', trigger: 'blur' }],
  precio: [{ required: true, message: 'Por favor ingrese un precio', trigger: 'blur' }],
  stock: [{ required: true, message: 'Por favor ingrese el stock', trigger: 'blur' }]
});

const guardarProducto = async () => {
  try {
    await ruleFormRef.value.validate();
    await crearProducto();
    ruleFormRef.value.resetFields();
    ElMessage.success('Producto creado con éxito');
  } catch (error) {
    ElMessage.error('Error al guardar los datos');
  }
};

const crearProducto = async () => {
  const url = 'http://127.0.0.1:8000/api/nombre_productos/save';
  const dataFormulario = { ...formulario2 };

  try {
    await axios.post(url, dataFormulario);
  } catch (error) {
    console.error('Error al enviar datos al backend:', error);
    throw error;
  }
};
</script>

<style scoped>
.form-spacing {
  margin-top: 30px;
}
</style>