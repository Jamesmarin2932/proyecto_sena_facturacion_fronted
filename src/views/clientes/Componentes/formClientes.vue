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
          <el-form-item label="Tipo de identificación" prop="Tipodeidentificacion">
            <el-select v-model="ruleForm.Tipodeidentificacion" placeholder="Seleccione tipo" clearable>
              <el-option label="C.C" value="CC" />
              <el-option label="NIT" value="NIT" />
              <el-option label="Cédula de Extranjería" value="CEDULA_EXTRANJERIA" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Número" prop="Numero">
            <el-input v-model="ruleForm.Numero" placeholder="Ingrese número" clearable>
              <template #prefix><el-icon><Document /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Nombres" prop="Nombres">
            <el-input v-model="ruleForm.Nombres" placeholder="Ingrese nombres" clearable>
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Apellidos" prop="Apellidos">
            <el-input v-model="ruleForm.Apellidos" placeholder="Ingrese apellidos" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Dirección" prop="Direccion">
            <el-input v-model="ruleForm.Direccion" placeholder="Ingrese dirección" clearable>
              <template #prefix><el-icon><Location /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Ciudad" prop="Ciudad">
            <el-input v-model="ruleForm.Ciudad" placeholder="Ingrese ciudad" clearable />
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Teléfono" prop="Telefono">
            <el-input v-model="ruleForm.Telefono" placeholder="Ingrese teléfono" clearable>
              <template #prefix><el-icon><Phone /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :xs="24" :md="12">
          <el-form-item label="Correo" prop="Correo">
            <el-input v-model="ruleForm.Correo" placeholder="Ingrese correo" clearable>
              <template #prefix><el-icon><Message /></el-icon></template>
            </el-input>
          </el-form-item>
        </el-col>

        <el-col :span="24" class="form-actions">
          <el-button type="danger" @click="cancelarFormulario">Cancelar</el-button>
          <el-button type="primary" @click="guardarCliente">Guardar</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { ref, reactive, watch, defineEmits } from 'vue';
import { Document, User, Location, Phone, Message } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'FormClientes',
  components: { Document, User, Location, Phone, Message },
  props: {
    cliente: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const formSize = ref('default');
    const ruleFormRef = ref(null);
    const ruleForm = reactive({
      Tipodeidentificacion: '',
      Numero: '',
      Nombres: '',
      Apellidos: '',
      Direccion: '',
      Ciudad: '',
      Telefono: '',
      Correo: ''
    });

    const rules = reactive({
      Tipodeidentificacion: [{ required: true, message: 'Por favor ingrese el tipo de identificación', trigger: 'blur' }],
      Numero: [{ required: true, message: 'Por favor ingrese el número', trigger: 'blur' }],
      Nombres: [{ required: true, message: 'Por favor ingrese el nombre', trigger: 'blur' }],
      Apellidos: [{ required: true, message: 'Por favor ingrese el apellido', trigger: 'blur' }],
      Direccion: [{ required: true, message: 'Por favor ingrese la dirección', trigger: 'blur' }],
      Ciudad: [{ required: true, message: 'Por favor ingrese la ciudad', trigger: 'blur' }],
      Telefono: [{ required: true, message: 'Por favor ingrese el teléfono', trigger: 'blur' }],
      Correo: [
        { required: true, message: 'Por favor ingrese el correo', trigger: 'blur' },
        { type: 'email', message: 'El correo no es válido', trigger: 'blur' }
      ]
    });

    watch(() => props.cliente, (newCliente) => {
      if (newCliente && Object.keys(newCliente).length) {
        ruleForm.Tipodeidentificacion = newCliente.tipo_identificacion || '';
        ruleForm.Numero = newCliente.numero_identificacion || '';
        ruleForm.Nombres = newCliente.nombres || '';
        ruleForm.Apellidos = newCliente.apellidos || '';
        ruleForm.Direccion = newCliente.direccion || '';
        ruleForm.Ciudad = newCliente.ciudad || '';
        ruleForm.Telefono = newCliente.telefono || '';
        ruleForm.Correo = newCliente.correo || '';
      } else {
        ruleForm.Tipodeidentificacion = '';
        ruleForm.Numero = '';
        ruleForm.Nombres = '';
        ruleForm.Apellidos = '';
        ruleForm.Direccion = '';
        ruleForm.Ciudad = '';
        ruleForm.Telefono = '';
        ruleForm.Correo = '';
      }
    }, { immediate: true });

    const guardarCliente = () => {
      ruleFormRef.value.validate((valid) => {
        if (valid) {
          // Emitir datos para que el padre decida si crea o actualiza
          const datosCliente = {
            tipo_identificacion: ruleForm.Tipodeidentificacion,
            numero_identificacion: ruleForm.Numero,
            nombres: ruleForm.Nombres,
            apellidos: ruleForm.Apellidos,
            direccion: ruleForm.Direccion,
            ciudad: ruleForm.Ciudad,
            telefono: ruleForm.Telefono,
            correo: ruleForm.Correo,
            id: props.cliente?.id || null
          };
          emit('guardar', datosCliente);
          ruleFormRef.value.resetFields();
        } else {
          ElMessage.error('Error al validar el formulario');
          return false;
        }
      });
    };

    const cancelarFormulario = () => {
      ruleFormRef.value.resetFields();
      emit('cerrarFormulario');
    };

    return {
      ruleForm, rules, formSize, ruleFormRef, guardarCliente, cancelarFormulario
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
