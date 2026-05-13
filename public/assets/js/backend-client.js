(function () {
  const script = document.currentScript || document.querySelector('script[src$="backend-client.js"]');
  const apiBase = new URL("../../api/", script?.src || window.location.href).toString();

  const isConfigured = () => window.location.protocol.startsWith("http");

  const normalizeText = (value) =>
    (value || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const escapeHtml = (value) =>
    (value || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch (error) {
        return value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const formatPrice = (value) => {
    const number = Number.parseFloat(value);
    if (!Number.isFinite(number)) return "";
    return `${new Intl.NumberFormat("es-ES").format(number)} EUR`;
  };

  const getBrandFilter = (brand) => {
    const value = normalizeText(brand);
    if (value.includes("bmw")) return "bmw";
    if (value.includes("audi")) return "audi";
    if (value.includes("mercedes")) return "mercedes";
    if (value.includes("volkswagen") || value.includes("gti")) return "volkswagen";
    return value.split(" ")[0] || "";
  };

  const getModelFilter = (value) => normalizeText(value).replace(/[\/,]+/g, " ");

  const normalizeProductRecord = (record) => ({
    ...record,
    id: record.id?.toString() || "",
    slug: record.slug || "",
    precio: Number.parseFloat(record.precio || "0") || 0,
    precio_anterior: record.precio_anterior === null || record.precio_anterior === undefined ? null : Number.parseFloat(record.precio_anterior),
    stock: Number.parseInt(record.stock || "0", 10) || 0,
    activo: Boolean(Number(record.activo)),
    galeria: toArray(record.galeria),
    acabados: toArray(record.acabados),
    compatibilidad: toArray(record.compatibilidad),
    especificaciones: toArray(record.especificaciones),
  });

  const mapProduct = (record) => {
    const normalized = normalizeProductRecord(record);
    const gallery = normalized.galeria;
    const mainImage = normalized.imagen_principal || gallery[0] || "assets/img/logo_cdp_transparente.png";
    const finishes = normalized.acabados.length ? normalized.acabados : toArray(normalized.material);
    const fitment = normalized.compatibilidad.length ? normalized.compatibilidad : toArray(normalized.modelo);
    const specs = normalized.especificaciones;
    const brand = normalized.marca || "";
    const model = normalized.modelo || "";
    const title = normalized.nombre || "";
    const price = formatPrice(normalized.precio);
    const oldPrice = formatPrice(normalized.precio_anterior);

    return {
      id: normalized.slug || normalized.id,
      badge: normalized.etiqueta || "Nuevo",
      brand,
      brandFilter: normalized.marca_filtro || getBrandFilter(brand),
      model,
      modelFilter: normalized.modelo_filtro || getModelFilter(`${brand} ${model}`),
      title,
      price,
      oldPrice,
      priceNumber: normalized.precio,
      rating: normalized.valoracion || "4.8",
      summary: normalized.descripcion || "",
      fitSummary: normalized.descripcion_corta || finishes.join(" - "),
      finishes,
      fitment,
      specs,
      gallery: [mainImage, ...gallery.filter((image) => image !== mainImage)],
      material: normalizeText(normalized.material || finishes.join(" ")),
      color: normalizeText(normalized.color || ""),
      tags: normalizeText(normalized.tags || `${brand} ${model} ${title} ${finishes.join(" ")}`),
    };
  };

  const getSession = () => {
    try {
      return JSON.parse(localStorage.getItem("cdp.admin.session") || "null");
    } catch (error) {
      return null;
    }
  };

  const saveSession = (data) => {
    const session = {
      user: data.user,
      authenticated: Boolean(data.authenticated),
      saved_at: Date.now(),
    };
    localStorage.setItem("cdp.admin.session", JSON.stringify(session));
    return session;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(new URL(path.replace(/^\//, ""), apiBase), {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (error) {
      data = { error: text || "Respuesta no valida del servidor PHP." };
    }

    if (!response.ok) {
      throw new Error(data?.error || `Error PHP ${response.status}`);
    }

    return data;
  };

  const login = async (email, password) => saveSession(await request("login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }));

  const logout = () => {
    localStorage.removeItem("cdp.admin.session");
    request("logout.php", { method: "POST", body: "{}" }).catch(() => {});
  };

  const listProducts = async () =>
    request("productos.php").then((response) => (response.data || []).map(mapProduct));

  const listProductsAdmin = async () =>
    request("productos.php?admin=1").then((response) => (response.data || []).map(normalizeProductRecord));

  const getProductBySlug = async (slug) =>
    request(`productos.php?slug=${encodeURIComponent(slug)}`).then((response) => (response.data ? mapProduct(response.data) : null));

  const createSolicitud = async (payload) =>
    request("solicitudes.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const listSolicitudes = async () =>
    request("solicitudes.php").then((response) => response.data || []);

  const createProduct = async (payload) =>
    request("productos.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const updateProduct = async (id, payload) =>
    request(`productos.php?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

  const deleteProduct = async (id) =>
    request(`productos.php?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

  const backend = {
    createSolicitud,
    createProduct,
    deleteProduct,
    escapeHtml,
    getProductBySlug,
    getSession,
    isConfigured,
    listProductsAdmin,
    listProducts,
    listSolicitudes,
    login,
    logout,
    mapProduct,
    updateProduct,
  };

  window.CDPBackend = backend;
})();
