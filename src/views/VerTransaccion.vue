<template>
  <div class="ver-transaccion">
    <div class="header">
      <h1>Detalle de Transacción</h1>
      <button @click="volver" class="btn-volver">Volver al Historial</button>
    </div>

    <div v-if="cargando" class="mensaje-cargando">Cargando información...</div>

    <div v-if="!cargando && transaccion" class="detalle-card">
      <div class="detalle-header">
        <h2>Transacción #{{ transaccion.id }}</h2>
        <span class="badge" :class="transaccion.action === 'purchase' ? 'badge-compra' : 'badge-venta'">
          {{ transaccion.action === 'purchase' ? 'Compra' : 'Venta' }}
        </span>
      </div>

      <div class="detalle-contenido">
        <div class="detalle-item">
          <span class="detalle-label">Cliente:</span>
          <span class="detalle-valor">{{ nombreCliente }}</span>
        </div>

        <div class="detalle-item">
          <span class="detalle-label">Criptomoneda:</span>
          <span class="detalle-valor">{{ transaccion.cryptoCode }}</span>
        </div>

        <div class="detalle-item">
          <span class="detalle-label">Cantidad:</span>
          <span class="detalle-valor">{{ formatearCantidad(transaccion.cryptoAmount) }}</span>
        </div>

        <div class="detalle-item">
          <span class="detalle-label">Monto (ARS):</span>
          <span class="detalle-valor monto">{{ formatearMonto(transaccion.money) }}</span>
        </div>

        <div class="detalle-item">
          <span class="detalle-label">Fecha y Hora:</span>
          <span class="detalle-valor">{{ formatearFecha(transaccion.datetime) }}</span>
        </div>
      </div>

      <div class="acciones">
        <button @click="editar" class="btn btn-editar">Editar Transacción</button>
        <button @click="confirmarBorrado" class="btn btn-borrar">Eliminar Transacción</button>
      </div>
    </div>

    <div v-if="!cargando && !transaccion" class="mensaje-error">
      No se pudo cargar la información de la transacción.
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal" @click.stop>
        <h2>Confirmar Eliminación</h2>
        <p>¿Está seguro que desea eliminar esta transacción? Esta acción no se puede deshacer.</p>
        <div class="modal-acciones">
          <button @click="cerrarModal" class="btn btn-cancelar">Cancelar</button>
          <button @click="borrar" class="btn btn-confirmar">Confirmar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const transaccion = ref(null);
const nombreCliente = ref('');
const cargando = ref(true);
const mostrarModal = ref(false);

onMounted(() => {
  cargarTransaccion();
});

async function cargarTransaccion() {
  try {
    const id = route.params.id;
    const response = await fetch(`https://localhost:7143/api/Transaction/${id}`);
    
    if (response.ok) {
      transaccion.value = await response.json();
      await cargarCliente(transaccion.value.clientId);
    }
  } catch (error) {
    console.error('Error al cargar transacción:', error);
  } finally {
    cargando.value = false;
  }
}

async function cargarCliente(clientId) {
  try {
    const response = await fetch(`https://localhost:7143/api/Client/${clientId}`);
    if (response.ok) {
      const cliente = await response.json();
      nombreCliente.value = cliente.name;
    }
  } catch (error) {
    console.error('Error al cargar cliente:', error);
    nombreCliente.value = 'Desconocido';
  }
}

function formatearCantidad(cantidad) {
  return cantidad.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
}

function formatearMonto(monto) {
  return `$${monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function volver() {
  router.push('/historial-movimientos');
}

function editar() {
  router.push(`/transaccion/${route.params.id}/editar`);
}

function confirmarBorrado() {
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
}

async function borrar() {
  try {
    const response = await fetch(`https://localhost:7143/api/Transaction/${route.params.id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      router.push('/historial-movimientos');
    } else {
      throw new Error('Error al eliminar');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al eliminar la transacción');
    cerrarModal();
  }
}
</script>

<style scoped>
.ver-transaccion {
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

h1 {
  color: #2c3e50;
  margin: 0;
}

.btn-volver {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-volver:hover {
  background-color: #5a6268;
}

.mensaje-cargando,
.mensaje-error {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

.detalle-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem;
}

.detalle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  margin-bottom: 1.5rem;
}

.detalle-header h2 {
  margin: 0;
  color: #2c3e50;
}

.badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: 600;
}

.badge-compra {
  background-color: #d4edda;
  color: #155724;
}

.badge-venta {
  background-color: #fff3cd;
  color: #856404;
}

.detalle-contenido {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.detalle-label {
  font-weight: 600;
  color: #555;
  font-size: 1.1rem;
}

.detalle-valor {
  font-size: 1.1rem;
  color: #2c3e50;
}

.detalle-valor.monto {
  font-weight: bold;
  color: #42b983;
  font-size: 1.3rem;
}

.acciones {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid #eee;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-editar {
  background-color: #ffc107;
  color: #333;
}

.btn-editar:hover {
  background-color: #e0a800;
}

.btn-borrar {
  background-color: #dc3545;
  color: white;
}

.btn-borrar:hover {
  background-color: #c82333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.modal-acciones {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-confirmar {
  background-color: #dc3545;
  color: white;
}

.btn-confirmar:hover {
  background-color: #c82333;
}
</style>
