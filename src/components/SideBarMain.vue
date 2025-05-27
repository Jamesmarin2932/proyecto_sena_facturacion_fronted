<script setup>
import { User, Goods, Document, Wallet, Coin, Setting } from '@element-plus/icons-vue'
</script>

<template>
  <div class="menu-container">
    <el-menu
      :default-active="$route.path"
      router
      class="el-menu-vertical-demo modern-font"
      background-color="#081323"
      text-color="#fdfdfd"
      active-text-color="#00d1b2"
      unique-opened
    >
      <el-sub-menu index="1">
        <template #title>
          <User />
          <span>TERCEROS</span>
        </template>
        <el-menu-item index="/clientes">Datos de terceros</el-menu-item>
        <el-menu-item index="1-2">Informes</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <Goods />
          <span>PRODUCTOS</span>
        </template>
        <el-menu-item index="/productos">Datos de productos</el-menu-item>
        <el-menu-item index="2-2">Consultar productos</el-menu-item>
        <el-menu-item index="2-3">Consultar stock</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <Document />
          <span>FACTURAS</span>
        </template>
        <el-menu-item index="/facturas">Crear factura</el-menu-item>
        <el-menu-item index="3-2">Consultar factura</el-menu-item>
        <el-menu-item index="3-3">Informe movimientos</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="4">
        <template #title>
          <Wallet />
          <span>BANCOS</span>
        </template>
        <el-menu-item index="/bancos/descargar">Descargar plantilla</el-menu-item>
        <el-menu-item index="/bancos/importar">Importar movimientos</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="5">
        <template #title>
          <Coin />
          <span>CONTABILIDAD</span>
        </template>
        <el-menu-item index="/contabilidad/librodiario">Libro Diario</el-menu-item>
        <el-menu-item index="/contabilidad/cuentas">Gestión de cuentas</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="6">
        <template #title>
          <Setting />
          <span>CONFIGURACIÓN</span>
        </template>
        <el-menu-item index="/usuarios">Crear usuario</el-menu-item>
        <el-menu-item index="5-2">Cambiar contraseña</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.modern-font {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}

.el-menu-vertical-demo ::v-deep(.el-sub-menu__title) {
  font-weight: 600;
  font-size: 15px;
  transition: background-color 0.3s;
}

.el-menu-vertical-demo ::v-deep(.el-menu-item) {
  font-weight: 400;
  transition: background-color 0.2s;
}

.el-menu-vertical-demo ::v-deep(.el-sub-menu__title:hover),
.el-menu-vertical-demo ::v-deep(.el-menu-item:hover) {
  background-color: #0f1c33;
  color: #00d1b2;
}

.el-menu-vertical-demo ::v-deep(.el-sub-menu__title svg) {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  vertical-align: middle;
  fill: currentColor;
}

.el-menu-vertical-demo ::v-deep(.el-menu-item.is-active) {
  background-color: #112d50;
  font-weight: 500;
}
</style>
