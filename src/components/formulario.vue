<template>
    <div class="container-header" v-if="isVisible">
      <h1 class="titulo">{{ titulo }}</h1>
      <el-row justify="end" align-items="middle">
        <el-button type="primary" @click="guardarFormulario">{{ tituloBoton }}</el-button>
        <el-button type="danger" @click="irAtras">Cancelar</el-button>
      </el-row>
      <slot name="slotform"></slot>
    </div>
  </template>
  
  <script setup>
  import { computed, ref } from 'vue';
  
  const propiedad = defineProps({
    titulo: String,
    isEdit: Boolean,
    isOpen: Boolean
  });
  
  const tituloBoton = computed(() => (propiedad.isEdit ? 'Actualizar' : 'Guardar'));
  const isVisible = computed(() => propiedad.isOpen);
  const $emit = defineEmits(['update:is-open', 'guardar']);
  
  const irAtras = () => {
    $emit('update:is-open', false);
  };
  
 
  const guardarFormulario = () => {
    $emit('guardar');
  };
  </script>
  