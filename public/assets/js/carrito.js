(function () {
  const backend = window.CDPBackend;
  const itemsContainer = document.querySelector("[data-cart-items]");
  const emptyState = document.querySelector("[data-cart-empty]");
  const cartSummary = document.querySelector("[data-cart-summary]");
  const cartTotal = document.querySelector("[data-cart-total]");
  const cartQuantity = document.querySelector("[data-cart-quantity]");
  const clearButton = document.querySelector("[data-cart-clear]");
  const escapeHtml = (value) => backend?.escapeHtml(value) || "";

  const formatPrice = (value) => {
    const number = Number.parseFloat(value || 0);
    return `${new Intl.NumberFormat("es-ES").format(number)} EUR`;
  };

  const renderMessage = (message) => {
    if (itemsContainer) itemsContainer.innerHTML = `<div class="shop-empty">${escapeHtml(message)}</div>`;
    if (emptyState) emptyState.hidden = true;
    if (cartSummary) cartSummary.hidden = true;
  };

  const renderCart = (cart) => {
    const items = cart.data || [];

    if (!items.length) {
      if (itemsContainer) itemsContainer.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      if (cartSummary) cartSummary.hidden = true;
      window.CDPShop?.renderCartCount?.(0);
      return;
    }

    if (emptyState) emptyState.hidden = true;
    if (cartSummary) cartSummary.hidden = false;
    if (cartTotal) cartTotal.textContent = formatPrice(cart.total);
    if (cartQuantity) cartQuantity.textContent = `${cart.total_quantity || 0} unidad(es)`;
    window.CDPShop?.renderCartCount?.(cart.total_quantity || 0);

    if (!itemsContainer) return;
    itemsContainer.innerHTML = items.map((item) => {
      const product = item.producto || {};
      const image = product.imagen_principal || "assets/img/logo_cdp_transparente.png";
      return `
        <article class="cart-item">
          <a class="cart-item-media" href="producto.html?id=${encodeURIComponent(product.slug || product.id)}">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(product.nombre || "Producto")}">
          </a>
          <div class="cart-item-info">
            <span>${escapeHtml(product.marca || "CDP")}</span>
            <h2>${escapeHtml(product.nombre || "Producto")}</h2>
            <p>${escapeHtml(product.descripcion_corta || product.modelo || "")}</p>
          </div>
          <div class="cart-item-controls">
            <div class="cart-qty">
              <button type="button" data-cart-decrease="${escapeHtml(item.id)}" aria-label="Reducir cantidad">-</button>
              <strong>${escapeHtml(item.cantidad)}</strong>
              <button type="button" data-cart-increase="${escapeHtml(item.id)}" aria-label="Aumentar cantidad">+</button>
            </div>
            <div class="cart-item-price">${escapeHtml(formatPrice(item.line_total))}</div>
            <button class="cart-remove" type="button" data-cart-remove="${escapeHtml(item.id)}">Eliminar</button>
          </div>
        </article>
      `;
    }).join("");
  };

  const loadCart = async () => {
    if (!backend?.isConfigured?.()) {
      renderMessage("Abre la web desde XAMPP para usar la cesta.");
      return;
    }

    const session = await backend.getCustomerSession();
    window.CDPShop?.renderCustomerState?.(session);

    if (!session.authenticated) {
      renderMessage("Inicia sesion o registrate como cliente para ver tu cesta.");
      return;
    }

    try {
      renderCart(await backend.getCart());
    } catch (error) {
      renderMessage("No se pudo cargar la cesta.");
    }
  };

  itemsContainer?.addEventListener("click", async (event) => {
    const increase = event.target.closest("[data-cart-increase]");
    const decrease = event.target.closest("[data-cart-decrease]");
    const remove = event.target.closest("[data-cart-remove]");
    if (!increase && !decrease && !remove) return;

    const cart = await backend.getCart();
    const id = increase?.dataset.cartIncrease || decrease?.dataset.cartDecrease || remove?.dataset.cartRemove;
    const item = (cart.data || []).find((entry) => entry.id === id);
    if (!item) return;

    if (increase) renderCart(await backend.updateCartItem(id, item.cantidad + 1));
    if (decrease) renderCart(await backend.updateCartItem(id, item.cantidad - 1));
    if (remove) renderCart(await backend.removeCartItem(id));
  });

  clearButton?.addEventListener("click", async () => {
    renderCart(await backend.clearCart());
  });

  loadCart();
})();
