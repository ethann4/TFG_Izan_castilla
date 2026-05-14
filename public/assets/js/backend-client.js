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

  const getAdminSession = () =>
    request("session.php")
      .then((data) => {
        if (data.authenticated) {
          return saveSession(data);
        }

        localStorage.removeItem("cdp.admin.session");
        return null;
      })
      .catch(() => {
        localStorage.removeItem("cdp.admin.session");
        return null;
      });

  const logout = async () => {
    localStorage.removeItem("cdp.admin.session");
    return request("logout.php", { method: "POST", body: "{}" }).catch(() => ({ ok: true }));
  };

  const getCustomerSession = () =>
    request("cliente_session.php")
      .then((data) => {
        if (data.authenticated) {
          localStorage.setItem("cdp.customer.session", JSON.stringify({
            user: data.user,
            authenticated: true,
            saved_at: Date.now(),
          }));
        } else {
          localStorage.removeItem("cdp.customer.session");
        }
        return data;
      })
      .catch(() => {
        localStorage.removeItem("cdp.customer.session");
        return { authenticated: false, user: null };
      });

  const getStoredCustomerSession = () => {
    try {
      return JSON.parse(localStorage.getItem("cdp.customer.session") || "null");
    } catch (error) {
      return null;
    }
  };

  const registerCustomer = async (payload) => {
    const data = await request("cliente_registro.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.removeItem("cdp.admin.session");
    localStorage.setItem("cdp.customer.session", JSON.stringify({
      user: data.user,
      authenticated: Boolean(data.authenticated),
      saved_at: Date.now(),
    }));
    return data;
  };

  const loginCustomer = async (email, password) => {
    const data = await request("cliente_login.php", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.removeItem("cdp.admin.session");
    localStorage.setItem("cdp.customer.session", JSON.stringify({
      user: data.user,
      authenticated: Boolean(data.authenticated),
      saved_at: Date.now(),
    }));
    return data;
  };

  const logoutCustomer = async () => {
    localStorage.removeItem("cdp.customer.session");
    return request("cliente_logout.php", { method: "POST", body: "{}" }).catch(() => ({ ok: true }));
  };

  const getCustomerAdminAccess = async () =>
    request("cliente_admin.php").catch(() => ({
      has_admin_access: false,
      admin_authenticated: false,
    }));

  const getCart = async () => request("carrito.php");

  const addCartItem = async (slug, cantidad = 1) =>
    request("carrito.php", {
      method: "POST",
      body: JSON.stringify({ slug, cantidad }),
    });

  const updateCartItem = async (itemId, cantidad) =>
    request("carrito.php", {
      method: "PATCH",
      body: JSON.stringify({ item_id: itemId, cantidad }),
    });

  const removeCartItem = async (itemId) =>
    request("carrito.php", {
      method: "DELETE",
      body: JSON.stringify({ item_id: itemId }),
    });

  const clearCart = async () =>
    request("carrito.php", {
      method: "DELETE",
      body: JSON.stringify({ all: true }),
    });

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
    addCartItem,
    clearCart,
    createSolicitud,
    createProduct,
    deleteProduct,
    escapeHtml,
    getCart,
    getCustomerAdminAccess,
    getProductBySlug,
    getAdminSession,
    getCustomerSession,
    getSession,
    getStoredCustomerSession,
    isConfigured,
    listProductsAdmin,
    listProducts,
    listSolicitudes,
    login,
    loginCustomer,
    logout,
    logoutCustomer,
    mapProduct,
    registerCustomer,
    removeCartItem,
    updateCartItem,
    updateProduct,
  };

  window.CDPBackend = backend;
})();
