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
import axios from 'axios';
import LayoutMain from '../../components/LayoutMain.vue';
import headerButton from '../../components/headerButton.vue';
import formulario from '../../components/formulario.vue';
import formUsuarios from '../usuarios/componentes/formUsuarios.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import api from '@/api'; // usa la ruta correcta según tu proyecto

const mostrarFormulario = ref(false);
const usuarios = ref([]);
const editandoFormulario = ref(false);
const usuario = ref({});

// Abrir formulario para nuevo registro
const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  usuario.value = {}; // Limpia el formulario
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  usuario.value = {};
};


// Obtener usuarios del backend
const getUsuarios = async () => {
  try { 
    // Verifica que el token se esté enviando
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    
    const response = await api.get('/usuarios');
    console.log('Respuesta de /usuarios:', response);
    console.log('Datos recibidos:', response.data);
    
    if (response.data && response.data.users) {
      usuarios.value = response.data.users;
      console.log('Usuarios cargados:', usuarios.value);
    } else {
      ElMessage.error('Estructura de respuesta inesperada');
    }
  } catch (error) {
    console.error('Error completo:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    ElMessage.error('Error al obtener usuarios');
  }
};


// En eliminarFormulario - usa la misma ruta que en tu backend
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
      await api.delete(`/usuarios/${id}`); // ✅ Ruta correcta
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

// En editarFormulario - usa la misma ruta
const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await api.get(`/usuarios/${id}`); // ✅ Ruta correcta
    // El backend devuelve: { user: {...} }
    usuario.value = { ...response.data.user };
  } catch (error) {
    ElMessage.error('Error al obtener los datos del usuario');
  }
};

// Llamar al cargar
onMounted(() => {
  getUsuarios();
});


//guardar usuario

const guardarUsuario = async (payload) => {
  // Validar campos obligatorios
  if (
    !payload.nombre_usuario ||
    !payload.usuario ||
    !payload.identificacion ||
    (!editandoFormulario.value && (!payload.password || !payload.password_confirmation))
  ) {
    return ElMessage.error('Por favor complete todos los campos obligatorios');
  }

  // Validar contraseñas solo si es nuevo
  if (!editandoFormulario.value && payload.password !== payload.password_confirmation) {
    return ElMessage.error('Las contraseñas no coinciden');
  }

  try {
    let response;

    if (editandoFormulario.value) {
      // 👉 Editar usuario existente
      response = await api.put(`/users/update/${payload.id}`, payload);
      ElMessage.success('Usuario actualizado con éxito');
    } else {
      // 👉 Crear nuevo usuario
      response = await api.post('/users/register', payload);
      ElMessage.success('Usuario registrado con éxito');
    }

    // Refrescar tabla y cerrar formulario
    await getUsuarios();
    cerrarFormulario();

    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al guardar usuario';
    ElMessage.error(msg);
    console.error('Error al guardar usuario:', error.response?.data || error);
  }
};


// En usuarios.vue
const verificarAccesoEmpresa = async () => {
  try {
    const empresaId = localStorage.getItem('empresa_activa');
    const response = await api.get('/mis-empresas');
    
    console.log('🏢 Empresas del usuario:', response.data);
    console.log('🔍 ¿Tiene acceso a empresa', empresaId, '?', 
      response.data.some(empresa => empresa.id == empresaId));
    
  } catch (error) {
    console.error('Error al verificar empresas:', error);
  }
};

// Llama esta función en mounted
onMounted(() => {
  verificarAccesoEmpresa();
  getUsuarios();
});



</script>

<style scoped>
/* Estilos personalizados aquí si deseas */
</style>
