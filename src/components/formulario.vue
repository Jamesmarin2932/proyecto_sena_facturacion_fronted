<template>

<div class="container-header" v-if="isVisible">
        <h1 class="titulo" >{{ titulo }}</h1>

        <el-row justify="center"align-items="middle">
            <el-button type="primary">{{ tituloBoton }}</el-button>

        <el-button type="danger" @click="irAtras" >Cancelar</el-button>
        </el-row>

        <slot name="slotform"></slot>

        
    </div>

</template>

<script setup>
import { computed, ref } from 'vue';


const propiedad =defineProps({
    titulo: String,
    isEdit: Boolean,
    isOpen:Boolean
    
})

const tituloBoton=computed(()=>(propiedad.isEdit ? 'Actualizar':'Guardar'))

const isVisible = computed(()=>  propiedad.isOpen);
const $emit = defineEmits(['update:is-open']);

const irAtras =()=>{
    $emit('update:is-open', false);
}

</script>

<style scoped>

.form-container{
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    right: 5px;
    width: 100%;
    z-index: 90;
    background-color: aliceblue;
    display: flex;
    flex-direction: column;
    height: calc(100vh + 42%);

}
.form-container_row{
    display: flex;
    align-items: center;
    padding: 10px;
}



</style>