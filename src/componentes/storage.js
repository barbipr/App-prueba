export function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// función para mostrar alerta desde storage
export function mostrarAlertaProducto(producto) {
  Swal.fire({
    title: 'Producto agregado',
    text: `${producto.title} se agregó al carrito`,
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  });
}
