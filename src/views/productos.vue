<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
  
  
  
      <el-form-item label="Codigo">
        <el-input v-model="form.name" />
        </el-form-item>
  
  
      
      <el-form-item label="Nombre">
        <el-input v-model="form.name" />
        </el-form-item>
  
        <el-form-item label="Descripcion">
        <el-input v-model="form.name" />
        </el-form-item>
  
        
        <el-form-item label="Precio">
        <el-input v-model="form.name" />
        </el-form-item>
  
        
        <el-form-item label="Stock">
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