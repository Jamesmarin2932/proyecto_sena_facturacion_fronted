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
  </el-form>
</template>

<script setup>
import { reactive, ref } from 'vue';

const formSize = ref('default');
const formulario2Ref = ref();
const formulario2 = reactive({
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: '',
  stock: ''
});

const rules = reactive({
  codigo: [
    { required: true, message: 'Por favor ingrese un codigo', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],

  nombre: [
    { required: true, message: 'Por favor ingrese un nombre', trigger: 'blur' },
    { min: 3, max: 30, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],

  descripcion: [
    { required: true, message: 'Por favor ingrese una descripcion', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],

  precio: [
    { required: true, message: 'Por favor ingrese un valor', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],

  stock: [
    { required: true, message: 'Por favor ingrese un valor', trigger: 'blur' },
    { min: 1, max: 1000, message: 'La cantidad no puede ser menor a 1', trigger: 'blur' }
  ]


});





</script>

<style scoped>
.form-spacing {
  margin-top: 30px;
}
</style>
