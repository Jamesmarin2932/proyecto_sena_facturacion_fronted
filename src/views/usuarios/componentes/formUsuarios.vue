<template>
  <el-form :model="usuarioLocal" label-width="120px" @submit.prevent>
    <el-form-item label="Nombre">
      <el-input v-model="usuarioLocal.nombre_usuario" />
    </el-form-item>

    <el-form-item label="Identificación">
      <el-input v-model="usuarioLocal.identificacion" />
    </el-form-item>

    <el-form-item label="Usuario">
      <el-input v-model="usuarioLocal.usuario" />
    </el-form-item>

    <el-form-item label="Contraseña" v-if="!esEdicion">
      <el-input v-model="usuarioLocal.password" type="password" />
    </el-form-item>

    <el-form-item label="Confirmar Contraseña" v-if="!esEdicion">
  <el-input v-model="usuarioLocal.password_confirmation" type="password" />
</el-form-item>


   <!--
<el-form-item label="Rol">
  <el-select v-model="usuarioLocal.rol" placeholder="Seleccione un rol">
    <el-option label="Administrador" value="admin" />
    <el-option label="Usuario" value="usuario" />
  </el-select>
</el-form-item>
-->


    <!-- Botones -->
    <el-form-item>
      <el-button type="primary" @click="guardar">Guardar</el-button>
      <el-button @click="cancelar">Cancelar</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps({
  usuario: Object,
});

const emit = defineEmits(['guardar', 'cancelar']);

// Crear una copia local para no modificar directamente la prop
const usuarioLocal = ref({ ...props.usuario });

// Detecta si estamos editando
const esEdicion = computed(() => !!usuarioLocal.value.id);

// Cuando cambie el prop, actualiza la copia local
watch(
  () => props.usuario,
  (nuevo) => {
    usuarioLocal.value = { ...nuevo };
  },
  { immediate: true }
);

// Guardar usuario
const guardar = () => {
  const payload = {
    nombre_usuario: usuarioLocal.value.nombre_usuario,
    usuario: usuarioLocal.value.usuario,
    identificacion: usuarioLocal.value.identificacion,
    password: usuarioLocal.value.password,
    password_confirmation: usuarioLocal.value.password_confirmation,
  };

  console.log('📦 Enviando datos desde el hijo:', payload);

  emit('guardar', payload);
};

// Cancelar y cerrar el formulario
const cancelar = () => {
  emit('cancelar');
};
</script>
