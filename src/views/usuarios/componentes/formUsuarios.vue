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

    <el-form-item label="Rol">
      <el-select v-model="usuarioLocal.rol" placeholder="Seleccione un rol">
        <el-option label="Administrador" value="admin" />
        <el-option label="Usuario" value="usuario" />
        <!-- Agrega más roles si los tienes -->
      </el-select>
    </el-form-item>

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
  emit('guardar', usuarioLocal.value);
};

// Cancelar y cerrar el formulario
const cancelar = () => {
  emit('cancelar');
};
</script>
