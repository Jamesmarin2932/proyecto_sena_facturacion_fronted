<template>
  <div class="container">
    <h1 class="titulo">{{ titulo }}</h1>
    <div class="boton-wrapper">
      <el-button type="primary" @click="abrir">{{ tituloboton }}</el-button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: String,
  tituloboton: String,
  abrir: {
    type: Function,
    required: true,
  }
});
</script>

<style scoped>
.container {
  margin-bottom: 0;
}

.titulo {
  text-align: center;
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.boton-wrapper {
  display: flex;
  justify-content: flex-start;
}
</style>
