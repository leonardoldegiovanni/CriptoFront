<template>
  <div class="nuevo-cliente">
    <h1>Dar de Alta Nuevo Cliente</h1>
    
    <Form :validation-schema="schema" @submit="enviarDatosApi" id="formulario-cliente">
      
      <div class="form-group">
        <label>
          Nombre Completo:
          <Field v-model="datosCliente.name" type="text" name="name" id="name" placeholder="Ej: Carlos Guevara"/>
        </label>
        <ErrorMessage name="name" class="error-message"></ErrorMessage>
      </div>

      <div class="form-group">
        <label>
          Email:
          <Field v-model="datosCliente.email" type="email" name="email" id="email" placeholder="Ej: carlosguevara@gmail.com"/>
        </label>
        <ErrorMessage name="email" class="error-message"></ErrorMessage>
      </div>

      <div class="form-group">
        <input type="submit" value="Registrar Cliente" class="submit-button"/>
      </div>
    </Form>

    <div v-if="mensaje" class="mensaje" :class="tipoMensaje">
      {{ mensaje }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';

let schema = {
  name: yup.string()
    .required('El nombre es obligatorio')                    
    .min(2, 'El nombre debe tener al menos 2 caracteres')  
    .max(100, 'El nombre no puede tener más de 100 caracteres'), 
  email: yup.string()
    .required('El email es obligatorio')                   
    .email('Debe ingresar un email válido')               
    .max(150, 'El email no puede tener más de 150 caracteres') 
}

let datosCliente = ref({
  name: '',  
  email: ''    
});

let mensaje = ref('');
let tipoMensaje = ref('');

async function enviarDatosApi() {
  mensaje.value = '';
  
  try {
    let datosParaEnviar = {
      name: datosCliente.value.name.trim(),                    
      email: datosCliente.value.email.trim().toLowerCase()  
    };
    
    let response = await fetch('https://localhost:7143/api/Client', {
      method: 'POST',
      body: JSON.stringify(datosParaEnviar),    
      headers: {
        'Content-Type': 'application/json'     
      }
    });
    
    if (response.ok) {
      await response.json();
      
      mensaje.value = `Cliente registrado correctamente: ${datosParaEnviar.name}`;
      tipoMensaje.value = 'success';
      
      datosCliente.value = {
        name: '',
        email: ''
      };
    } else {
      let errorData = await response.text();
      mensaje.value = `Error al registrar el cliente: ${errorData}`;
      tipoMensaje.value = 'error';
    }
    
  } catch (error) {
    console.error('Error:', error);
    mensaje.value = `Error de conexión: ${error.message}`;
    tipoMensaje.value = 'error';
  }
}
</script>

<style scoped>
.nuevo-cliente {
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
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.submit-button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.submit-button:hover {
  background-color: #369870;
}

.mensaje {
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
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
  font-size: 14px;
  margin-top: 5px;
}
</style>
