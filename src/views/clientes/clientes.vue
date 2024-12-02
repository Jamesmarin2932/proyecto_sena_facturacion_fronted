<template>
  <layout-main>
    <template #slotlayout>
      <header-button 
        v-if="!mostrarFormulario"
        :titulo="'DATOS DE CLIENTES'" 
        :tituloboton="'Crear cliente'" 
        :abrir="abrirFormulario" 
      />

      <!-- Formulario para gestión de cliente -->
      <formulario :titulo="'Gestión de clientes'" v-model:is-open="mostrarFormulario" :is-edit="editandoFormulario">
        <template #slotform>
          <formClientes :cliente="cliente" @guardar="actualizarCliente" />
        </template>
      </formulario>

      <!-- Tabla de datos de clientes -->
      <div v-if="!mostrarFormulario">
        <el-table :data="clientes" stripe style="width: 100%">
          <el-table-column prop="tipo_identificacion" label="Tipo de identificación" width="180" />
          <el-table-column prop="numero_identificacion" label="Número" width="180" />
          <el-table-column prop="nombres" label="Nombres" width="180" />
          <el-table-column prop="apellidos" label="Apellidos" width="180" />
          <el-table-column prop="direccion" label="Dirección" width="180" />
          <el-table-column prop="ciudad" label="Ciudad" width="180" />
          <el-table-column prop="telefono" label="Teléfono" width="180" />
          <el-table-column prop="correo" label="Correo" />
          <el-table-column fixed="right" label="Opciones" min-width="120">
            <template #default="registro">
              <!-- Botón de edición -->
              <el-button link type="primary" :icon="EditPen" @click="editarFormulario(registro.row.id)" />
              <!-- Botón de eliminación -->
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
import formClientes from '../clientes/Componentes/formClientes.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const mostrarFormulario = ref(false);
const editandoFormulario = ref(false);
const cliente = ref({}); 
const clientes = ref([]);


const abrirFormulario = () => {
  mostrarFormulario.value = true;
  editandoFormulario.value = false;
  cliente.value = {}; 
};

// Método para eliminar un cliente
const eliminarFormulario = (id) => {
  ElMessageBox.confirm(
    `¿Está seguro de eliminar el cliente?`, 
    'ELIMINAR REGISTRO',
    {
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      type: 'error',
    }
  )
  .then(async () => {
    
    const url = `http://127.0.0.1:8000/api/dato_clientes/delete/${id}`;

    try {
      
      const response = await axios.delete(url);

      if (response.status === 200) {
        
        ElMessage({
          type: 'success',
          message: 'Cliente eliminado con éxito',
        });

       
        clientes.value = clientes.value.filter(cliente => cliente.id !== id);
      } else {
        
        ElMessage({
          type: 'error',
          message: 'La eliminación no fue exitosa',
        });
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      
      ElMessage({
        type: 'error',
        message: 'Hubo un error al eliminar el cliente',
      });
    }
  })
  .catch(() => {
    
    ElMessage({
      type: 'info',
      message: 'Solicitud cancelada',
    });
  });
};



const editarFormulario = async (id) => {
  mostrarFormulario.value = true;
  editandoFormulario.value = true;

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/dato_clientes/getdataById/${id}`);
    cliente.value = { ...response.data.data };
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    ElMessage({
      type: 'error',
      message: 'Hubo un error al cargar los datos del cliente',
    });
  }
};


const actualizarCliente = async (clienteActualizado) => {
  try {
    const response = await axios.put(`http://127.0.0.1:8000/api/dato_clientes/update/${clienteActualizado.id}`, clienteActualizado);
    if (response.status === 200) {
      ElMessage({
        type: 'success',
        message: 'Cliente actualizado con éxito',
      });

      
      getClientes();
      mostrarFormulario.value = false; 
    }
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    ElMessage({
      type: 'error',
      message: 'Hubo un error al actualizar el cliente',
    });
  }
};


const getClientes = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/dato_clientes/getdata');
    clientes.value = response.data.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
};

onMounted(() => {
  getClientes();
});
</script>

<style scoped>
</style>
