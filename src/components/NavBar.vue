<template>
  <el-menu
    :default-active="activeIndex"
    background-color="#081323"
    text-color="#fefefe"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <!-- Logo -->
    <el-menu-item index="0" class="logo-item">
      <img class="logo-img" src="/imagenes/MARALOGO1.png" alt="logo" />
    </el-menu-item>

    <!-- Nombre comercial de la empresa -->
    <el-menu-item index="empresa" class="empresa-nombre">
      <span class="empresa-texto">{{ empresaNombre || 'Sin empresa' }}</span>
    </el-menu-item>

    <div class="flex-spacer"></div>

    <!-- Menú de usuario -->
    <el-sub-menu index="1">
      <template #title>
        <img :src="userPhoto" class="user-photo" alt="Perfil" />
        <span>{{ username.toUpperCase() }}</span>
      </template>
      <el-menu-item index="2-1">Perfil</el-menu-item>
      <el-menu-item index="2-2" @click="logout">Cerrar sesión</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '0',
      username: '',
      userPhoto: '',
      empresaNombre: ''
    };
  },
  mounted() {
    this.loadUserData();
    this.loadEmpresa();
    // Escuchar cambios en localStorage (por si cambia la empresa en otra vista)
    window.addEventListener('storage', this.loadEmpresa);
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.loadEmpresa);
  },
  watch: {
    '$route': 'loadUserData'
  },
  methods: {
    loadUserData() {
      this.username = localStorage.getItem('username') || 'Usuario';
      this.userPhoto = localStorage.getItem('userPhoto') || 'https://i.pravatar.cc/40';
    },
    loadEmpresa() {
      // Ahora toma el nombre_comercial
      this.empresaNombre = localStorage.getItem('empresa_nombre') || '';
    },
    handleSelect(index) {
      console.log(index);
    },
    logout() {
      localStorage.clear();
      this.$router.push({ name: 'inicio' });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');

.el-menu-demo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  z-index: 10;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  padding: 0 10px;
}

.flex-spacer {
  flex-grow: 1;
}

.logo-img {
  width: 50px;
  border-radius: 6px;
}

.empresa-nombre {
  cursor: default;
  pointer-events: none;
  display: flex;
  align-items: center;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 15px !important;
}

.empresa-texto {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 1px;
}

.user-photo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
  vertical-align: middle;
}

.el-menu-demo ::v-deep(.el-sub-menu__title) {
  font-weight: 500;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.el-menu-demo ::v-deep(.el-menu-item) {
  font-weight: 400;
  transition: background-color 0.2s;
}

.el-menu-demo ::v-deep(.el-sub-menu__title:hover),
.el-menu-demo ::v-deep(.el-menu-item:hover) {
  background-color: #0f1c33;
  color: #00d1b2;
}
</style>
