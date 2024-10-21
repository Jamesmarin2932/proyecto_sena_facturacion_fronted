<template>
    <div  class="container">

<div class="container-header">
        <h1 class="titulo">{{ titulo }}</h1>
        <el-row justify="center"align="middle">
        <el-button type="primary">{{ tituloboton }}</el-button>
        </el-row>
    </div>
        

    </div>




</template>

<script setup>

defineProps({
    titulo: String,
    tituloboton:String,
})

</script>

<style scoped>
.container{
    margin-bottom: 10;
}

.container-header{
    display: flex;
    justify-content: space-between;
    padding: 0px;
}
</style>