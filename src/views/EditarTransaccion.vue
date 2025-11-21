<template>
  <div class="editar-transaccion">
    <div class="header">
      <h1>Editar Transacción</h1>
      <button @click="volver" class="btn-volver">Cancelar</button>
    </div>

    <div v-if="cargando" class="mensaje-cargando">Cargando información...</div>

    <div v-if="!cargando && transaccion" class="formulario-card">
      <Form :validation-schema="schema" @submit="actualizarTransaccion">
        
        <div class="form-group">
          <label>
            Criptomoneda:
            <Field as="select" v-model="transaccion.crypto_code" name="crypto_code">
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="USDC">USD Coin (USDC)</option>
            </Field>
          </label>
          <ErrorMessage name="crypto_code" class="error-message"></ErrorMessage>
        </div>

        <div class="form-group">
          <label>
            Tipo de Operación:
            <Field as="select" v-model="transaccion.action" name="action">
              <option value="purchase">Compra</option>
              <option value="sale">Venta</option>
            </Field>
          </label>
          <ErrorMessage name="action" class="error-message"></ErrorMessage>
        </div>

        <div class="form-group">
          <label>
            Cantidad de Criptomoneda:
            <Field 
              v-model="transaccion.crypto_amount" 
              type="text" 
              name="crypto_amount"
              placeholder="Ej: 0.01"
            />
          </label>
          <ErrorMessage name="crypto_amount" class="error-message"></ErrorMessage>
        </div>

        <div class="form-group">
          <label>
            Monto (ARS):
            <Field 
              v-model="transaccion.money" 
              type="text" 
              name="money"
              placeholder="Ej: 1000.00"
            />
          </label>
          <ErrorMessage name="money" class="error-message"></ErrorMessage>
        </div>

        <div class="form-group">
          <label>
            Cliente:
            <Field as="select" v-model="transaccion.client_id" name="client_id">
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
            <Field v-model="transaccion.datetime" type="datetime-local" name="datetime"/>
          </label>
          <ErrorMessage name="datetime" class="error-message"></ErrorMessage>
        </div>

        <div class="acciones">
          <button type="button" @click="volver" class="btn btn-cancelar">Cancelar</button>
          <button type="submit" class="btn btn-guardar">Guardar Cambios</button>
        </div>
      </Form>

      <div v-if="mensaje" class="mensaje" :class="tipoMensaje">
        {{ mensaje }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

const router = useRouter();
const route = useRoute();

const transaccion = ref(null);
const clientes = ref([]);
const cargando = ref(true);
const mensaje = ref('');
const tipoMensaje = ref('');

const MIN_VALUE = 0.00001;

const schema = yup.object({
  crypto_code: yup.string().required('Debe seleccionar una criptomoneda'),
  action: yup.string().required('Debe seleccionar el tipo de operación'),
  crypto_amount: yup.number()
    .typeError('La cantidad debe ser un número')
    .required('La cantidad es obligatoria')
    .min(MIN_VALUE, `La cantidad debe ser al menos ${MIN_VALUE}`),
  money: yup.number()
    .typeError('El monto debe ser un número')
    .required('El monto es obligatorio')
    .min(MIN_VALUE, `El monto debe ser al menos ${MIN_VALUE}`),
  client_id: yup.number().required('Debe seleccionar un cliente'),
  datetime: yup.string().required('La fecha y hora son obligatorias')
});

async function cargarTransaccion() {
  try {
    const id = route.params.id;
    const response = await fetch(`https://localhost:7143/api/Transaction/${id}`);
    
    if (response.ok) {
      const data = await response.json();
      transaccion.value = {
        crypto_code: data.cryptoCode,
        action: data.action,
        crypto_amount: data.cryptoAmount,
        money: data.money,
        client_id: data.clientId,
        datetime: new Date(data.datetime).toISOString().slice(0, 16)
      };
    }
  } catch (error) {
    console.error('Error al cargar transacción:', error);
  } finally {
    cargando.value = false;
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

async function actualizarTransaccion() {
  mensaje.value = '';
  
  try {
    const datosParaEnviar = {
      Id:parseInt(route.params.id),
      CryptoCode: transaccion.value.crypto_code,
      Action: transaccion.value.action,
      ClientId: parseInt(transaccion.value.client_id),
      CryptoAmount: parseFloat(transaccion.value.crypto_amount),
      Money: parseFloat(transaccion.value.money),
      Datetime: new Date(transaccion.value.datetime).toISOString()
    };

    const response = await fetch(`https://localhost:7143/api/Transaction/${route.params.id}`, {
      method: 'PUT',
      body: JSON.stringify(datosParaEnviar),
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.ok) {
      mensaje.value = '¡Transacción actualizada con éxito!';
      tipoMensaje.value = 'success';
      
      setTimeout(() => {
        router.push(`/transaccion/${route.params.id}`);
      }, 1500);
    } else {
      const errorTexto = await response.text();
      throw new Error(errorTexto);
    }
  } catch (error) {
    console.error('Error:', error);
    mensaje.value = `Error al actualizar la transacción: ${error.message}`;
    tipoMensaje.value = 'error';
  }
}

function volver() {
  router.push(`/transaccion/${route.params.id}`);
}

onMounted(() => {
  cargarClientes();
  cargarTransaccion();
});
</script>

<style scoped>
.editar-transaccion {
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

.mensaje-cargando {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

.formulario-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem;
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

input:focus, select:focus {
  border-color: #42b983;
  outline: none;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.acciones {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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

.btn-cancelar {
  background-color: #6c757d;
  color: white;
}

.btn-cancelar:hover {
  background-color: #5a6268;
}

.btn-guardar {
  background-color: #42b983;
  color: white;
}

.btn-guardar:hover {
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
</style>
