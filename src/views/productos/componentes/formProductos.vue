<template>
  <div class="form-card">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      :size="formSize"
      status-icon
    >
      <el-row :gutter="20">
        <el-col :xs="24" :md="12">
          <el-form-item label="Código" prop="codigo">
            <el-input v-model="ruleForm.codigo" placeholder="Ingrese el código" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Nombre" prop="nombre">
            <el-input v-model="ruleForm.nombre" placeholder="Ingrese el nombre" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24">
          <el-form-item label="Descripción" prop="descripcion">
            <el-input v-model="ruleForm.descripcion" type="textarea" rows="3" placeholder="Descripción" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Precio" prop="precio">
            <el-input v-model.number="ruleForm.precio" type="number" placeholder="Precio" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Stock" prop="stock">
            <el-input v-model.number="ruleForm.stock" type="number" placeholder="Stock" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="24" class="form-actions">
          <el-button type="danger" @click="cancelarFormulario">Cancelar</el-button>
          <el-button type="primary" @click="guardarProducto">Guardar</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'FormProductos',
  props: {
    producto: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const formSize = ref('default');
    const ruleFormRef = ref(null);

    const ruleForm = reactive({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: null,
      stock: null
    });

    const rules = {
      codigo: [{ required: true, message: 'Código requerido', trigger: 'blur' }],
      nombre: [{ required: true, message: 'Nombre requerido', trigger: 'blur' }],
      descripcion: [{ required: true, message: 'Descripción requerida', trigger: 'blur' }],
      precio: [{ required: true, message: 'Precio requerido', trigger: 'blur' }],
      stock: [{ required: true, message: 'Stock requerido', trigger: 'blur' }]
    };

    watch(() => props.producto, (nuevoProducto) => {
      Object.assign(ruleForm, {
        codigo: nuevoProducto.codigo || '',
        nombre: nuevoProducto.nombre || '',
        descripcion: nuevoProducto.descripcion || '',
        precio: nuevoProducto.precio ?? null,
        stock: nuevoProducto.stock ?? null,
        id: nuevoProducto.id ?? null
      });
    }, { immediate: true });

    const guardarProducto = () => {
      ruleFormRef.value.validate((valid) => {
        if (!valid) {
          ElMessage.error('Formulario inválido');
          return;
        }

        emit('guardar', { ...ruleForm, id: props.producto?.id || null });
        ruleFormRef.value.resetFields();
      });
    };

    const cancelarFormulario = () => {
      ruleFormRef.value.resetFields();
      emit('cerrarFormulario');
    };

    return {
      formSize,
      ruleFormRef,
      ruleForm,
      rules,
      guardarProducto,
      cancelarFormulario
    };
  }
};
</script>

<style scoped>
.form-card {
  max-width: 960px;
  margin: 30px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>

