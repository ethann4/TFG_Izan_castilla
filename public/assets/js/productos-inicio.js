;(async () => {
  const interiorCarrusel = document.querySelector("[data-productos-inicio]");
  if (!interiorCarrusel) return;

  const escaparHtml = (valor) => window.CDPBackend?.escapeHtml(valor) || "";

  const mostrarMensaje = (mensaje) => {
    interiorCarrusel.innerHTML = `
      <div class="carousel-item active">
        <div class="mensaje-productos-inicio">${escaparHtml(mensaje)}</div>
      </div>
    `;
  };

  const renderizarProducto = (producto) => {
    const imagen = producto.gallery[0] || "assets/img/logo_cdp_transparente.png";
    return `
      <div class="col-md-4">
        <a class="tarjeta-producto-inicio" href="producto.html?id=${encodeURIComponent(producto.id)}">
          <img src="${escaparHtml(imagen)}" alt="${escaparHtml(producto.brand + " " + producto.title)}">
          <span>${escaparHtml(producto.brand)}</span>
          <strong>${escaparHtml(producto.title)}</strong>
          <em>${escaparHtml(producto.price)}</em>
        </a>
      </div>
    `;
  };

  const agruparProductos = (productos) => {
    const grupos = [];
    for (let indice = 0; indice < productos.length; indice += 3) {
      grupos.push(productos.slice(indice, indice + 3));
    }
    return grupos;
  };

  if (!window.CDPBackend?.isConfigured()) {
    mostrarMensaje("Abre la web desde XAMPP para mostrar los productos destacados.");
    return;
  }

  try {
    const productos = await window.CDPBackend.listProducts();
    if (!productos.length) {
      mostrarMensaje("Importa productos desde el panel de administrador para mostrar destacados.");
      return;
    }

    interiorCarrusel.innerHTML = agruparProductos(productos.slice(0, 6))
      .map(
        (grupo, indice) => `
          <div class="carousel-item${indice === 0 ? " active" : ""}">
            <div class="row g-4">
              ${grupo.map(renderizarProducto).join("")}
            </div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.warn("No se pudieron cargar los productos destacados.", error);
    mostrarMensaje("No se pudieron cargar los productos destacados desde MySQL.");
  }
})();
