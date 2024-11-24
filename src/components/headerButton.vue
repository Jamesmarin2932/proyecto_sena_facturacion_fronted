<template>
    <div class="container">
      <div class="container-header">
        <h1 class="titulo">{{ titulo }}</h1>
        <el-row justify="center" align="middle">
          <!-- Llamar a la función abrir cuando se hace clic en el botón -->
          <el-button type="primary" @click="abrir">{{ tituloboton }}</el-button>
        </el-row>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    titulo: String,
    tituloboton: String,
    abrir: {
      type: Function,
      required: true, // Asegúrate de que 'abrir' sea requerido
    }
  });
  </script>
  
  <style scoped>
  .container {
    margin-bottom: 10px;
  }
  
  .container-header {
    display: flex;
    justify-content: space-between;
    padding: 0px;
  }
  </style>
  