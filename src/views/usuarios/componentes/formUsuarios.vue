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

    <!-- NUEVO: Selección múltiple de empresas -->
    <el-form-item label="Empresas">
      <el-select
        v-model="usuarioLocal.empresas"
        multiple
        filterable
        placeholder="Seleccione empresas"
      >
        <el-option
          v-for="empresa in listaEmpresas"
          :key="empresa.id"
          :label="empresa.nombre"
          :value="empresa.id"
        />
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
import { ref, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const props = defineProps({
  usuario: Object,
})

const emit = defineEmits(['guardar', 'cancelar'])

const usuarioLocal = ref({ ...props.usuario })
const esEdicion = computed(() => !!usuarioLocal.value.id)

const listaEmpresas = ref([]) // Lista de empresas para el select

// Cargar empresas desde backend
const cargarEmpresas = async () => {
  try {
    const { data } = await axios.get('/api/empresas')
    listaEmpresas.value = data
  } catch (error) {
    ElMessage.error('Error cargando empresas')
  }
}

onMounted(() => {
  cargarEmpresas()
})

watch(
  () => props.usuario,
  (nuevo) => {
    usuarioLocal.value = { ...nuevo }
  },
  { immediate: true }
)

const guardar = () => {
  const payload = {
    nombre_usuario: usuarioLocal.value.nombre_usuario,
    usuario: usuarioLocal.value.usuario,
    identificacion: usuarioLocal.value.identificacion,
    password: usuarioLocal.value.password,
    password_confirmation: usuarioLocal.value.password_confirmation,
    empresas: usuarioLocal.value.empresas || [], // Enviar array de empresas seleccionadas
  }

  console.log('📦 Enviando datos desde el hijo:', payload)
  emit('guardar', payload)
}

const cancelar = () => {
  emit('cancelar')
}
</script>
