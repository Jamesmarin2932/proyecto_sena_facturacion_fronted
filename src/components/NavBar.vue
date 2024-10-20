<template>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="0">
        <img
          style="width: 50px"
          src="../components/imagenes/Diseño sin título.jpg"
          alt="logo"
        />
      </el-menu-item>
  
      <!-- Espacio flexible para empujar los elementos a la derecha -->
      <div class="flex-spacer"></div>
  
      <el-sub-menu index="1">
        <template #title>James Marin</template>
        <el-menu-item index="2-1">Perfil</el-menu-item>
        <el-menu-item index="2-2">Cerrar sesión</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </template>
  
  <script>
  export default {
    data() {
      return {
        activeIndex: '0', // Asegúrate de ajustar esto según sea necesario
      };
    },
    methods: {
      handleSelect(index) {
        // Manejo de la selección
        console.log(index);
      },
    },
  };
  </script>
  
  <style scoped>
  .el-menu-demo {
    display: flex; /* Activar Flexbox */
    justify-content: space-between; /* Espacio entre elementos */
    align-items: center; /* Centrar verticalmente */
    width: 100%;
    z-index: 10;
  }
  
  .flex-spacer {
    flex-grow: 1; /* Esta clase hace que el espacio flexible ocupe todo el espacio disponible */
  }
  </style>
  
  

  
