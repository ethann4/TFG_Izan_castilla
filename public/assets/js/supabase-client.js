(function () {
  const config = window.CDP_SUPABASE || {};
  const baseUrl = (config.url || "").replace(/\/$/, "");
  const anonKey = config.anonKey || "";

  const isConfigured = () => Boolean(baseUrl && anonKey);

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
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
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

  const mapProduct = (record) => {
    const gallery = toArray(record.galeria || record.gallery);
    const mainImage = record.imagen_principal || record.main_image || gallery[0] || "assets/img/logo_cdp_transparente.png";
    const finishes = toArray(record.acabados || record.finishes || record.material);
    const fitment = toArray(record.compatibilidad || record.fitment || record.modelo);
    const specs = toArray(record.especificaciones || record.specs);
    const brand = record.marca || record.brand || "";
    const model = record.modelo || record.model || "";
    const title = record.nombre || record.title || record.name || "";
    const price = formatPrice(record.precio || record.price);
    const oldPrice = formatPrice(record.precio_anterior || record.old_price);

    return {
      id: record.slug || record.id,
      badge: record.etiqueta || record.badge || "Nuevo",
      brand,
      brandFilter: record.marca_filtro || getBrandFilter(brand),
      model,
      modelFilter: record.modelo_filtro || getModelFilter(`${brand} ${model}`),
      title,
      price,
      oldPrice,
      priceNumber: Number.parseFloat(record.precio || record.price || "0") || 0,
      rating: record.valoracion || record.rating || "4.8",
      summary: record.resumen || record.summary || record.descripcion || "",
      fitSummary: record.descripcion_corta || record.fit_summary || finishes.join(" - "),
      finishes,
      fitment,
      specs,
      gallery: [mainImage, ...gallery.filter((image) => image !== mainImage)],
      material: normalizeText(record.material || finishes.join(" ")),
      color: normalizeText(record.color || record.colores || ""),
      tags: normalizeText(record.tags || `${brand} ${model} ${title} ${finishes.join(" ")}`),
    };
  };

  const request = async (path, options = {}) => {
    if (!isConfigured()) throw new Error("Supabase no esta configurado.");
    const { accessToken, useSession, ...fetchOptions } = options;
    const session = useSession ? getSession() : null;
    const authToken = accessToken || session?.access_token || anonKey;

    const response = await fetch(`${baseUrl}${path}`, {
      ...fetchOptions,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(fetchOptions.headers || {}),
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Error Supabase ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  };

  const getSession = () => {
    try {
      const session = JSON.parse(localStorage.getItem("cdp.admin.session") || "null");
      if (!session?.access_token) return null;
      if (session.expires_at && session.expires_at <= Date.now()) {
        localStorage.removeItem("cdp.admin.session");
        return null;
      }
      return session;
    } catch (error) {
      return null;
    }
  };

  const saveSession = (data) => {
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
      expires_at: Date.now() + ((data.expires_in || 3600) - 60) * 1000,
    };
    localStorage.setItem("cdp.admin.session", JSON.stringify(session));
    return session;
  };

  const login = async (email, password) => {
    if (!isConfigured()) throw new Error("Supabase no esta configurado.");
    const response = await fetch(`${baseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "No se pudo iniciar sesion.");
    }

    return saveSession(await response.json());
  };

  const logout = () => {
    localStorage.removeItem("cdp.admin.session");
  };

  const listProducts = async () =>
    request("/rest/v1/productos?select=*&activo=eq.true&order=creado_en.desc").then((records) => records.map(mapProduct));

  const listProductsAdmin = async () =>
    request("/rest/v1/productos?select=*&order=creado_en.desc", { useSession: true });

  const getProductBySlug = async (slug) => {
    const records = await request(`/rest/v1/productos?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`);
    return records[0] ? mapProduct(records[0]) : null;
  };

  const createSolicitud = async (payload) =>
    request("/rest/v1/solicitudes", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const listSolicitudes = async () =>
    request("/rest/v1/solicitudes?select=*&order=creado_en.desc", { useSession: true });

  const createProduct = async (payload) =>
    request("/rest/v1/productos", {
      method: "POST",
      body: JSON.stringify(payload),
      useSession: true,
    });

  const updateProduct = async (id, payload) =>
    request(`/rest/v1/productos?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      useSession: true,
    });

  const deleteProduct = async (id) =>
    request(`/rest/v1/productos?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      useSession: true,
    });

  window.CDPSupabase = {
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
})();
