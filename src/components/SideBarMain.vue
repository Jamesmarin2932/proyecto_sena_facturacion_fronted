<template>
  <div class="menu-container">
    <el-menu

      :default-active="$route.path"
      router
      class="el-menu-vertical-demo"
      background-color="#515459"
      text-color="#fefefe"
    
    >
    <el-sub-menu index="1">
          <template #title>CLIENTES</template>
          <el-menu-item index="Clientes">Clientes</el-menu-item>
          <el-menu-item index="1-2">Informes</el-menu-item>
          
        </el-sub-menu>

        
        <el-sub-menu index="2">
          <template #title>PRODUCTOS</template>
          <el-menu-item index="2-1">Crear producto</el-menu-item>
          <el-menu-item index="2-2">Consultar productos</el-menu-item>
          <el-menu-item index="2-3">Consultar stock</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>FACTURAS</template>
          <el-menu-item index="3-1">Crear factura</el-menu-item>
          <el-menu-item index="3-2">Consultar factura</el-menu-item>
          <el-menu-item index="3-3">Informe movimientos</el-menu-item>
        </el-sub-menu>
  
  
    </el-menu>
  </div>
</template>

<style scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  height: 100vh; 
}

.el-menu-vertical-demo {
  width: 250px;
  min-height: 100%;
  flex-grow: 1; 
  border-right: none; 
}
</style>

  
  