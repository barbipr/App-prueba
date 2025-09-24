import { getProducts } from "../service/api.js";

const contenedor = document.getElementById("productos");
const cartCount = document.getElementById("cart-count");
const verCarritoBtn = document.getElementById("ver-carrito");
const modalCarrito = new bootstrap.Modal(document.getElementById('modalCarrito'));
const modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));

export let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
export let productos = [];
let categorias = [];
let categoriaActual = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarCarrito();

  verCarritoBtn.addEventListener('click', mostrarCarrito);

  const searchForm = document.querySelector('form[role="search"]');
  const searchInput = document.querySelector('input[type="search"]');

  // Búsqueda al enviar el formulario
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    buscarProductos(searchInput.value);
  });

  // Búsqueda en tiempo real mientras escribe
  searchInput.addEventListener('input', (e) => {
    buscarProductos(e.target.value);
  });
});

async function cargarProductos() {
  try {
    productos = await getProducts();
    cargarCategorias();
    mostrarProductos(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
    Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
  }
}

export function cargarCategorias() {
  categorias = [...new Set(productos.map(producto => producto.category))];
  
  const categoriasMenu = document.getElementById('categorias-menu');
  categoriasMenu.innerHTML = '';
  
  // Agregar opción para mostrar todos los productos
  const todosList = document.createElement('li');
  todosList.innerHTML = '<a class="dropdown-item" href="#" onclick="mostrarTodosProductos()">Todos los productos</a>';
  categoriasMenu.appendChild(todosList);
  
  const divider = document.createElement('li');
  divider.innerHTML = '<hr class="dropdown-divider">';
  categoriasMenu.appendChild(divider);
  
  // Agregar cada categoría
  categorias.forEach(categoria => {
    const li = document.createElement('li');
    const categoriaFormateada = formatearCategoria(categoria);
    li.innerHTML = `<a class="dropdown-item" href="#" onclick="filtrarPorCategoria('${categoria.replace(/'/g, "\\'")}')">${categoriaFormateada}</a>`;
    categoriasMenu.appendChild(li);
  });
}

export function formatearCategoria(categoria) {
  return categoria
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function filtrarPorCategoria(categoria) {
  categoriaActual = categoria;
  const productosFiltrados = productos.filter(producto => producto.category === categoria);
  
  // Actualizar título y descripción
  const categoriaFormateada = formatearCategoria(categoria);
  document.getElementById('categoria-titulo').textContent = categoriaFormateada;
  document.getElementById('categoria-descripcion').textContent = 
    `${productosFiltrados.length} productos encontrados en esta categoría`;
  
  mostrarProductos(productosFiltrados);
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function mostrarTodosProductos() {
  categoriaActual = null;
  document.getElementById('categoria-titulo').textContent = 'Todos los productos';
  document.getElementById('categoria-descripcion').textContent = 
    `${productos.length} productos disponibles`;
  
  mostrarProductos(productos);
  
  // Scroll al inicio
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function mostrarProductos(productosArray) {
  contenedor.innerHTML = '';

  productosArray.forEach(producto => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-4";

    col.innerHTML = `
      <div class="card h-100">
        <img src="${producto.image}" class="card-img-top p-3" alt="${producto.title}" style="height: 300px; object-fit: contain;" />
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${producto.title}</h5>
          <p class="card-text fw-bold">$${producto.price}</p>
          <p class="card-text text-muted">${producto.description.substring(0, 100)}...</p>
          <div class="mt-auto">
            <button class="btn btn-outline-primary mb-2 w-100" onclick="mostrarModal(${producto.id})">Ver más</button>
            <button class="btn btn-add w-100" onclick="agregarAlCarrito(${producto.id})">Agregar al carrito</button>
          </div>
        </div>
      </div>
    `;

    contenedor.appendChild(col);
  });
}

export function agregarAlCarrito(id) {
  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  const itemExistente = carrito.find(item => item.id === id);

  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      title: producto.title,
      price: producto.price,
      image: producto.image,
      cantidad: 1
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();

}


export function actualizarCarrito() {
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
  cartCount.textContent = totalItems;
}

export function mostrarCarrito() {
  const carritoContenido = document.getElementById('carrito-contenido');
  const carritoTotal = document.getElementById('carrito-total');

  if (carrito.length === 0) {
    carritoContenido.innerHTML = '<p class="text-center">Tu carrito está vacío</p>';
    carritoTotal.textContent = '0.00';
  } else {
    let html = '';
    let total = 0;

    carrito.forEach(item => {
      const subtotal = item.price * item.cantidad;
      total += subtotal;

      html += `
        <div class="row align-items-center border-bottom py-2">
          <div class="col-3">
            <img src="${item.image}" class="img-fluid" style="max-height: 80px;" alt="${item.title}">
          </div>
          <div class="col-4">
            <h6>${item.title}</h6>
            <small class="text-muted">$${item.price}</small>
          </div>
          <div class="col-3">
            <div class="d-flex align-items-center">
              <button class="btn btn-sm btn-outline-secondary" onclick="disminuirCantidad(${item.id})" ${item.cantidad === 1 ? 'disabled' : ''}>-</button>
              <span class="mx-2">${item.cantidad}</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="aumentarCantidad(${item.id})">+</button>
            </div>
          </div>
          <div class="col-2">
            <div class="text-end">
              <div class="fw-bold">$${subtotal.toFixed(2)}</div>
              <button class="btn btn-sm btn-outline-danger" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
            </div>
          </div>
        </div>
      `;
    });

    carritoContenido.innerHTML = html;
    carritoTotal.textContent = total.toFixed(2);
  }

  modalCarrito.show();
}

export function aumentarCantidad(id) {
  const item = carrito.find(item => item.id === id);
  if (item) {
    item.cantidad++;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
    mostrarCarrito();
  }
}

export function disminuirCantidad(id) {
  const item = carrito.find(item => item.id === id);
  if (item && item.cantidad > 1) {
    item.cantidad--;
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarCarrito();
    mostrarCarrito();
  }
}

export function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarCarrito();
  mostrarCarrito();

  Swal.fire({
    title: 'Producto eliminado',
    text: 'El producto se eliminó del carrito',
    icon: 'success',
    timer: 1500,
    showConfirmButton: false
  });
}

export function vaciarCarrito() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se eliminarán todos los productos del carrito',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      localStorage.removeItem("carrito");
      actualizarCarrito();
      modalCarrito.hide();

      Swal.fire({
        title: 'Carrito vacío',
        text: 'Todos los productos fueron eliminados',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

export function finalizarCompra() {
  if (carrito.length === 0) {
    Swal.fire('Carrito vacío', 'Agrega productos antes de finalizar la compra', 'warning');
    return;
  }

  Swal.fire({
    title: '¡Compra finalizada!',
    text: 'Gracias por tu compra. Tu pedido será procesado pronto.',
    icon: 'success',
    confirmButtonText: 'Continuar comprando'
  }).then(() => {
    carrito = [];
    localStorage.removeItem("carrito");
    actualizarCarrito();
    modalCarrito.hide();
  });
}



export function buscarProductos(termino) {
  // Si no hay término de búsqueda, mostrar productos según categoría actual
  if (!termino.trim()) {
    if (categoriaActual) {
      filtrarPorCategoria(categoriaActual);
    } else {
      mostrarTodosProductos();
    }
    return;
  }

  let productosBase = productos;
  if (categoriaActual) {
    productosBase = productos.filter(producto => producto.category === categoriaActual);
  }

  // Filtrar productos que coincidan con el término de búsqueda
  const terminoLower = termino.toLowerCase();
  const productosFiltrados = productosBase.filter(producto =>
    producto.title.toLowerCase().includes(terminoLower) ||
    producto.description.toLowerCase().includes(terminoLower) ||
    producto.category.toLowerCase().includes(terminoLower)
  );

  // Actualizar título con información de búsqueda
  let titulo = 'Resultados de búsqueda';
  if (categoriaActual) {
    titulo += ` en ${formatearCategoria(categoriaActual)}`;
  }
  document.getElementById('categoria-titulo').textContent = titulo;

  // Mostrar productos filtrados o mensaje de no encontrados
  if (productosFiltrados.length === 0) {
    document.getElementById('categoria-descripcion').textContent = 
      `No se encontraron productos para "${termino}"`;
    
    contenedor.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-info">
          <h4>🔍 No se encontraron productos</h4>
          <p>No hay productos que coincidan con "<strong>${termino}</strong>"</p>
          <small class="text-muted">Intenta con otros términos de búsqueda</small>
        </div>
      </div>
    `;
  } else {
    document.getElementById('categoria-descripcion').textContent = 
      `${productosFiltrados.length} productos encontrados para "${termino}"`;
    
    mostrarProductos(productosFiltrados);

    // Mostrar contador de resultados
    if (productosFiltrados.length < productosBase.length) {
      const contadorDiv = document.createElement('div');
      contadorDiv.className = 'col-12 mb-3';
      contadorDiv.innerHTML = `
        <div class="alert alert-success">
          <small>Se encontraron <strong>${productosFiltrados.length}</strong> productos para "<strong>${termino}</strong>"</small>
        </div>
      `;
      contenedor.insertBefore(contadorDiv, contenedor.firstChild);
    }
  }
}