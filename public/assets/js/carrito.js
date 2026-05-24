(function () {
  const backend = window.CDPBackend;
  const contenedorItems = document.querySelector("[data-cart-items]");
  const estadoVacio = document.querySelector("[data-cart-empty]");
  const resumenCesta = document.querySelector("[data-cart-summary]");
  const totalCesta = document.querySelector("[data-cart-total]");
  const cantidadCesta = document.querySelector("[data-cart-quantity]");
  const botonVaciar = document.querySelector("[data-cart-clear]");
  const escaparHtml = (valor) => backend?.escapeHtml(valor) || "";

  const formatearPrecio = (valor) => {
    const numero = Number.parseFloat(valor || 0);
    return `${new Intl.NumberFormat("es-ES").format(numero)} EUR`;
  };

  const mostrarMensaje = (mensaje) => {
    if (contenedorItems) contenedorItems.innerHTML = `<div class="shop-empty">${escaparHtml(mensaje)}</div>`;
    if (estadoVacio) estadoVacio.hidden = true;
    if (resumenCesta) resumenCesta.hidden = true;
  };

  const renderizarCesta = (cesta) => {
    const items = cesta.data || [];

    if (!items.length) {
      if (contenedorItems) contenedorItems.innerHTML = "";
      if (estadoVacio) estadoVacio.hidden = false;
      if (resumenCesta) resumenCesta.hidden = true;
      window.CDPShop?.renderCartCount?.(0);
      return;
    }

    if (estadoVacio) estadoVacio.hidden = true;
    if (resumenCesta) resumenCesta.hidden = false;
    if (totalCesta) totalCesta.textContent = formatearPrecio(cesta.total);
    if (cantidadCesta) cantidadCesta.textContent = `${cesta.total_quantity || 0} unidad(es)`;
    window.CDPShop?.renderCartCount?.(cesta.total_quantity || 0);

    if (!contenedorItems) return;
    contenedorItems.innerHTML = items.map((item) => {
      const producto = item.producto || {};
      const imagen = producto.imagen_principal || "assets/img/logo_cdp_transparente.png";
      return `
        <article class="cart-item">
          <a class="cart-item-media" href="producto.html?id=${encodeURIComponent(producto.slug || producto.id)}">
            <img src="${escaparHtml(imagen)}" alt="${escaparHtml(producto.nombre || "Producto")}">
          </a>
          <div class="cart-item-info">
            <span>${escaparHtml(producto.marca || "CDP")}</span>
            <h2>${escaparHtml(producto.nombre || "Producto")}</h2>
            <p>${escaparHtml(producto.descripcion_corta || producto.modelo || "")}</p>
          </div>
          <div class="cart-item-controls">
            <div class="cart-qty">
              <button type="button" data-cart-decrease="${escaparHtml(item.id)}" aria-label="Reducir cantidad">-</button>
              <strong>${escaparHtml(item.cantidad)}</strong>
              <button type="button" data-cart-increase="${escaparHtml(item.id)}" aria-label="Aumentar cantidad">+</button>
            </div>
            <div class="cart-item-price">${escaparHtml(formatearPrecio(item.line_total))}</div>
            <button class="cart-remove" type="button" data-cart-remove="${escaparHtml(item.id)}">Eliminar</button>
          </div>
        </article>
      `;
    }).join("");
  };

  const cargarCesta = async () => {
    if (!backend?.isConfigured?.()) {
      mostrarMensaje("Abre la web desde XAMPP para usar la cesta.");
      return;
    }

    const sesion = await backend.getCustomerSession();
    window.CDPShop?.renderCustomerState?.(sesion);

    if (!sesion.authenticated) {
      mostrarMensaje("Inicia sesion o registrate como cliente para ver tu cesta.");
      return;
    }

    try {
      renderizarCesta(await backend.getCart());
    } catch (error) {
      mostrarMensaje("No se pudo cargar la cesta.");
    }
  };

  contenedorItems?.addEventListener("click", async (evento) => {
    const aumentar = evento.target.closest("[data-cart-increase]");
    const disminuir = evento.target.closest("[data-cart-decrease]");
    const eliminar = evento.target.closest("[data-cart-remove]");
    if (!aumentar && !disminuir && !eliminar) return;

    const cesta = await backend.getCart();
    const id = aumentar?.dataset.cartIncrease || disminuir?.dataset.cartDecrease || eliminar?.dataset.cartRemove;
    const item = (cesta.data || []).find((entrada) => entrada.id === id);
    if (!item) return;

    if (aumentar) renderizarCesta(await backend.updateCartItem(id, item.cantidad + 1));
    if (disminuir) renderizarCesta(await backend.updateCartItem(id, item.cantidad - 1));
    if (eliminar) renderizarCesta(await backend.removeCartItem(id));
  });

  botonVaciar?.addEventListener("click", async () => {
    renderizarCesta(await backend.clearCart());
  });

  const botonFinalizar = document.querySelector("[data-cart-checkout]");
  botonFinalizar?.addEventListener("click", async () => {
    try {
      const cesta = await backend.getCart();
      const items = cesta.data || [];
      if (!items.length) return;

      const datosFinalizar = {
        tipo: "carrito",
        items: items.map((item) => {
          const producto = item.producto || {};
          return {
            nombre: producto.nombre || "Producto",
            marca: producto.marca || "",
            modelo: producto.modelo || "",
            slug: producto.slug || "",
            imagen: producto.imagen_principal || "assets/img/logo_cdp_transparente.png",
            cantidad: Number(item.cantidad) || 1,
            precio_unidad: Number(producto.precio) || 0,
            total: Number(item.line_total) || 0,
          };
        }),
        total: Number(cesta.total) || 0,
        total_quantity: Number(cesta.total_quantity) || 0,
      };

      localStorage.setItem("cdp.cart.checkout", JSON.stringify(datosFinalizar));
      localStorage.removeItem("cdp.volante.checkout");
      window.location.href = "pago.html";
    } catch (error) {
      console.warn("No se pudo iniciar el pago de la cesta.", error);
    }
  });

  cargarCesta();
})();
