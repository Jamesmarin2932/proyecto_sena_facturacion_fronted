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
<el-container>

    <el-aside>
        <SideBarMain/>
    </el-aside>
    <el-main>
        
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
