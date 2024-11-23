<template>
  <el-form 
    ref="ruleFormRef"
    :model="ruleForm"
    :rules="rules"
    label-width="auto"
    class="demo-ruleForm form-spacing"
    :size="formSize"
    status-icon
  >
    <el-form-item label="Tipo de identificación" prop="tipo_identificacion">
      <el-select v-model="ruleForm.tipo_identificacion" placeholder="Seleccione tipo de identificación">
        <el-option label="C.C" value="CC" />
        <el-option label="NIT" value="NIT" />
        <el-option label="Cédula de Extranjería" value="CEDULA_EXTRANJERIA" />
      </el-select>
    </el-form-item>

    <el-form-item label="N° identificación" prop="numero_identificacion">
      <el-input v-model="ruleForm.numero_identificacion" />
    </el-form-item>

    <el-form-item label="Cliente" prop="cliente">
      <el-input v-model="ruleForm.cliente" />
    </el-form-item>

    <el-form-item label="Fecha" prop="fecha">
      <el-input
        v-model="ruleForm.fecha"
        type="date"
        placeholder="Selecciona un día"
      />
    </el-form-item>

    <el-form-item label="Código del producto" prop="codigo_del_producto">
      <el-input v-model="ruleForm.codigo_del_producto" />
    </el-form-item>

    <el-form-item label="Producto" prop="producto">
      <el-input v-model="ruleForm.producto" />
    </el-form-item>

    <el-form-item label="Cantidad" prop="cantidad">
      <el-input v-model.number="ruleForm.cantidad" type="number" placeholder="Ingrese la cantidad" @input="calcularIvaYTotal" />
    </el-form-item>

    <el-form-item label="Precio unitario" prop="precio_unitario">
      <el-input v-model.number="ruleForm.precio_unitario" type="number" placeholder="Ingrese el precio unitario" @input="calcularIvaYTotal" />
    </el-form-item>

    <el-form-item label="Sub total" prop="sub_total">
      <el-input v-model.number="ruleForm.sub_total" type="number" placeholder="Ingrese el sub total" :value="calcularSubtotal()" readonly />
    </el-form-item>

    <el-form-item label="Descuento" prop="descuento">
      <el-input v-model.number="ruleForm.descuento" type="number" placeholder="Ingrese el descuento" @input="calcularIvaYTotal" />
    </el-form-item>

    <el-form-item label="IVA" prop="iva">
      <el-input v-model.number="ruleForm.iva" type="number" :value="calcularIva()" readonly />
    </el-form-item>

    <el-form-item label="Total" prop="total">
      <el-input v-model.number="ruleForm.total" type="number" :value="calcularTotal()" readonly />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="guardarFactura">Guardar</el-button>
    </el-form-item>

  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';
import { ElMessage, ElForm, ElInput, ElButton } from 'element-plus';
import 'element-plus/dist/index.css'; 

const formSize = ref('default');
const ruleFormRef = ref(null);

const ruleForm = reactive({
  tipo_identificacion: '',
  numero_identificacion: '',
  cliente: '',
  fecha: new Date().toISOString().split('T')[0],  
  codigo_del_producto: '',
  producto: '',
  cantidad: 0,
  precio_unitario: 0,
  sub_total: 0,
  descuento: 0,
  iva: 0,
  total: 0,
});

// Reglas de validación (si las necesitas)
const rules = reactive({
  // Puedes agregar reglas de validación aquí si es necesario
});


const calcularSubtotal = () => {
  return ruleForm.cantidad * ruleForm.precio_unitario;
};

const calcularIvaYTotal = () => {
  const subtotal = calcularSubtotal();
  const subtotalConDescuento = subtotal - ruleForm.descuento;
  const iva = subtotalConDescuento * 0.19;
  ruleForm.sub_total = subtotalConDescuento;
  ruleForm.iva = iva;
  const total = subtotalConDescuento + iva;
  ruleForm.total = total;
};

const calcularIva = () => {
  const subtotalConDescuento = calcularSubtotal() - ruleForm.descuento;
  return subtotalConDescuento * 0.19;
};

const calcularTotal = () => {
  const subtotalConDescuento = calcularSubtotal() - ruleForm.descuento;
  return subtotalConDescuento + calcularIva();
};

const guardarFactura = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      await crearFactura();
    
      Object.keys(ruleForm).forEach(key => {
        ruleForm[key] = '';
      });
      ruleFormRef.value.resetFields();
    } else {
      ElMessage.error('Error al validar el formulario');
    }
  });
};

// Función para crear la factura en el backend
const crearFactura = async () => {
  const url = 'http://127.0.0.1:8000/api/descripcion_facturas/save';
  
  // Convertir la fecha a formato 'yyyy-MM-dd' (asegúrate de que la fecha esté como string)
  const fechaFormateada = ruleForm.fecha ? ruleForm.fecha : '';

  const dataFormulario = {
    tipo_identificacion: ruleForm.tipo_identificacion,
    numero_identificacion: ruleForm.numero_identificacion,
    cliente: ruleForm.cliente,
    fecha: fechaFormateada,  // Enviar la fecha formateada como string
    codigo_del_producto: ruleForm.codigo_del_producto,
    producto: ruleForm.producto,
    cantidad: ruleForm.cantidad,
    precio_unitario: ruleForm.precio_unitario,
    sub_total: ruleForm.sub_total,
    descuento: ruleForm.descuento,
    iva: ruleForm.iva,
    total: ruleForm.total,
  };

  try {
    const response = await axios.post(url, dataFormulario);
    if (response.data.data) {
      ElMessage.success('Factura creada con éxito');
      ruleForm.numero_factura = response.data.data.numero_factura; // Mostrar el número de factura generado
    }
  } catch (error) {
    ElMessage.error('Error al guardar los datos');
  }
};
</script>

<style scoped>
.form-spacing {
  margin-top: 30px;
}
</style>



