<template>
  <el-form :model="form" label-width="auto" style="max-width: 600px">

    <el-form-item label="Tipo de identificacion">
      <el-select v-model="form.region" placeholder="Seleccione el tipo de identificación">
        <el-option label="CC" value="shanghai" />
        <el-option label="Nit" value="beijing" />
        <el-option label="Cedula de extranjeria" value="beijing" />
      </el-select>
    </el-form-item>

    <el-form-item label="Numero de identificación">
      <el-input v-model="form.name" />
      </el-form-item>


    
    <el-form-item label="Nombres">
      <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="Apellidos">
      <el-input v-model="form.name" />
      </el-form-item>

      
      <el-form-item label="Dirección">
      <el-input v-model="form.name" />
      </el-form-item>

      
      <el-form-item label="Ciudad">
      <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="Telefono">
      <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="Correo">
      <el-input v-model="form.name" />
      </el-form-item>

   
    <el-form-item label="Observaciones">
      <el-input v-model="form.desc" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">Guardar</el-button>
      <el-button>Cancelar</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

// do not use same name with ref
const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

const onSubmit = () => {
  console.log('submit!')
}
</script>
