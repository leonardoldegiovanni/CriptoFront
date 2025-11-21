<template>
  <div class="historial-movimientos">
    <h1>Historial de Movimientos</h1>

    <div class="filtros">
      <div class="form-group">
        <label for="cliente-select">Seleccionar Cliente:</label>
        <select v-model="clienteSeleccionado" id="cliente-select">
          <option value="">Todos los clientes</option>
          <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
            {{ cliente.name }}
          </option>
        </select>
      </div>
      <button @click="cargarTransacciones" class="btn-buscar">Buscar Transacciones</button>
    </div>

    <div v-if="cargando" class="mensaje-cargando">Cargando transacciones...</div>

    <div v-if="!cargando && transacciones.length === 0 && buscado" class="mensaje-vacio">
      No se encontraron transacciones para este cliente.
    </div>

    <div v-if="!cargando && transacciones.length > 0" class="tabla-container">
      <table class="tabla-transacciones">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Cripto</th>
            <th>Acción</th>
            <th>Cantidad</th>
            <th>Monto (ARS)</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaccion in transacciones" :key="transaccion.id">
            <td>{{ transaccion.id }}</td>
            <td>{{ obtenerNombreCliente(transaccion.clientId) }}</td>
            <td>{{ transaccion.cryptoCode }}</td>
            <td>
              <span class="badge" :class="transaccion.action === 'purchase' ? 'badge-compra' : 'badge-venta'">
                {{ transaccion.action === 'purchase' ? 'Compra' : 'Venta' }}
              </span>
            </td>
            <td>{{ formatearCantidad(transaccion.cryptoAmount) }}</td>
            <td>{{ formatearMonto(transaccion.money) }}</td>
            <td>{{ formatearFecha(transaccion.datetime) }}</td>
            <td class="acciones">
              <button @click="verTransaccion(transaccion.id)" class="btn btn-ver">Ver</button>
              <button @click="editarTransaccion(transaccion.id)" class="btn btn-editar">Editar</button>
              <button @click="confirmarBorrado(transaccion)" class="btn btn-borrar">Borrar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal" @click.stop>
        <h2>Confirmar Eliminación</h2>
        <p>¿Está seguro que desea eliminar esta transacción?</p>
        <div class="modal-info">
          <p><strong>Cliente:</strong> {{ obtenerNombreCliente(transaccionABorrar?.clientId) }}</p>
          <p><strong>Cripto:</strong> {{ transaccionABorrar?.cryptoCode }}</p>
          <p><strong>Acción:</strong> {{ transaccionABorrar?.action === 'purchase' ? 'Compra' : 'Venta' }}</p>
          <p><strong>Cantidad:</strong> {{ formatearCantidad(transaccionABorrar?.cryptoAmount) }}</p>
        </div>
        <div class="modal-acciones">
          <button @click="cerrarModal" class="btn btn-cancelar">Cancelar</button>
          <button @click="borrarTransaccion" class="btn btn-confirmar">Confirmar</button>
        </div>
      </div>
    </div>

    <div v-if="mensaje" class="mensaje" :class="tipoMensaje">
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const clientes = ref([]);
const transacciones = ref([]);
const clienteSeleccionado = ref('');
const cargando = ref(false);
const buscado = ref(false);
const mostrarModal = ref(false);
const transaccionABorrar = ref(null);
const mensaje = ref('');
const tipoMensaje = ref('');

onMounted(() => {
  cargarClientes();
});

async function cargarClientes() {
  try {
    const response = await fetch('https://localhost:7143/api/Client');
    if (response.ok) {
      clientes.value = await response.json();
      console.log('[v0] Clientes cargados:', clientes.value);
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
}

async function cargarTransacciones() {
  cargando.value = true;
  buscado.value = true;
  mensaje.value = '';
  
  try {
    let url = 'https://localhost:7143/api/Transaction';
    
    if (clienteSeleccionado.value) {
      url += `?clientId=${clienteSeleccionado.value}`;
    }
    
    const response = await fetch(url);
    if (response.ok) {
      transacciones.value = await response.json();
      console.log('[v0] Transacciones cargadas:', transacciones.value);
    } else {
      throw new Error('Error al cargar transacciones');
    }
  } catch (error) {
    console.error('Error:', error);
    mensaje.value = 'Error al cargar las transacciones';
    tipoMensaje.value = 'error';
  } finally {
    cargando.value = false;
  }
}

function obtenerNombreCliente(transaccionClientId) {
  console.log('[v0] Buscando cliente con ID:', transaccionClientId);
  console.log('[v0] Lista de clientes disponibles:', clientes.value.map(c => ({ id: c.id, name: c.name })));
  
  const cliente = clientes.value.find(c => c.id === transaccionClientId);
  
  if (cliente) {
    console.log('[v0] Cliente encontrado:', cliente);
    return cliente.name;
  }
  
  console.log('[v0] Cliente no encontrado para ID:', transaccionClientId);
  return 'Desconocido';
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
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function verTransaccion(id) {
  router.push(`/transaccion/${id}`);
}

function editarTransaccion(id) {
  router.push(`/transaccion/${id}/editar`);
}

function confirmarBorrado(transaccion) {
  transaccionABorrar.value = transaccion;
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
  transaccionABorrar.value = null;
}

async function borrarTransaccion() {
  if (!transaccionABorrar.value) return;

  try {
    const response = await fetch(`https://localhost:7143/api/Transaction/${transaccionABorrar.value.id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      mensaje.value = 'Transacción eliminada con éxito';
      tipoMensaje.value = 'success';
      cerrarModal();
      cargarTransacciones();
    } else {
      throw new Error('Error al eliminar la transacción');
    }
  } catch (error) {
    console.error('Error:', error);
    mensaje.value = 'Error al eliminar la transacción';
    tipoMensaje.value = 'error';
    cerrarModal();
  }
}
</script>

<style scoped>
.historial-movimientos {
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.filtros {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  color: #2c3e50;
  background-color: white;
}

select option {
  color: #2c3e50;
  padding: 0.5rem;
}

.btn-buscar {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-buscar:hover {
  background-color: #369870;
}

.mensaje-cargando,
.mensaje-vacio {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #2c3e50;
  font-weight: 500;
}

.tabla-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow-x: auto;
}

.tabla-transacciones {
  width: 100%;
  border-collapse: collapse;
}

.tabla-transacciones th,
.tabla-transacciones td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
}

.tabla-transacciones th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.tabla-transacciones tbody tr:hover {
  background-color: #f8f9fa;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
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

.acciones {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.3s;
}

.btn-ver {
  background-color: #007bff;
  color: white;
}

.btn-ver:hover {
  background-color: #0056b3;
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

.modal-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.modal-info p {
  margin: 0.5rem 0;
  color: #2c3e50;       
  font-size: 1rem;
}

.modal-info p strong {
  color: #1a252f;
  font-weight: 600;
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

.mensaje {
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  text-align: center;
}

.mensaje.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensaje.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
