<template>
  <el-card shadow="hover" class="max-w-4xl mx-auto mt-6 p-6 rounded-2xl">
    <h2 class="text-xl font-semibold mb-4"></h2>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :size="formSize"
      label-width="150px"
      @submit.prevent
    >
      <el-row :gutter="20">
        <!-- Tipo de Persona -->
        <el-col :span="12">
          <el-form-item label="Tipo de Persona" prop="tipo_persona">
            <el-select v-model="form.tipo_persona" placeholder="Seleccione">
              <el-option label="Natural" value="natural" />
              <el-option label="Jurídica" value="juridica" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- Tipo de Tercero -->
        <el-col :span="12">
          <el-form-item label="Tipo de Tercero" prop="tipo_tercero">
            <el-select v-model="form.tipo_tercero" placeholder="Seleccione">
              <el-option label="Cliente" value="cliente" />
              <el-option label="Proveedor" value="proveedor" />
              <el-option label="Ambos" value="ambos" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- Tipo y número de identificación -->
        <el-col :span="12">
          <el-form-item label="Tipo de ID" prop="tipo_identificacion">
            <el-select v-model="form.tipo_identificacion" placeholder="Seleccione">
              <el-option label="CC" value="CC" />
              <el-option label="NIT" value="NIT" />
              <el-option label="CE" value="CE" />
              <el-option label="PAS" value="PAS" />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Número de ID" prop="numero_identificacion">
            <el-input v-model="form.numero_identificacion" />
          </el-form-item>
        </el-col>

        <!-- Nombres y apellidos (solo si es natural) -->
        <template v-if="form.tipo_persona === 'natural'">
          <el-col :span="12">
            <el-form-item label="Nombres">
              <el-input v-model="form.nombres" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Apellidos">
              <el-input v-model="form.apellidos" />
            </el-form-item>
          </el-col>
        </template>

        <!-- Razón social (solo si es jurídica) -->
        <template v-if="form.tipo_persona === 'juridica'">
          <el-col :span="24">
            <el-form-item label="Razón Social">
              <el-input v-model="form.razon_social" />
            </el-form-item>
          </el-col>
        </template>

        <!-- Dirección -->
        <el-col :span="12">
          <el-form-item label="Dirección" prop="direccion">
            <el-input v-model="form.direccion" />
          </el-form-item>
        </el-col>

       <!-- País, Departamento y Ciudad (ordenado correctamente) -->
<el-col :span="12">
  <el-form-item label="País">
    <CountrySelect v-model="form.pais" />
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="Departamento" prop="departamento">
    <RegionSelect :country="form.pais" v-model="form.departamento" />
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="Ciudad" prop="ciudad">
    <el-select
      v-model="form.ciudad"
      filterable
      allow-create
      default-first-option
      placeholder="Escriba o seleccione"
    >
      <el-option
        v-for="ciudad in ciudades"
        :key="ciudad"
        :label="ciudad"
        :value="ciudad"
      />
    </el-select>
  </el-form-item>
</el-col>

        <!-- Código Postal y País -->
        <el-col :span="12">
          <el-form-item label="Código Postal">
            <el-input v-model="form.codigo_postal" />
          </el-form-item>
        </el-col>


        <!-- Teléfono y Correo -->
        <el-col :span="12">
          <el-form-item label="Teléfono">
            <el-input v-model="form.telefono" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="Correo">
            <el-input v-model="form.correo" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
  <el-form-item label="Cuenta Gasto/Costo">
    <el-input v-model="form.cuenta_gasto_costo" placeholder="Ej: 510505 - Gastos de Administración" />
  </el-form-item>
</el-col>

        <!-- Actividad Económica -->
        <el-col :span="24">
          <el-form-item label="Actividad Económica">
            <el-input v-model="form.actividad_economica" />
          </el-form-item>
        </el-col>

        <!-- Observaciones -->
        <el-col :span="24">
          <el-form-item label="Observaciones">
            <el-input type="textarea" v-model="form.observaciones" rows="3" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Botones -->
      <!-- Botones alineados a la derecha -->
