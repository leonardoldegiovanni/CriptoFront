<template>
  <div class="nuevo-cliente">
    <h1>Dar de Alta Nuevo Cliente</h1>
    
    <Form :validation-schema="schema" @submit="enviarDatosApi" id="formulario-cliente">
      
      <div class="form-group">
        <label>
          Nombre Completo:
          <Field v-model="datosCliente.name" type="text" name="name" id="name" placeholder="Ej: Carlos Guevara"/>
        </label>
        <ErrorMessage name="name"></ErrorMessage>
      </div>

      <div class="form-group">
        <label>
          Email:
          <Field v-model="datosCliente.email" type="email" name="email" id="email" placeholder="Ej: carlosguevara@gmail.com"/>
        </label>
        <ErrorMessage name="email"></ErrorMessage>
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

// Variables reactivas para manejar mensajes de respuesta
let mensaje = ref('');      // Texto del mensaje a mostrar
let tipoMensaje = ref('');  // Tipo de mensaje ('success' o 'error')


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
/* Contenedor principal del formulario */
.nuevo-cliente {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

/* Espaciado entre grupos de campos del formulario */
.form-group {
  margin-bottom: 20px;
}

/* Estilo para las etiquetas de los campos */
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

/* Estilo para todos los inputs */
input {
  width: 100%;
  padding: 10px;
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
  width: auto;
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
