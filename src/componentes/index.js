import { mostrarModal } from "../componentes/modal.js";
import { agregarAlCarrito, vaciarCarrito, finalizarCompra, filtrarPorCategoria, 
    mostrarTodosProductos, aumentarCantidad, disminuirCantidad, eliminarDelCarrito} from "../componentes/script.js";

// // Hacer las funciones globales
window.mostrarModal = mostrarModal;
window.agregarAlCarrito = agregarAlCarrito;
window.aumentarCantidad = aumentarCantidad;
window.disminuirCantidad = disminuirCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.finalizarCompra = finalizarCompra;
window.filtrarPorCategoria = filtrarPorCategoria;
window.mostrarTodosProductos = mostrarTodosProductos;