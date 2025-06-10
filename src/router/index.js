import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/Home.vue"
import NuevaCompra from "../views/NuevaCompra.vue"
import NuevoCliente from "../views/NuevoCliente.vue"
import HistorialMovimientos from "../views/HistorialMovimientos.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/nueva-compra",
    name: "NuevaCompra",
    component: NuevaCompra,
  },
  {
    path: "/nuevo-cliente",
    name: "NuevoCliente",
    component: NuevoCliente,
  },
  {
    path: "/historial-movimientos",
    name: "HistorialMovimientos",
    component: HistorialMovimientos,    
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
