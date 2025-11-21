<template>
  <div class="home">
    <h1>Sistema de Gestión de Criptomonedas</h1>
    
    <div class="cards-container">
      <div class="card" @click="$router.push('/nueva-compra')">
        <div class="card-icon">📈</div>
        <h2>Nueva Compra</h2>
        <p>Registrar la compra de criptomonedas</p>
      </div>

      <div class="card" @click="$router.push('/nueva-venta')">
        <div class="card-icon">📉</div>
        <h2>Nueva Venta</h2>
        <p>Registrar la venta de criptomonedas</p>
      </div>

      <div class="card" @click="$router.push('/nuevo-cliente')">
        <div class="card-icon">👤</div>
        <h2>Nuevo Cliente</h2>
        <p>Dar de alta un nuevo cliente</p>
      </div>

      <div class="card" @click="$router.push('/historial-movimientos')">
        <div class="card-icon">📊</div>
        <h2>Historial</h2>
        <p>Ver todas las transacciones</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 3rem;
  font-size: 2.5rem;
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.card p {
  color: #666;
  font-size: 1rem;
}
</style>
