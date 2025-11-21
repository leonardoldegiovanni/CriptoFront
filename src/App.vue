<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-link">Inicio</router-link>
        <router-link to="/nueva-compra" class="nav-link">Nueva Compra</router-link>
        <router-link to="/nueva-venta" class="nav-link">Nueva Venta</router-link>
        <router-link to="/nuevo-cliente" class="nav-link">Nuevo Cliente</router-link>
        <router-link to="/historial-movimientos" class="nav-link">Historial</router-link>
      </div>
    </nav>
    <main class="main-content">
      <router-view/>
    </main>
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

#app {
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #2c3e50;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.nav-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-exact-active {
  background-color: #42b983;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f5f5f5;
}
</style>
