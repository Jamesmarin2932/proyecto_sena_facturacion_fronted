<template>
  <layout-main>
    <template #slotlayout>
      <!-- Botón para abrir el formulario de registro -->
      <header-button 
        v-if="!mostrarFormulario"
        :titulo="'GESTIÓN DE USUARIOS'" 
        :tituloboton="'Registrar nuevo usuario'" 
        :abrir="abrirFormulario" 
        @cancelar="cerrarFormulario"
      />

      <!-- Formulario para gestión de usuario -->
      <formulario
  :titulo="'Gestión de usuarios'"
  v-model:is-open="mostrarFormulario"
  :is-edit="editandoFormulario"
>
  <template #slotform>
    <!-- ⬇️ aquí agregamos @cancelar -->
    <formUsuarios
      :usuario="usuario"
      @guardar="guardarUsuario"
      @cancelar="cerrarFormulario"
    />
  </template>
</formulario>
      <!-- Tabla de usuarios -->
      <div v-if="!mostrarFormulario">
        <el-table :data="usuarios" stripe style="width: 100%">
          <el-table-column prop="nombre_usuario" label="Nombre" width="180" />
          <el-table-column prop="identificacion" label="Identificación" width="180" />
          <el-table-column prop="usuario" label="Usuario" width="180" />
          <!-- ✅ NUEVA COLUMNA: ROL -->
          <el-table-column prop="rol" label="Rol" width="160" />

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
import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formUsuarios from '../usuarios/componentes/formUsuarios.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/api';

const mostrarFormulario = ref(false);
const usuarios = ref([]);
const editandoFormulario = ref(false);
const usuario = ref({});

const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  usuario.value = {};
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  usuario.value = {};
};

const getUsuarios = async () => {
  try { 
    const response = await api.get('/usuarios');
    if (response.data?.users) {
      usuarios.value = response.data.users;
    } else {
      ElMessage.error('Estructura de respuesta inesperada');
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    ElMessage.error('Error al obtener usuarios');
  }
};

const eliminarFormulario = (id) => {
  ElMessageBox.confirm(
    '¿Está seguro de eliminar el usuario?', 
    'ELIMINAR REGISTRO',
    { confirmButtonText: 'Sí', cancelButtonText: 'Cancelar', type: 'error' }
  )
  .then(async () => {
    try {
      await api.delete(`/usuarios/${id}`);
      ElMessage.success('Usuario eliminado con éxito');
      await getUsuarios();
    } catch (error) {
      ElMessage.error('Error al eliminar el usuario');
    }
  })
  .catch(() => {
    ElMessage.info('Solicitud cancelada');
  });
};

const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;
  try {
    const response = await api.get(`/usuarios/${id}`);
    usuario.value = { ...response.data.user };
  } catch (error) {
    ElMessage.error('Error al obtener los datos del usuario');
  }
};

const guardarUsuario = async (payload) => {
  if (
    !payload.nombre_usuario ||
    !payload.usuario ||
    !payload.identificacion ||
    (!editandoFormulario.value && (!payload.password || !payload.password_confirmation))
  ) {
    return ElMessage.error('Por favor complete todos los campos obligatorios');
  }

  if (!editandoFormulario.value && payload.password !== payload.password_confirmation) {
    return ElMessage.error('Las contraseñas no coinciden');
  }

  try {
    if (editandoFormulario.value) {
      // ✅ RUTA CORRECTA PARA ACTUALIZAR
      await api.put(`/users/update/${payload.id}`, payload);
      ElMessage.success('Usuario actualizado con éxito');
    } else {
      // ✅ RUTA CORRECTA PARA CREAR
      await api.post('/users/register', payload);
      ElMessage.success('Usuario registrado con éxito');
    }

    await getUsuarios();
    cerrarFormulario();
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    ElMessage.error(error.response?.data?.message || 'Error al guardar usuario');
  }
};

const verificarAccesoEmpresa = async () => {
  try {
    const empresaActivaId = localStorage.getItem('empresa_id');
    const response = await api.get('/mis-empresas');
    console.log('Empresas del usuario:', response.data);
    console.log('¿Acceso a empresa?', 
      response.data.some(e => e.id == empresaActivaId)
    );
  } catch (error) {
    console.error('Error al verificar empresas:', error);
  }
};

onMounted(() => {
  verificarAccesoEmpresa();
  getUsuarios();
});
</script>




<style scoped>
/* Estilos personalizados aquí si deseas */
</style>
