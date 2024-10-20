<template>
    <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      @open="handleOpen"
      @close="handleClose"
    >
      <el-sub-menu index="1">
        <template #title>
          <el-icon><location /></el-icon>
          <span>Menú</span>
        </template>
          <el-menu-item index="1-1">Clientes</el-menu-item>
          <el-menu-item index="1-2">Productos</el-menu-item>
         <el-menu-item index="1-3">Facturacion</el-menu-item>
        <el-sub-menu index="1-4">
          <template #title>Informes</template>
          <el-menu-item index="1-4-1">Consolidado</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
     
      
    </el-menu>
  </template>
  