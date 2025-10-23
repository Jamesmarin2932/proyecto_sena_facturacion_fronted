<script setup>
import NavBar from './NavBar.vue'
import SideBarMain from './SideBarMain.vue'
</script>

<template>
  <el-container class="layout-container">
    <!-- 🔹 Navbar arriba -->
    <el-header class="header">
      <NavBar />
    </el-header>

    <!-- 🔹 Cuerpo con sidebar + contenido -->
    <el-container>
      <el-aside width="250px" class="aside">
        <SideBarMain />
      </el-aside>

      <el-main class="main">
        <slot name="slotlayout"></slot>
        <slot name="slotlayout2"></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh; /* Ocupa toda la pantalla */
  display: flex;
  flex-direction: column;
}

/* Navbar */
.header {
  padding: 0;
  background-color: #081323;
  height: 70px; /* coincide con tu NavBar */
  line-height: 70px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* Sidebar */
.aside {
  background-color: #081323;
  min-height: calc(100vh - 70px); /* ocupa todo el alto menos el header */
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
}

/* Contenido principal */
.main {
  background-color: #f4f6fb;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 70px);
}

/* Ajustes de flex internos */
.el-container {
  flex: 1;
  display: flex;
}
</style>
