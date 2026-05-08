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
    if (!productGrid || !window.CDPSupabase?.isConfigured()) return;

    try {
      const products = await window.CDPSupabase.listProducts();
      if (!products.length) return;
      productGrid.innerHTML = products.map(renderProductCard).join("");
      catalog.dataset.source = "supabase";
      if (window.feather) feather.replace();
    } catch (error) {
      console.warn("No se pudo cargar el catalogo desde Supabase. Se mantiene el catalogo local.", error);
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

  const applyFilters = () => {
    const state = getState();
    let visibleCount = 0;

    cardData.forEach((item) => {
      const visible =
        matchesSearch(item, state.search) &&
        (!state.brand || item.brand === state.brand) &&
        (!state.model || item.model.includes(state.model)) &&
        matchesMulti(item.material, state.materials) &&
        matchesMulti(item.color, state.colors) &&
        item.price <= state.maxPrice;

      item.card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (resultsCounter) resultsCounter.textContent = `${visibleCount} resultado(s)`;
    if (emptyState) emptyState.hidden = visibleCount > 0;
    setActiveQuickFilters(state);
    updatePriceOutput();
  };

  const resetFilters = () => {
    if (searchInput) searchInput.value = "";
    if (filterForm) filterForm.reset();
    if (priceRange) priceRange.value = priceRange.max;
    applyFilters();
  };

  searchInput?.addEventListener("input", applyFilters);
  filterForm?.addEventListener("input", applyFilters);
  filterForm?.addEventListener("change", applyFilters);
  resetButtons.forEach((button) => button.addEventListener("click", resetFilters));

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

      applyFilters();
    });
  });

  const query = new URLSearchParams(window.location.search);
  if (query.has("brand") && filterForm?.elements.brand) filterForm.elements.brand.value = query.get("brand");
  if (query.has("model") && filterForm?.elements.model) filterForm.elements.model.value = query.get("model");
  if (query.has("q") && searchInput) searchInput.value = query.get("q");

  if (priceRange) priceRange.value = priceRange.max;
  applyFilters();
})();
