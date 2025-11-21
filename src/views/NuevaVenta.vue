<template>
  <div class="nueva-venta">
    <h1>Dar de Alta Nueva Venta</h1>
    
    <Form :validation-schema="schema" @submit="enviarDatosApi" id="formulario-venta">
      
      <div class="form-group">
        <label>
          Criptomoneda:
          <Field as="select" v-model="datosVenta.crypto_code" name="crypto_code" id="crypto_code" @change="actualizarPrecio">
            <option value="">Seleccione una criptomoneda</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="USDC">USD Coin (USDC)</option>
          </Field>
        </label>
        <ErrorMessage name="crypto_code" class="error-message"></ErrorMessage>
      </div>

      <div class="form-group" v-if="precioActualFormateado">
        <label>
          Precio Actual (ARS):
          <input 
            type="text" 
            :value="precioActualFormateado" 
            readonly 
            class="precio-input"
          />
        </label>
        <small class="precio-info">Precio obtenido de CriptoYa API</small>
      </div>

      <div class="form-group">
        <label>
          Cantidad de Criptomoneda (mínimo 0.01):
          <Field 
            v-model="datosVenta.crypto_amount" 
            type="text" 
            name="crypto_amount" 
            id="crypto_amount" 
            placeholder="Ej: 0.01"
            @input="calcularTotal"
          />
        </label>
        <ErrorMessage name="crypto_amount" class="error-message"></ErrorMessage>
      </div>

      <div class="form-group" v-if="totalCalculadoFormateado">
        <label>
          Total Estimado (ARS):
          <input 
            type="text" 
            :value="totalCalculadoFormateado" 
            readonly 
            class="total-input"
          />
        </label>
      </div>

      <div class="form-group">
        <label>
          Cliente:
          <Field as="select" v-model="datosVenta.client_id" name="client_id" id="client_id">
            <option value="">Seleccione un cliente</option>
            <option v-for="cliente in clientes" :key="cliente.id" :value="cliente.id">
              {{ cliente.name }}
            </option>
          </Field>
        </label>
        <ErrorMessage name="client_id" class="error-message"></ErrorMessage>
      </div>

      <div class="form-group">
        <label>
          Fecha y Hora:
          <Field v-model="datosVenta.datetime" type="datetime-local" name="datetime" id="datetime"/>
        </label>
        <ErrorMessage name="datetime" class="error-message"></ErrorMessage>
      </div>

      <div class="form-group">
        <input type="submit" value="Registrar Venta" class="submit-button"/>
      </div>
    </Form>

    <div v-if="mensaje" class="mensaje" :class="tipoMensaje">
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

const datosVenta = ref({
  crypto_code: '',
  action: 'sale',
  client_id: '',
  crypto_amount: '',
  datetime: ''
});

const clientes = ref([]);
const precioActualNumerico = ref(0);
const precioActualFormateado = ref('');
const totalCalculadoFormateado = ref('');
const mensaje = ref('');
const tipoMensaje = ref('');

const MIN_VALUE_FROM_BACKEND = 0.00001;

const schema = yup.object({
  crypto_code: yup.string().required('Debe seleccionar una criptomoneda'),
  crypto_amount: yup.number()
    .typeError('La cantidad debe ser un número')
    .required('La cantidad es obligatoria')
    .min(MIN_VALUE_FROM_BACKEND, `La cantidad debe ser al menos ${MIN_VALUE_FROM_BACKEND}`),
  client_id: yup.number().required('Debe seleccionar un cliente'),
  datetime: yup.string().required('La fecha y hora son obligatorias')
});

