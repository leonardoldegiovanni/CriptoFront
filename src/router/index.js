import { createRouter, createWebHistory } from "vue-router"
import Home from "../views/Home.vue"
import NuevaCompra from "../views/NuevaCompra.vue"
import NuevaVenta from "../views/NuevaVenta.vue"
import NuevoCliente from "../views/NuevoCliente.vue"
import HistorialMovimientos from "../views/HistorialMovimientos.vue"
import VerTransaccion from "../views/VerTransaccion.vue"
import EditarTransaccion from "../views/EditarTransaccion.vue"

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
    path: "/nueva-venta",
    name: "NuevaVenta",
    component: NuevaVenta,
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
  {
    path: "/transaccion/:id",
    name: "VerTransaccion",
    component: VerTransaccion,
  },
  {
    path: "/transaccion/:id/editar",
    name: "EditarTransaccion",
    component: EditarTransaccion,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
