import { productos, agregarAlCarrito, } from "../componentes/script.js";


export function mostrarModal(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  document.getElementById('modalProductoLabel').textContent = producto.title;
  document.getElementById('modalImg').src = producto.image;
  document.getElementById('modalImg').alt = producto.title;
  document.getElementById('modalDescription').textContent = producto.description;
  document.getElementById('modalPrice').textContent = producto.price;

  const modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
  const btnAgregar = document.getElementById('btnAgregarModal');
  btnAgregar.onclick = () => {
    agregarAlCarrito(id);
    modalProducto.hide();
  };

  modalProducto.show();
}