async function actualizarPrecio() {
  const cryptoCode = datosVenta.value.crypto_code;
  if (!cryptoCode) {
    precioActualNumerico.value = 0;
    precioActualFormateado.value = '';
    totalCalculadoFormateado.value = '';
    return;
  }
  precioActualFormateado.value = 'Cargando...';
  totalCalculadoFormateado.value = '';

  try {
    const urlMap = {
      BTC: 'https://criptoya.com/api/bybit/BTC/ARS/0.1',
      ETH: 'https://criptoya.com/api/bybit/ETH/ARS',
      USDC: 'https://criptoya.com/api/bybit/USDC/ARS'
    };

    const url = urlMap[cryptoCode];
    if (!url) throw new Error('Criptomoneda no soportada');

    const response = await fetch(url);
    if (!response.ok) throw new Error('No se pudo obtener el precio');
    const data = await response.json();

    precioActualNumerico.value = data.totalBid;
    precioActualFormateado.value = `$${data.totalBid.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    calcularTotal();
  } catch (error) {
    console.error('Error al obtener precio:', error);
    precioActualNumerico.value = 0;
    precioActualFormateado.value = 'Error al obtener precio';
    totalCalculadoFormateado.value = '';
  }
}

function calcularTotal() {
  const cantidad = parseFloat(datosVenta.value.crypto_amount);
  const precio = precioActualNumerico.value;

  if (!isNaN(cantidad) && cantidad >= MIN_VALUE_FROM_BACKEND && precio > 0) {
    const total = cantidad * precio;
    const decimales = total >= MIN_VALUE_FROM_BACKEND ? 2 : 8;
    totalCalculadoFormateado.value = `$${total.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimales
    })}`;
  } else {
    totalCalculadoFormateado.value = '';
  }
}

async function enviarDatosApi() {
  mensaje.value = '';
  try {
    const cantidad = parseFloat(datosVenta.value.crypto_amount);
    const montoTotal = cantidad * precioActualNumerico.value;

    if (isNaN(cantidad) || cantidad < MIN_VALUE_FROM_BACKEND) {
      mensaje.value = `Error: La cantidad ingresada debe ser un número igual o mayor a ${MIN_VALUE_FROM_BACKEND}.`;
      tipoMensaje.value = 'error';
      return;
    }

    if (montoTotal < MIN_VALUE_FROM_BACKEND) {
      mensaje.value = `Error: El monto total calculado es menor al mínimo requerido.`;
      tipoMensaje.value = 'error';
      return;
    }

    const datosParaEnviar = {
      CryptoCode: datosVenta.value.crypto_code,
      Action: 'sale',
      ClientId: parseInt(datosVenta.value.client_id),
      CryptoAmount: cantidad,
      Money: montoTotal,
      Datetime: new Date(datosVenta.value.datetime).toISOString()
    };

    const response = await fetch('https://localhost:7143/api/Transaction/', {
      method: 'POST',
      body: JSON.stringify(datosParaEnviar),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      mensaje.value = '¡Venta registrada con éxito!';
      tipoMensaje.value = 'success';
      datosVenta.value = {
        crypto_code: '',
        action: 'sale',
        client_id: '',
        crypto_amount: '',
        datetime: new Date().toISOString().slice(0, 16)
      };
      precioActualFormateado.value = '';
      totalCalculadoFormateado.value = '';
    } else {
      const errorTexto = await response.text();
      throw new Error(errorTexto);
    }
  } catch (error) {
    console.error('Error:', error);
    mensaje.value = `Error al registrar la venta: ${error.message}`;
    tipoMensaje.value = 'error';
  }
}

async function cargarClientes() {
  try {
    const response = await fetch('https://localhost:7143/api/Client');
    if (response.ok) {
      clientes.value = await response.json();
    }
  } catch (error) {
    console.error('Error al cargar clientes:', error);
  }
}

onMounted(() => {
  datosVenta.value.datetime = new Date().toISOString().slice(0, 16);
  cargarClientes();
});
</script>

<style scoped>
.nueva-venta {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.precio-input, .total-input {
  background-color: #f1f1f1;
  font-weight: bold;
}

.precio-info {
  font-size: 0.8rem;
  color: #777;
}

.submit-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-button:hover {
  background-color: #369870;
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

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
