<template>
  <div class="home">
    <h1>Sistema de Gestión de Criptomonedas</h1>
    <p>Bienvenido al sistema de gestión de compras de criptomonedas.</p>
    
    <div class="menu-options">  
      <router-link to="/nuevo-cliente" class="menu-button">
        👤 Nuevo Cliente
      </router-link>
       <router-link to="/nueva-compra" class="menu-button">
        📈 Nueva Compra de Criptomoneda
      </router-link>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'HomeView' });
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
}

.menu-options {
  margin-top: 40px;
}

.menu-button {
  display: inline-block;
  padding: 15px 30px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 18px;
  margin: 10px;
}

.menu-button:hover {
  background-color: #369870;
}
</style>