<div class="flex justify-end mt-6 space-x-3">
  <el-button @click="$emit('cerrarFormulario')">Cancelar</el-button>
  <el-button type="primary" @click="guardarCliente">Guardar</el-button>
</div>

    </el-form>
  </el-card>
</template>



<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import axios from 'axios';
import { CountrySelect, RegionSelect } from 'vue3-country-region-select';
import { ElMessage } from 'element-plus';

const props = defineProps({
  cliente: Object
});
const emit = defineEmits(['guardar', 'cerrarFormulario']);

const formRef = ref(null);
const formSize = ref('default');

const form = reactive({
  tipo_identificacion: '',
  numero_identificacion: '',
  nombres: '',
  apellidos: '',
  razon_social: '',
  tipo_persona: 'natural',
  tipo_tercero: 'cliente',
  direccion: '',
  departamento: '',
  ciudad: '',
  codigo_postal: '',
  pais: 'Colombia',
  telefono: '',
  correo: '',
  actividad_economica: '',
  observaciones: '',
  cuenta_gasto_costo: '' // 👈 nuevo campo
});


watch(() => props.cliente, (nuevo) => {
  if (nuevo && Object.keys(nuevo).length) {
    Object.assign(form, { ...nuevo });
  } else {
    Object.keys(form).forEach(key => form[key] = '');
  }
}, { immediate: true });

const rules = {
  nombres: [{ required: true, message: 'Ingrese nombres', trigger: 'blur' }],
  apellidos: [{ required: true, message: 'Ingrese apellidos', trigger: 'blur' }],
  tipo_identificacion: [{ required: true, message: 'Seleccione tipo de ID', trigger: 'change' }],
  numero_identificacion: [{ required: true, message: 'Ingrese número de identificación', trigger: 'blur' }],
  telefono: [{ required: true, message: 'Ingrese teléfono', trigger: 'blur' }],
  correo: [
    { required: true, message: 'Ingrese correo', trigger: 'blur' },
    { type: 'email', message: 'Correo inválido', trigger: 'blur' },
  ],
};

const ciudades = ref([]);
const countryCodes = {
  Colombia: 'co',
  México: 'mx',
  Argentina: 'ar',
  Perú: 'pe',
  Chile: 'cl',
  Ecuador: 'ec',
  Venezuela: 've',
  Panamá: 'pa',
  Uruguay: 'uy',
};

watch([() => form.departamento, () => form.pais], async ([dep, pais]) => {
  ciudades.value = [];
  form.ciudad = '';
  form.codigo_postal = '';
  const code = countryCodes[pais];
  if (!dep || !code) return;

  try {
    const res = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: {
        text: dep,
        filter: `countrycode:${code}`,
        lang: 'es',
        limit: 20,
        apiKey: 'c3f58dda1e8b4870b44697ee0aea78f1',
      },
    });

    const features = res.data?.features || [];
    ciudades.value = [...new Set(features.map(f =>
      f.properties.city || f.properties.county
    ).filter(Boolean))];
  } catch (error) {
    console.warn('Error al obtener ciudades:', error);
    ciudades.value = [];
  }
});

watch(() => form.ciudad, async (ciudad) => {
  const code = countryCodes[form.pais];
  if (!ciudad || !code) return;

  try {
    const res = await axios.get('https://api.geoapify.com/v1/geocode/search', {
      params: {
        text: ciudad,
        filter: `countrycode:${code}`,
        lang: 'es',
        limit: 1,
        apiKey: 'c3f58dda1e8b4870b44697ee0aea78f1',
      },
    });

    const props = res.data?.features?.[0]?.properties;
    form.codigo_postal = props?.postcode || '';
  } catch (error) {
    console.warn('Error al obtener código postal:', error);
  }
});

const guardarCliente = () => {
  formRef.value.validate((valid) => {
    if (!valid) return;
    emit('guardar', { ...form });
  });
};
</script>


