<script setup>
import NavBar from './NavBar.vue'
import SideBarMain from './SideBarMain.vue'
</script>

<template>

<el-container>
    <el-header>

        <NavBar/>
    </el-header>
</el-container>
<el-container>.....

    <el-aside width="250px">
        <SideBarMain/>
    </el-aside>
    <el-main>
        <slot name="slotlayout"></slot>
        <slot name="slotlayout2"></slot>
    </el-main>
</el-container>

 </template>
  

<style scoped>
/* Estilos CSS */


.el-container{
    flex:1;
    display: flex;
}
</style>
