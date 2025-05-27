<template>
  <div class="form-card">
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
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
            <el-input v-model="ruleForm.nombre" placeholder="Ingrese el nombre del producto" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Precio" prop="precio">
            <el-input v-model.number="ruleForm.precio" placeholder="Ingrese el precio" clearable type="number" />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Cantidad" prop="cantidad">
            <el-input v-model.number="ruleForm.cantidad" placeholder="Ingrese la cantidad" clearable type="number" />
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
      precio: null,
      cantidad: null
    });

    const rules = reactive({
      codigo: [{ required: true, message: 'El código es obligatorio', trigger: 'blur' }],
      nombre: [{ required: true, message: 'El nombre es obligatorio', trigger: 'blur' }],
      precio: [{ required: true, message: 'El precio es obligatorio', trigger: 'blur' }],
      cantidad: [{ required: true, message: 'La cantidad es obligatoria', trigger: 'blur' }]
    });

    watch(() => props.producto, (newProducto) => {
      if (newProducto && Object.keys(newProducto).length) {
        ruleForm.codigo = newProducto.codigo || '';
        ruleForm.nombre = newProducto.nombre || '';
        ruleForm.precio = newProducto.precio || null;
        ruleForm.cantidad = newProducto.cantidad || null;
      } else {
        ruleForm.codigo = '';
        ruleForm.nombre = '';
        ruleForm.precio = null;
        ruleForm.cantidad = null;
      }
    }, { immediate: true });

    const guardarProducto = () => {
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          const datosProducto = {
            id: props.producto?.id || null,
            codigo: ruleForm.codigo,
            nombre: ruleForm.nombre,
            precio: ruleForm.precio,
            cantidad: ruleForm.cantidad
          };
          emit('guardar', datosProducto);
          ruleFormRef.value.resetFields();
        } else {
          ElMessage.error('Por favor complete todos los campos correctamente.');
          return false;
        }
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
  font-family: 'Roboto', sans-serif;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style>

