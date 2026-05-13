;(async () => {
  const carouselInner = document.querySelector("[data-home-products]");
  if (!carouselInner) return;

  const escapeHtml = (value) => window.CDPBackend?.escapeHtml(value) || "";

  const renderMessage = (message) => {
    carouselInner.innerHTML = `
      <div class="carousel-item active">
        <div class="home-products-message">${escapeHtml(message)}</div>
      </div>
    `;
  };

  const renderProduct = (product) => {
    const image = product.gallery[0] || "assets/img/logo_cdp_transparente.png";
    return `
      <div class="col-md-4">
        <a class="home-product-card" href="producto.html?id=${encodeURIComponent(product.id)}">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(product.brand + " " + product.title)}">
          <span>${escapeHtml(product.brand)}</span>
          <strong>${escapeHtml(product.title)}</strong>
          <em>${escapeHtml(product.price)}</em>
        </a>
      </div>
    `;
  };

  const chunkProducts = (products) => {
    const chunks = [];
    for (let index = 0; index < products.length; index += 3) {
      chunks.push(products.slice(index, index + 3));
    }
    return chunks;
  };

  if (!window.CDPBackend?.isConfigured()) {
    renderMessage("Abre la web desde XAMPP para mostrar los productos destacados.");
    return;
  }

  try {
    const products = await window.CDPBackend.listProducts();
    if (!products.length) {
      renderMessage("Importa productos desde el panel admin para mostrar destacados.");
      return;
    }

    carouselInner.innerHTML = chunkProducts(products.slice(0, 6))
      .map(
        (chunk, index) => `
          <div class="carousel-item${index === 0 ? " active" : ""}">
            <div class="row g-4">
              ${chunk.map(renderProduct).join("")}
            </div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.warn("No se pudieron cargar los productos destacados.", error);
    renderMessage("No se pudieron cargar los productos destacados desde MySQL.");
  }
})();
