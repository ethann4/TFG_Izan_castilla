;(async () => {
  const normalizeText = (value) =>
    (value || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const toNumber = (value) => Number.parseFloat(value || "0") || 0;
  const escapeHtml = (value) => window.CDPSupabase?.escapeHtml(value) || "";

  const catalog = document.querySelector("[data-catalog]");
  if (!catalog) return;

  const productGrid = catalog.querySelector("#catalogo-grid");
  if (!productGrid) return;

  const renderCatalogMessage = (message) => {
    productGrid.innerHTML = `<div class="catalog-grid-message">${escapeHtml(message)}</div>`;
  };

  const renderProductCard = (product) => {
    const image = product.gallery[0] || "assets/img/logo_cdp_transparente.png";
    const discount = (() => {
      const current = toNumber(product.priceNumber);
      const previous = toNumber((product.oldPrice || "").replace(/\D/g, ""));
      if (!previous || !current || previous <= current) return "";
      return `-${Math.round(((previous - current) / previous) * 100)}%`;
    })();

    return `
      <a class="product-card" href="producto.html?id=${encodeURIComponent(product.id)}" data-brand="${escapeHtml(product.brandFilter)}" data-model="${escapeHtml(product.modelFilter)}" data-material="${escapeHtml(product.material)}" data-color="${escapeHtml(product.color)}" data-price="${escapeHtml(product.priceNumber)}" data-tags="${escapeHtml(product.tags)}">
        <div class="product-media">
          <span class="product-badge">${escapeHtml(product.badge)}</span><span class="product-fav" data-feather="heart"></span><span class="product-rating">${escapeHtml(product.rating)}</span>
          <img src="${escapeHtml(image)}" alt="${escapeHtml(product.brand + " " + product.title)}">
        </div>
        <div class="product-meta">
          <div class="product-topline">
            <div><div class="product-brand">${escapeHtml(product.brand)}</div><div class="product-name">${escapeHtml(product.title)}</div><div class="product-fit">${escapeHtml(product.fitSummary)}</div></div>
            <div class="product-price"><strong>${escapeHtml(product.price)}</strong>${product.oldPrice ? `<br><s>${escapeHtml(product.oldPrice)}</s>` : ""}${discount ? `<br><span class="product-discount">${escapeHtml(discount)}</span>` : ""}</div>
          </div>
          <div class="product-actions">Ver ficha <span data-feather="arrow-right"></span></div>
        </div>
      </a>
    `;
  };

  const loadSupabaseCatalog = async () => {
    if (!window.CDPSupabase?.isConfigured()) {
      renderCatalogMessage("Configura Supabase para cargar los productos del catalogo.");
      return;
    }

    try {
      const products = await window.CDPSupabase.listProducts();
      if (!products.length) {
        renderCatalogMessage("No hay productos guardados en Supabase. Ejecuta database/supabase_seed.sql para rellenar el catalogo.");
        return;
      }
      productGrid.innerHTML = products.map(renderProductCard).join("");
      catalog.dataset.source = "supabase";
      if (window.feather) feather.replace();
    } catch (error) {
      console.warn("No se pudo cargar el catalogo desde Supabase.", error);
      renderCatalogMessage("No se pudo cargar el catalogo desde Supabase. Revisa la conexion y las claves del proyecto.");
    }
  };

  await loadSupabaseCatalog();

  const searchInput = catalog.querySelector("[data-catalog-search]");
  const productCards = Array.from(catalog.querySelectorAll(".product-card"));
  const resultsCounter = catalog.querySelector("[data-catalog-count]");
  const emptyState = catalog.querySelector("[data-catalog-empty]");
  const quickFilters = Array.from(catalog.querySelectorAll("[data-quick-filter]"));
  const filterForm = catalog.querySelector("[data-filter-form]");
  const resetButtons = Array.from(catalog.querySelectorAll("[data-reset-filters]"));
  const priceRange = catalog.querySelector("[data-filter-price]");
  const priceOutput = catalog.querySelector("[data-price-output]");
  const productsPerPage = 6;
  let currentPage = 1;
  const paginationControls = document.createElement("nav");
  paginationControls.className = "catalog-pagination";
  paginationControls.setAttribute("aria-label", "Paginacion de productos");
  paginationControls.hidden = true;
  productGrid.insertAdjacentElement("afterend", paginationControls);

  if (!productCards.length) {
    if (resultsCounter) resultsCounter.textContent = "0 resultado(s)";
    if (emptyState) emptyState.hidden = true;
    return;
  }

  const cardData = productCards.map((card) => {
    const dataset = card.dataset;
    const text = normalizeText([card.textContent, dataset.tags, dataset.brand, dataset.model, dataset.material, dataset.color].join(" "));
    return {
      card,
      brand: normalizeText(dataset.brand),
      model: normalizeText(dataset.model),
      material: normalizeText(dataset.material),
      color: normalizeText(dataset.color),
      price: toNumber(dataset.price),
      text,
    };
  });

  const getCheckedValues = (name) =>
    filterForm
      ? Array.from(filterForm.querySelectorAll(`input[name="${name}"]:checked`)).map((input) => normalizeText(input.value))
      : [];

  const getState = () => ({
    search: normalizeText(searchInput ? searchInput.value : ""),
    brand: normalizeText(filterForm?.elements.brand?.value || ""),
    model: normalizeText(filterForm?.elements.model?.value || ""),
    materials: getCheckedValues("material"),
    colors: getCheckedValues("color"),
    maxPrice: toNumber(priceRange?.value || priceRange?.max || "9999"),
  });

  const matchesSearch = (item, search) => {
    if (!search) return true;
    return search.split(/\s+/).every((term) => item.text.includes(term));
  };

  const matchesMulti = (source, selectedValues) => {
    if (!selectedValues.length) return true;
    return selectedValues.some((value) => source.includes(value));
  };

  const updatePriceOutput = () => {
    if (priceOutput && priceRange) {
      priceOutput.textContent = `Hasta ${priceRange.value} EUR`;
    }
  };

  const setActiveQuickFilters = (state) => {
    quickFilters.forEach((button) => {
      const type = button.dataset.quickType || "search";
      const value = normalizeText(button.dataset.quickFilter);
      const isActive =
        (type === "all" && !state.search && !state.brand && !state.model && !state.materials.length && !state.colors.length) ||
        (type === "brand" && state.brand === value) ||
        (type === "model" && state.model === value) ||
        (type === "material" && state.materials.includes(value)) ||
        (type === "search" && state.search === value);
      button.classList.toggle("is-active", isActive);
    });
  };

  const renderPagination = (totalItems, totalPages) => {
    if (!paginationControls) return;

    if (totalItems <= productsPerPage) {
      paginationControls.hidden = true;
      paginationControls.innerHTML = "";
      return;
    }

    const pageButtons = Array.from({ length: totalPages }, (_, index) => {
      const page = index + 1;
      const isActive = page === currentPage;
      return `<button class="catalog-page-btn${isActive ? " is-active" : ""}" type="button" data-catalog-page="${page}" aria-label="Ir a pagina ${page}"${isActive ? ' aria-current="page"' : ""}>${page}</button>`;
    }).join("");

    paginationControls.hidden = false;
    paginationControls.innerHTML = `
      <button class="catalog-page-btn catalog-page-step" type="button" data-catalog-page="prev"${currentPage === 1 ? " disabled" : ""}>
        <span data-feather="chevron-left"></span>
        Anterior
      </button>
      <div class="catalog-page-numbers">${pageButtons}</div>
      <button class="catalog-page-btn catalog-page-step" type="button" data-catalog-page="next"${currentPage === totalPages ? " disabled" : ""}>
        Siguiente
        <span data-feather="chevron-right"></span>
      </button>
    `;

    if (window.feather) feather.replace();
  };

  const applyFilters = ({ resetPage = false } = {}) => {
    const state = getState();
    if (resetPage) currentPage = 1;

    const filteredItems = cardData.filter(
      (item) =>
        matchesSearch(item, state.search) &&
        (!state.brand || item.brand === state.brand) &&
        (!state.model || item.model.includes(state.model)) &&
        matchesMulti(item.material, state.materials) &&
        matchesMulti(item.color, state.colors) &&
        item.price <= state.maxPrice
    );

    const visibleCount = filteredItems.length;
    const totalPages = Math.max(1, Math.ceil(visibleCount / productsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const pageStart = (currentPage - 1) * productsPerPage;
    const visiblePageItems = new Set(filteredItems.slice(pageStart, pageStart + productsPerPage));

    cardData.forEach((item) => {
      item.card.hidden = !visiblePageItems.has(item);
    });

    if (resultsCounter) {
      resultsCounter.textContent = visibleCount
        ? `${visibleCount} resultado(s) - Pagina ${currentPage} de ${totalPages}`
        : "0 resultado(s)";
    }
    if (emptyState) emptyState.hidden = visibleCount > 0;
    setActiveQuickFilters(state);
    updatePriceOutput();
    renderPagination(visibleCount, totalPages);
  };

  const resetFilters = () => {
    if (searchInput) searchInput.value = "";
    if (filterForm) filterForm.reset();
    if (priceRange) priceRange.value = priceRange.max;
    applyFilters({ resetPage: true });
  };

  searchInput?.addEventListener("input", () => applyFilters({ resetPage: true }));
  filterForm?.addEventListener("input", () => applyFilters({ resetPage: true }));
  filterForm?.addEventListener("change", () => applyFilters({ resetPage: true }));
  resetButtons.forEach((button) => button.addEventListener("click", resetFilters));
  paginationControls.addEventListener("click", (event) => {
    const button = event.target.closest("[data-catalog-page]");
    if (!button || button.disabled) return;

    const action = button.dataset.catalogPage;
    if (action === "prev") currentPage -= 1;
    else if (action === "next") currentPage += 1;
    else currentPage = toNumber(action);

    applyFilters();
    productGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  quickFilters.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.quickType || "search";
      const value = button.dataset.quickFilter || "";

      if (type === "all") {
        resetFilters();
        return;
      }

      if (type === "brand" && filterForm?.elements.brand) filterForm.elements.brand.value = value;
      if (type === "model" && filterForm?.elements.model) filterForm.elements.model.value = value;
      if (type === "material" && filterForm) {
        const input = filterForm.querySelector(`input[name="material"][value="${value}"]`);
        if (input) input.checked = true;
      }
      if (type === "search" && searchInput) searchInput.value = value;

      applyFilters({ resetPage: true });
    });
  });

  const query = new URLSearchParams(window.location.search);
  if (query.has("brand") && filterForm?.elements.brand) filterForm.elements.brand.value = query.get("brand");
  if (query.has("model") && filterForm?.elements.model) filterForm.elements.model.value = query.get("model");
  if (query.has("q") && searchInput) searchInput.value = query.get("q");

  if (priceRange) priceRange.value = priceRange.max;
  applyFilters({ resetPage: true });
})();
