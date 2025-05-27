<template>
  <layout-main>
    <template #slotlayout>
      <!-- Botón para abrir el formulario de registro -->
      <header-button 
        v-if="!mostrarFormulario"
        :titulo="'GESTIÓN DE USUARIOS'" 
        :tituloboton="'Registrar nuevo usuario'" 
        :abrir="abrirFormulario" 
      />

      <!-- Formulario para gestión de usuario -->
      <formulario :titulo="'Gestión de usuarios'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
        <template #slotform>
          <formUsuarios :usuario="usuario" @guardar="guardarUsuario" />
        </template>
      </formulario>

      <!-- Tabla de usuarios -->
      <div v-if="!mostrarFormulario">
        <el-table :data="usuarios" stripe style="width: 100%">
          <el-table-column prop="nombre_usuario" label="Nombre" width="180" />
          <el-table-column prop="identificacion" label="Identificación" width="180" />
          <el-table-column prop="usuario" label="Usuario" width="180" />
          <el-table-column fixed="right" label="Opciones" min-width="120">
            <template #default="registro">
              <el-button link type="primary" :icon="EditPen" @click="editarFormulario(registro.row.id)" />
              <el-button link type="danger" :icon="Delete" @click="eliminarFormulario(registro.row.id)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </template>
  </layout-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { EditPen, Delete } from '@element-plus/icons-vue';
import axios from 'axios';
import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formUsuarios from '../usuarios/componentes/formUsuarios.vue'; // Asegúrate de que la ruta sea correcta
import { ElMessage, ElMessageBox } from 'element-plus';

const mostrarFormulario = ref(false);
const usuarios = ref([]);
const editandoFormulario = ref(false); // Para controlar el estado de edición
const usuario = ref({});

// Función para abrir el formulario de registro
const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  usuario.value = {}; // Limpia el formulario para nuevo registro
};

// Función para obtener todos los usuarios
const getUsuarios = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/usuarios');
    if (response.data && response.data.users) {
      usuarios.value = response.data.users;
    } else {
      ElMessage.error('No se encontraron usuarios.');
    }
  } catch (error) {
    ElMessage.error('Error al obtener los usuarios');
  }
};

// Función para eliminar un usuario
const eliminarFormulario = (id) => {
  ElMessageBox.confirm(
    `¿Está seguro de eliminar el usuario?`, 
    'ELIMINAR REGISTRO',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      type: 'error',
    }
  )
  .then(async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/delete/${id}`);
      ElMessage.success('Usuario eliminado con éxito');
      getUsuarios();
    } catch (error) {
      ElMessage.error('Error al eliminar el usuario');
    }
  })
  .catch(() => {
    ElMessage.info('Solicitud cancelada');
  });
};

// Función para editar un usuario
const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/users/getdataById/${id}`);
    usuario.value = { ...response.data.data };
  } catch (error) {
    ElMessage.error('Error al obtener los datos del usuario');
  }
};

// Obtener los usuarios cuando se monta el componente
onMounted(() => {
  getUsuarios();
});
</script>

<style scoped>
/* Estilos de la tabla */
</style>

