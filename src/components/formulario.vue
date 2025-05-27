<!-- src/components/formulario.vue -->
<template>
  <div class="container-header" v-if="isVisible">
    <h2 class="titulo">{{ titulo }}</h2>
    <div class="form-content">
      <slot name="slotform"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  titulo: String,
  isOpen: Boolean
});

const isVisible = computed(() => props.isOpen);
</script>

<style scoped>
.container-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9fafb;
}

.titulo {
  text-align: center;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0;
  color: #303133;
  font-family: 'Roboto', sans-serif;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

