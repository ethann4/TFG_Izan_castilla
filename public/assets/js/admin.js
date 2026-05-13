(function () {
  const backend = window.CDPBackend;
  const loginPanel = document.querySelector("[data-admin-login]");
  const dashboard = document.querySelector("[data-admin-dashboard]");
  const loginForm = document.querySelector("[data-login-form]");
  const logoutButton = document.querySelector("[data-admin-logout]");
  const sessionChip = document.querySelector("[data-admin-session]");
  const productForm = document.querySelector("[data-product-form]");
  const productStatus = document.querySelector("[data-product-status]");
  const loginStatus = document.querySelector("[data-login-status]");
  const productsTable = document.querySelector("[data-products-table]");
  const requestsTable = document.querySelector("[data-requests-table]");
  const productCount = document.querySelector("[data-products-count]");
  const requestCount = document.querySelector("[data-requests-count]");
  const adminState = document.querySelector("[data-admin-state]");
  const productFormTitle = document.querySelector("[data-product-form-title]");
  const importProductsButton = document.querySelector("[data-import-photo-products]");
  const importProductsStatus = document.querySelector("[data-import-products-status]");
  const productSeed = Array.isArray(window.CDP_PRODUCT_SEED) ? window.CDP_PRODUCT_SEED : [];

  let products = [];

  const setStatus = (node, message, type = "info") => {
    if (!node) return;
    node.hidden = false;
    node.className = `admin-status is-${type}`;
    node.textContent = message;
  };

  const hideStatus = (node) => {
    if (node) node.hidden = true;
  };

  const escapeHtml = (value) => backend?.escapeHtml(value) || "";

  const slugify = (value) =>
    (value || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const parseList = (value) =>
    (value || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  const formatMoney = (value) => {
    const number = Number.parseFloat(value);
    if (!Number.isFinite(number)) return "";
    return `${new Intl.NumberFormat("es-ES").format(number)} EUR`;
  };

  const getSession = () => backend?.getSession();
  const normalizeSlug = (value) => (value || "").toString().toLowerCase();

  const findExistingProduct = (seedProduct) => {
    const slug = normalizeSlug(seedProduct.slug);
    return products.find((product) => product.slug === seedProduct.slug) || products.find((product) => normalizeSlug(product.slug) === slug);
  };

  const updateSessionUi = () => {
    const session = getSession();
    const isLogged = Boolean(session);

    if (loginPanel) loginPanel.hidden = isLogged;
    if (dashboard) dashboard.hidden = !isLogged;
    if (logoutButton) logoutButton.hidden = !isLogged;
    if (sessionChip) sessionChip.textContent = isLogged ? `Admin: ${session.user?.email || "sesion activa"}` : "Sesion no iniciada";

    if (isLogged) {
      loadAdminData();
    }
  };

  const activateTab = (tabName) => {
    document.querySelectorAll("[data-admin-tab]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.adminTab === tabName);
    });

    document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.adminPanel === tabName);
    });
  };

  const getPayload = () => {
    const formData = new FormData(productForm);
    const get = (name) => formData.get(name)?.toString().trim() || "";
    const numberOrNull = (name) => {
      const value = get(name);
      return value ? Number.parseFloat(value) : null;
    };

    return {
      slug: get("slug"),
      marca: get("marca"),
      marca_filtro: get("marca_filtro"),
      modelo: get("modelo"),
      modelo_filtro: get("modelo_filtro"),
      nombre: get("nombre"),
      descripcion: get("descripcion"),
      descripcion_corta: get("descripcion_corta"),
      material: get("material"),
      color: get("color"),
      precio: Number.parseFloat(get("precio")) || 0,
      precio_anterior: numberOrNull("precio_anterior"),
      etiqueta: get("etiqueta") || "Nuevo",
      valoracion: get("valoracion") || "4.8",
      imagen_principal: get("imagen_principal"),
      galeria: parseList(get("galeria")),
      acabados: parseList(get("acabados")),
      compatibilidad: parseList(get("compatibilidad")),
      especificaciones: parseList(get("especificaciones")),
      tags: get("tags"),
      stock: Number.parseInt(get("stock") || "0", 10),
      activo: formData.has("activo"),
      actualizado_en: new Date().toISOString(),
    };
  };

  const fillProductForm = (product) => {
    if (!productForm) return;
    const set = (name, value) => {
      const input = productForm.elements[name];
      if (!input) return;
      if (input.type === "checkbox") input.checked = Boolean(value);
      else input.value = value ?? "";
    };

    set("id", product.id);
    set("slug", product.slug);
    set("marca", product.marca);
    set("marca_filtro", product.marca_filtro);
    set("modelo", product.modelo);
    set("modelo_filtro", product.modelo_filtro);
    set("nombre", product.nombre);
    set("descripcion", product.descripcion);
    set("descripcion_corta", product.descripcion_corta);
    set("material", product.material);
    set("color", product.color);
    set("precio", product.precio);
    set("precio_anterior", product.precio_anterior);
    set("etiqueta", product.etiqueta);
    set("valoracion", product.valoracion);
    set("imagen_principal", product.imagen_principal);
    set("galeria", (product.galeria || []).join("\n"));
    set("acabados", (product.acabados || []).join("\n"));
    set("compatibilidad", (product.compatibilidad || []).join("\n"));
    set("especificaciones", (product.especificaciones || []).join("\n"));
    set("tags", product.tags);
    set("stock", product.stock);
    set("activo", product.activo);

    if (productFormTitle) productFormTitle.textContent = "Editar producto";
    activateTab("producto");
    hideStatus(productStatus);
  };

  const resetProductForm = () => {
    productForm?.reset();
    if (productForm?.elements.id) productForm.elements.id.value = "";
    if (productForm?.elements.activo) productForm.elements.activo.checked = true;
    if (productForm?.elements.stock) productForm.elements.stock.value = "1";
    if (productFormTitle) productFormTitle.textContent = "Crear producto";
    hideStatus(productStatus);
  };

  const renderProducts = () => {
    if (!productsTable) return;
    if (!products.length) {
      productsTable.innerHTML = '<tr><td colspan="6">No hay productos guardados.</td></tr>';
      return;
    }

    productsTable.innerHTML = products
      .map(
        (product) => `
          <tr>
            <td><strong>${escapeHtml(product.nombre)}</strong><br><small>${escapeHtml(product.slug)}</small></td>
            <td>${escapeHtml(product.marca)}<br><small>${escapeHtml(product.modelo || "")}</small></td>
            <td>${escapeHtml(formatMoney(product.precio))}</td>
            <td>${escapeHtml(product.stock)}</td>
            <td><span class="badge ${product.activo ? "bg-success" : "bg-secondary"}">${product.activo ? "Activo" : "Inactivo"}</span></td>
            <td>
              <div class="admin-table-actions">
                <button class="admin-mini-btn" type="button" data-edit-product="${escapeHtml(product.id)}">Editar</button>
                <button class="admin-mini-btn" type="button" data-toggle-product="${escapeHtml(product.id)}">${product.activo ? "Desactivar" : "Activar"}</button>
                <button class="admin-mini-btn is-danger" type="button" data-delete-product="${escapeHtml(product.id)}">Eliminar</button>
              </div>
            </td>
          </tr>
        `
      )
      .join("");
  };

  const renderRequests = (requests) => {
    if (!requestsTable) return;
    if (!requests.length) {
      requestsTable.innerHTML = '<tr><td colspan="6">No hay solicitudes todavia.</td></tr>';
      return;
    }

    requestsTable.innerHTML = requests
      .map(
        (request) => `
          <tr>
            <td><strong>${escapeHtml(request.nombre)}</strong><br><small>${new Date(request.creado_en).toLocaleDateString("es-ES")}</small></td>
            <td>${escapeHtml(request.email)}<br><small>${escapeHtml(request.telefono || "")}</small></td>
            <td>${escapeHtml(request.modelo_coche || "")}<br><small>${escapeHtml(request.material || "")}</small></td>
            <td>${escapeHtml(request.presupuesto || "")}</td>
            <td>${escapeHtml(request.mensaje || "")}</td>
            <td><span class="badge bg-warning text-dark">${escapeHtml(request.estado || "pendiente")}</span></td>
          </tr>
        `
      )
      .join("");
  };

  const loadProducts = async () => {
    products = await backend.listProductsAdmin();
    renderProducts();
    if (productCount) productCount.textContent = products.length;
  };

  const loadRequests = async () => {
    const requests = await backend.listSolicitudes();
    renderRequests(requests);
    if (requestCount) requestCount.textContent = requests.length;
  };

  const loadAdminData = async () => {
    try {
      if (adminState) adminState.textContent = "OK";
      await Promise.all([loadProducts(), loadRequests()]);
      if (window.feather) feather.replace();
    } catch (error) {
      console.warn("No se pudieron cargar los datos admin.", error);
      if (adminState) adminState.textContent = "ERROR";
      setStatus(productStatus, "No se pudieron cargar los datos. Comprueba tu sesion admin y las tablas MySQL.", "error");
    }
  };

  const importPhotoProducts = async () => {
    if (!productSeed.length) {
      setStatus(importProductsStatus, "No hay productos de fotos preparados para importar.", "error");
      return;
    }

    if (!getSession()) {
      setStatus(importProductsStatus, "Inicia sesion como admin antes de importar productos.", "error");
      return;
    }

    if (!products.length) await loadProducts();

    let created = 0;
    let updated = 0;
    const failures = [];

    if (importProductsButton) importProductsButton.disabled = true;

    for (const [index, seedProduct] of productSeed.entries()) {
      const position = `${index + 1}/${productSeed.length}`;
      const existingProduct = findExistingProduct(seedProduct);
      const payload = {
        ...seedProduct,
        slug: existingProduct?.slug || seedProduct.slug,
        actualizado_en: new Date().toISOString(),
      };

      try {
        setStatus(importProductsStatus, `Importando ${position}: ${seedProduct.nombre}`, "info");
        if (existingProduct) {
          await backend.updateProduct(existingProduct.id, payload);
          updated += 1;
        } else {
          await backend.createProduct(payload);
          created += 1;
        }
      } catch (error) {
        console.warn(`No se pudo importar ${seedProduct.slug}.`, error);
        failures.push(seedProduct.nombre);
      }
    }

    await loadProducts();
    if (importProductsButton) importProductsButton.disabled = false;

    if (failures.length) {
      setStatus(importProductsStatus, `Importacion parcial: ${created} nuevos, ${updated} actualizados, ${failures.length} con error. Revisa permisos o slugs repetidos.`, "error");
      return;
    }

    setStatus(importProductsStatus, `Importacion completada: ${created} productos nuevos y ${updated} actualizados desde fotos.`, "success");
  };

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    try {
      setStatus(loginStatus, "Iniciando sesion...", "info");
      await backend.login(data.get("email"), data.get("password"));
      hideStatus(loginStatus);
      updateSessionUi();
    } catch (error) {
      console.warn("Error de login.", error);
      setStatus(loginStatus, "No se pudo iniciar sesion. Revisa email, contrasena y usuario admin.", "error");
    }
  });

  logoutButton?.addEventListener("click", () => {
    backend.logout();
    updateSessionUi();
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.adminTab));
  });

  productForm?.elements.nombre?.addEventListener("input", () => {
    if (!productForm.elements.slug.value) productForm.elements.slug.value = slugify(productForm.elements.nombre.value);
  });

  productForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!productForm.checkValidity()) {
      productForm.reportValidity();
      return;
    }

    const payload = getPayload();
    const id = productForm.elements.id.value;

    try {
      setStatus(productStatus, "Guardando producto...", "info");
      if (id) await backend.updateProduct(id, payload);
      else await backend.createProduct(payload);
      setStatus(productStatus, id ? "Producto actualizado correctamente." : "Producto creado correctamente.", "success");
      resetProductForm();
      await loadProducts();
    } catch (error) {
      console.warn("No se pudo guardar el producto.", error);
      setStatus(productStatus, "No se pudo guardar. Revisa permisos, slug repetido o campos obligatorios.", "error");
    }
  });

  document.querySelector("[data-product-reset]")?.addEventListener("click", resetProductForm);
  document.querySelector("[data-products-refresh]")?.addEventListener("click", loadProducts);
  document.querySelector("[data-requests-refresh]")?.addEventListener("click", loadRequests);
  importProductsButton?.addEventListener("click", importPhotoProducts);

  productsTable?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-product]");
    const toggleButton = event.target.closest("[data-toggle-product]");
    const deleteButton = event.target.closest("[data-delete-product]");

    if (editButton) {
      const product = products.find((item) => item.id === editButton.dataset.editProduct);
      if (product) fillProductForm(product);
      return;
    }

    if (toggleButton) {
      const product = products.find((item) => item.id === toggleButton.dataset.toggleProduct);
      if (!product) return;
      await backend.updateProduct(product.id, { activo: !product.activo, actualizado_en: new Date().toISOString() });
      await loadProducts();
      return;
    }

    if (deleteButton) {
      const product = products.find((item) => item.id === deleteButton.dataset.deleteProduct);
      if (!product) return;
      const confirmed = window.confirm(`Eliminar definitivamente "${product.nombre}" de MySQL?`);
      if (!confirmed) return;

      try {
        setStatus(importProductsStatus || productStatus, `Eliminando ${product.nombre}...`, "info");
        await backend.deleteProduct(product.id);
        await loadProducts();
        setStatus(importProductsStatus || productStatus, `Producto eliminado: ${product.nombre}.`, "success");
      } catch (error) {
        console.warn("No se pudo eliminar el producto.", error);
        setStatus(importProductsStatus || productStatus, "No se pudo eliminar. Revisa la sesion admin o la base de datos.", "error");
      }
    }
  });

  if (!backend?.isConfigured()) {
    setStatus(loginStatus, "Abre la web desde XAMPP para usar el backend PHP/MySQL.", "error");
  }

  updateSessionUi();
})();
