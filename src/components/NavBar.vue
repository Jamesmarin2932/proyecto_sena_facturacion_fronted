<template>
    <el-menu
      :default-active="activeIndex"
      background-color="#bb15bd"
      text-color="#fefefe"
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
        activeIndex: '0', 
      };
    },
    methods: {
      handleSelect(index) {
       
        console.log(index);
      },
    },
  };
  </script>
  
  <style scoped>
  .el-menu-demo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    z-index: 10;
  }
  
  .flex-spacer {
    flex-grow: 1; 
  }
  </style>
  
  

  
