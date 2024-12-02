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
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const formSize = ref('default');
const ruleFormRef = ref(null);

const ruleForm = reactive({
  tipo_identificacion: '',
  numero_identificacion: '',
  cliente: '',
  fecha: '',
  codigo_del_producto: '',
  producto: '',
  cantidad: 0,
  precio_unitario: 0,
  sub_total: 0,
  descuento: 0,
  iva: 0,
  total: 0,
  numero_factura: '',
});

const rules = {
  tipo_identificacion: [{ required: true, message: 'Por favor, seleccione un tipo de identificación', trigger: 'blur' }],
  numero_identificacion: [{ required: true, message: 'Por favor, ingrese el número de identificación', trigger: 'blur' }],
  cliente: [{ required: true, message: 'Por favor, ingrese el nombre del cliente', trigger: 'blur' }],
  producto: [{ required: true, message: 'Por favor, ingrese el producto', trigger: 'blur' }],
  cantidad: [{ required: true, type: 'number', message: 'Por favor, ingrese una cantidad', trigger: 'blur' }],
  precio_unitario: [{ required: true, type: 'number', message: 'Por favor, ingrese el precio unitario', trigger: 'blur' }],
};

// Función para calcular subtotal, iva y total
const calcularSubtotal = () => {
  return ruleForm.cantidad * ruleForm.precio_unitario;
};

const calcularIva = () => {
  return (calcularSubtotal() - ruleForm.descuento) * 0.19;
};

const calcularTotal = () => {
  return calcularSubtotal() - ruleForm.descuento + calcularIva();
};

// Función para guardar factura (Crear o actualizar)
const guardarFactura = async () => {
  ruleFormRef.value.validate(async (valid) => {
    if (valid) {
      if (ruleForm.numero_factura) {
        // Si ya existe número de factura, se hace actualización
        await actualizarFactura(ruleForm);
      } else {
        // Si no existe número de factura, se crea una nueva
        await crearFactura(ruleForm);
      }
      // Limpiar el formulario después de guardar
      Object.keys(ruleForm).forEach((key) => {
        ruleForm[key] = '';
      });
      ruleFormRef.value.resetFields();
    } else {
      ElMessage.error('Error al validar el formulario');
    }
  });
};

// Crear una nueva factura
const crearFactura = async (facturaNueva) => {
  try {
    const url = 'http://127.0.0.1:8000/api/descripcion_facturas/save/';
    const response = await axios.post(url, facturaNueva);
    if (response.status === 200) {
      ElMessage({
        type: 'success',
        message: 'Factura creada con éxito',
      });
    }
  } catch (error) {
    console.error('Error al crear la factura:', error);
    ElMessage({
      type: 'error',
      message: 'Hubo un error al crear la factura',
    });
  }
};

// Actualizar factura existente
const actualizarFactura = async (facturaActualizada) => {
  try {
    const url = `http://127.0.0.1:8000/api/descripcion_facturas/update/${facturaActualizada.numero_factura}`;
    const response = await axios.put(url, facturaActualizada);
    if (response.status === 200) {
      ElMessage({
        type: 'success',
        message: 'Factura actualizada con éxito',
      });
    }
  } catch (error) {
    console.error('Error al actualizar la factura:', error);
    ElMessage({
      type: 'error',
      message: 'Hubo un error al actualizar la factura',
    });
  }
};
</script>

<style scoped>
</style>
