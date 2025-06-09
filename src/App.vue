<template>
  <div id="app">
    <nav>
      <router-link to="/">Inicio</router-link> |
      <router-link to="/nueva-compra">Nueva Compra</router-link> |
      <router-link to="/nuevo-cliente">Nuevo Cliente</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<script setup>
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  margin: 20px;
}

nav {
  padding: 20px 0;
  border-bottom: 1px solid #ccc;
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin-right: 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
