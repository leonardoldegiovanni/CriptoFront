<template>
  <div class="movimientos-cripto">
    <h1>Movimientos</h1>

    <div class="filtro">
      <label for="clienteSelect">Cliente:</label>
      <select v-model="clienteSeleccionado" id="clienteSelect">
        <option value="">-- Seleccione --</option>
        <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
          {{ cliente.name }}
        </option>
      </select>
      <button @click="obtenerTransacciones" :disabled="!clienteSeleccionado || cargando">
        {{ cargando ? 'Buscando...' : 'Buscar' }}
      </button>
    </div>

    <div v-if="cargando">Cargando...</div>

    <table v-if="transacciones.length > 0" class="tabla-datos">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Tipo</th>
          <th>Cripto</th>
          <th>Cantidad</th>
          <th>Monto (ARS)</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tx in transacciones" :key="tx.id">
          <td>{{ new Date(tx.datetime).toLocaleDateString('es-AR') }}</td>
          <td>{{ tx.action === 'purchase' ? 'Compra' : 'Venta' }}</td>
          <td>{{ tx.cryptoCode }}</td>
          <td>{{ tx.cryptoAmount }}</td>
          <td>${{ typeof tx.money === 'number' ? tx.money.toFixed(2) : 'N/A' }}</td>
          <td>
            <button @click="verTransaccion(tx)">Ver</button>
            <button @click="eliminarTransaccion(tx.id)" class="btn-eliminar">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!cargando && transacciones.length === 0 && clienteSeleccionado">
      No se encontraron transacciones.
    </div>
    
    <div v-if="transaccionSeleccionadaParaVer" class="modal-detalle">
      <div class="modal-contenido">
        <h2>Detalle Transacción</h2>
        <p><strong>ID:</strong> {{ transaccionSeleccionadaParaVer.id }}</p>
        <p><strong>Fecha:</strong> {{ new Date(transaccionSeleccionadaParaVer.datetime).toLocaleString('es-AR') }}</p>
        <p><strong>Tipo:</strong> {{ transaccionSeleccionadaParaVer.action === 'purchase' ? 'Compra' : 'Venta' }}</p>
        <p><strong>Criptomoneda:</strong> {{ transaccionSeleccionadaParaVer.cryptoCode }}</p>
        <p><strong>Cantidad:</strong> {{ transaccionSeleccionadaParaVer.cryptoAmount }}</p>
        <p><strong>Monto (ARS):</strong> ${{ typeof transaccionSeleccionadaParaVer.money === 'number' ? transaccionSeleccionadaParaVer.money.toFixed(2) : 'N/A' }}</p>
        <button @click="transaccionSeleccionadaParaVer = null">Cerrar</button>
      </div>
    </div>

    <div v-if="mensajeError" class="mensaje-error">{{ mensajeError }}</div>
    <div v-if="mensajeExito" class="mensaje-exito">{{ mensajeExito }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';


const clientes = ref([]);
const clienteSeleccionado = ref('');
const transacciones = ref([]);
const cargando = ref(false);
const transaccionSeleccionadaParaVer = ref(null);
const mensajeError = ref('');
const mensajeExito = ref('');


async function llamarAPI(url, opciones = {}) {
  const response = await fetch(url, opciones);
  if (!response.ok) {
    throw new Error(`Error de red: ${response.status}`);
  }
  return response.json();
}

onMounted(async () => {
  try {
    clientes.value = await llamarAPI('https://localhost:7143/api/Client');
  } catch (error) {
    mensajeError.value = 'No se pudo cargar la lista de clientes.';
    console.error('Detalle del error al cargar clientes:', error);
  }
});

async function obtenerTransacciones() {
  mensajeError.value = '';
  mensajeExito.value = '';
  transacciones.value = [];

  if (!clienteSeleccionado.value) {
    mensajeError.value = 'Por favor, seleccione un cliente.';
    return;
  }

  cargando.value = true;
  try {
    const url = `https://localhost:7143/api/Transaction/client/${clienteSeleccionado.value}`;
    transacciones.value = await llamarAPI(url);
  } catch (error) {
    mensajeError.value = 'Error al obtener las transacciones.';
    console.error('Detalle del error al obtener transacciones:', error);
  } finally {
    cargando.value = false;
  }
}

function verTransaccion(tx) {
  transaccionSeleccionadaParaVer.value = tx;
}

async function eliminarTransaccion(id) {
  if (!confirm('¿Eliminar esta transacción?')) return;
  mensajeError.value = '';
  mensajeExito.value = '';

  try {
    const response = await fetch(`https://localhost:7143/api/Transaction/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    transacciones.value = transacciones.value.filter(tx => tx.id !== id);
    mensajeExito.value = 'Transacción eliminada.';
    setTimeout(() => { mensajeExito.value = ''; }, 3000);

  } catch (error) {
    mensajeError.value = 'No se pudo eliminar la transacción.';
    console.error('Detalle del error al eliminar:', error); 
  }
}
</script>

<style scoped>

.movimientos-cripto {
  padding: 10px;
}
.filtro {
  margin-bottom: 15px;
}
.filtro label, .filtro select, .filtro button {
  margin-right: 5px;
}
select, button {
  padding: 5px 8px;
  border: 1px solid #999;
}
button {
  background-color: #f0f0f0;
  cursor: pointer;
}
button:hover:not(:disabled) {
  background-color: #ddd;
}
button:disabled {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}
.btn-eliminar {
  background-color: #ffe0e0;
}
.btn-eliminar:hover:not(:disabled) {
  background-color: #ffc0c0;
}
.tabla-datos {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.tabla-datos th, .tabla-datos td {
  border: 1px solid #ccc;
  padding: 6px;
  text-align: left;
  color: #000000;
}
.tabla-datos th {
  background-color: #f0f0f0;
  font-weight: bold;
}
.mensaje-error, .mensaje-exito {
  margin-top: 10px;
  padding: 8px;
  border: 1px solid;
}
.mensaje-error {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
.mensaje-exito {
  color: #155724;
  background-color: #d4edda;
  border-color: #c3e6cb;
}
.modal-detalle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-contenido {
  background-color: #fff;
  padding: 20px;
  border: 1px solid #666;
  min-width: 300px;
}
.modal-contenido h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2em;
}
.modal-contenido p {
  margin: 5px 0;
  color: #000000;
}
.modal-contenido button {
  margin-top: 15px;
  display: block;
}
</style>