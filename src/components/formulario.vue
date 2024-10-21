<template>

<div class="container-header">
        <h1 class="titulo">{{ titulo }}</h1>
        <el-row justify="center"align="middle">
        <el-button type="primary">Guardar</el-button>
        <el-button type="danger">Cancelar</el-button>
        </el-row>

        <slot name="slotform"></slot>
    </div>

</template>

<script setup>

defineProps({
    titulo: String,
    
})

</script>

<style scoped>

</style>