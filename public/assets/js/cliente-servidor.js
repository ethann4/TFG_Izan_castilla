(function () {
  const scriptsDoc = Array.from(document.scripts || []);
  const scriptActual = document.currentScript || scriptsDoc.find((nodo) => nodo.src.includes("assets/js/cliente-servidor.js"));
  const baseApi = scriptActual?.src
    ? new URL("../../api/", scriptActual.src).toString()
    : new URL("api/", window.location.href).toString();

  const estaConfigurado = () => window.location.protocol.startsWith("http");

  const normalizarTexto = (valor) =>
    (valor || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();

  const escaparHtml = (valor) =>
    (valor || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const aArreglo = (valor) => {
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (!valor) return [];
    if (typeof valor === "string") {
      try {
        const parseado = JSON.parse(valor);
        if (Array.isArray(parseado)) return parseado.filter(Boolean);
      } catch (error) {
        return valor
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }
    return [];
  };

  const formatearPrecio = (valor) => {
    const numero = Number.parseFloat(valor);
    if (!Number.isFinite(numero)) return "";
    return `${new Intl.NumberFormat("es-ES").format(numero)} EUR`;
  };

  const obtenerFiltroMarca = (marca) => {
    const valor = normalizarTexto(marca);
    if (valor.includes("bmw")) return "bmw";
    if (valor.includes("audi")) return "audi";
    if (valor.includes("mercedes")) return "mercedes";
    if (valor.includes("volkswagen") || valor.includes("gti")) return "volkswagen";
    return valor.split(" ")[0] || "";
  };

  const obtenerFiltroModelo = (valor) => normalizarTexto(valor).replace(/[\/,]+/g, " ");

  const normalizarRegistroProducto = (registro) => ({
    ...registro,
    id: registro.id?.toString() || "",
    slug: registro.slug || "",
    precio: Number.parseFloat(registro.precio || "0") || 0,
    precio_anterior: registro.precio_anterior === null || registro.precio_anterior === undefined ? null : Number.parseFloat(registro.precio_anterior),
    stock: Number.parseInt(registro.stock || "0", 10) || 0,
    activo: Boolean(Number(registro.activo)),
    habilitar_color_detalle: Boolean(Number(registro.habilitar_color_detalle || 0)),
    galeria: aArreglo(registro.galeria),
    acabados: aArreglo(registro.acabados),
    compatibilidad: aArreglo(registro.compatibilidad),
    especificaciones: aArreglo(registro.especificaciones),
  });

  const mapearProducto = (registro) => {
    const normalizado = normalizarRegistroProducto(registro);
    const galeria = normalizado.galeria;
    const imagenPrincipal = normalizado.imagen_principal || galeria[0] || "assets/img/logo_cdp_transparente.png";
    const acabados = normalizado.acabados.length ? normalizado.acabados : aArreglo(normalizado.material);
    const compatibilidad = normalizado.compatibilidad.length ? normalizado.compatibilidad : aArreglo(normalizado.modelo);
    const especificaciones = normalizado.especificaciones;
    const marca = normalizado.marca || "";
    const modelo = normalizado.modelo || "";
    const titulo = normalizado.nombre || "";
    const precio = formatearPrecio(normalizado.precio);
    const precioAnterior = formatearPrecio(normalizado.precio_anterior);

    return {
      id: normalizado.slug || normalizado.id,
      badge: normalizado.etiqueta || "Nuevo",
      brand: marca,
      brandFilter: normalizado.marca_filtro || obtenerFiltroMarca(marca),
      model: modelo,
      modelFilter: normalizado.modelo_filtro || obtenerFiltroModelo(`${marca} ${modelo}`),
      title: titulo,
      price: precio,
      oldPrice: precioAnterior,
      priceNumber: normalizado.precio,
      rating: normalizado.valoracion || "4.8",
      summary: normalizado.descripcion || "",
      fitSummary: normalizado.descripcion_corta || acabados.join(" - "),
      finishes: acabados,
      fitment: compatibilidad,
      specs: especificaciones,
      gallery: [imagenPrincipal, ...galeria.filter((imagen) => imagen !== imagenPrincipal)],
      material: normalizarTexto(normalizado.material || acabados.join(" ")),
      color: normalizarTexto(normalizado.color || ""),
      tags: normalizarTexto(normalizado.tags || `${marca} ${modelo} ${titulo} ${acabados.join(" ")}`),
      habilitar_color_detalle: normalizado.habilitar_color_detalle,
    };
  };

  // Limpieza unica al cargar el script de cualquier cache de sesion
  // que hubiese quedado en localStorage de versiones anteriores.
  try {
    localStorage.removeItem("cdp.admin.session");
    localStorage.removeItem("cdp.customer.session");
  } catch (error) { /* navegador sin localStorage */ }

  // Stub legacy: ya no leemos sesion del localStorage, todo se delega
  // a la cookie HttpOnly del servidor. Devolvemos null para no romper
  // codigo antiguo que aun llame a getSession().
  const obtenerSesion = () => null;

  // La sesion ya no se replica en localStorage por seguridad (XSS).
  // El estado canonico vive en la cookie HttpOnly del servidor PHP.
  // Esta funcion existe solo para devolver el payload normalizado.
  const guardarSesion = (datos) => ({
    user: datos.user,
    authenticated: Boolean(datos.authenticated),
    saved_at: Date.now(),
  });

  const leerCsrfDeCookie = () => {
    const entrada = document.cookie.split("; ").find((c) => c.startsWith("cdp_csrf="));
    return entrada ? decodeURIComponent(entrada.slice("cdp_csrf=".length)) : "";
  };

  const peticion = async (ruta, opciones = {}) => {
    if (!window.location.protocol.startsWith("http")) {
      throw new Error("Abre la web desde XAMPP con http://localhost/CDP-Wheels/public/cuenta.html. Si abres el HTML como archivo, PHP no puede funcionar.");
    }

    const endpoint = new URL(ruta.replace(/^\//, ""), baseApi);
    const metodo = (opciones.method || "GET").toUpperCase();
    const esMutador = !["GET", "HEAD", "OPTIONS"].includes(metodo);
    let respuesta = null;

    // Si no tenemos token CSRF y vamos a hacer un mutador, primero
    // pedimos al backend que lo emita (cualquier GET sirve para que el
    // bootstrap publique la cookie).
    if (esMutador && !leerCsrfDeCookie()) {
      try {
        await fetch(new URL("session.php", baseApi), { credentials: "same-origin" });
      } catch (error) { /* el siguiente fetch fallara con mensaje claro */ }
    }

    try {
      respuesta = await fetch(endpoint, {
        credentials: "same-origin",
        ...opciones,
        headers: {
          "Content-Type": "application/json",
          ...(esMutador ? { "X-CSRF-Token": leerCsrfDeCookie() } : {}),
          ...(opciones.headers || {}),
        },
      });
    } catch (error) {
      throw new Error(`No se pudo conectar con el servidor PHP en ${endpoint.href}. Abre la web desde http://localhost/CDP-Wheels/public/ y revisa Apache en XAMPP.`);
    }

    const texto = await respuesta.text();
    let datos = null;

    try {
      datos = texto ? JSON.parse(texto) : null;
    } catch (error) {
      datos = {
        error: texto.trim().startsWith("<")
          ? `No se encontro el endpoint PHP: ${endpoint.pathname}`
          : texto || "Respuesta no valida del servidor PHP.",
      };
    }

    if (!respuesta.ok) {
      throw new Error(datos?.error || `Error PHP ${respuesta.status}`);
    }

    return datos;
  };

  const iniciarSesionAdmin = async (email, password) => guardarSesion(await peticion("login.php", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }));

  const obtenerSesionAdmin = () =>
    peticion("session.php")
      .then((datos) => (datos.authenticated ? guardarSesion(datos) : null))
      .catch(() => null);

  const cerrarSesionAdmin = async () =>
    peticion("logout.php", { method: "POST", body: "{}" }).catch(() => ({ ok: true }));

  const obtenerSesionCliente = () =>
    peticion("cliente_session.php")
      .then((datos) => datos)
      .catch(() => ({ authenticated: false, user: null }));

  // Compatibilidad legacy con codigo antiguo que llamaba a
  // getStoredCustomerSession(): forzamos a que vaya al servidor.
  const obtenerSesionClienteGuardada = () => null;

  const registrarCliente = async (payload) =>
    peticion("cliente_registro.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const iniciarSesionCliente = async (email, password) =>
    peticion("cliente_login.php", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

  const cerrarSesionCliente = async () =>
    peticion("cliente_logout.php", { method: "POST", body: "{}" }).catch(() => ({ ok: true }));

  const cambiarPasswordCliente = async (passwordActual, passwordNueva) =>
    peticion("cliente_password.php", {
      method: "POST",
      body: JSON.stringify({ password_actual: passwordActual, password_nueva: passwordNueva }),
    });

  const solicitarRecuperacionPassword = async (email) =>
    peticion("cliente_recuperar.php", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

  const restablecerPasswordCliente = async (token, password) =>
    peticion("cliente_restablecer.php", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

  const checkoutProcesar = async (payload) =>
    peticion("checkout.php?accion=procesar", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const checkoutPreview = async (payload) =>
    peticion("checkout.php?accion=preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const adminTotpEstado = async () => peticion("admin_totp.php?accion=estado");

  const adminTotpIniciar = async () =>
    peticion("admin_totp.php?accion=iniciar", { method: "POST", body: "{}" });

  const adminTotpVerificar = async (codigo) =>
    peticion("admin_totp.php?accion=verificar", {
      method: "POST",
      body: JSON.stringify({ codigo }),
    });

  const adminTotpDesactivar = async (password) =>
    peticion("admin_totp.php?accion=desactivar", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

  // Helper generico para que admin/seguridad.html pueda hacer GET sin
  // exponer la funcion privada peticion(). Devuelve el JSON tal cual.
  const fetchJson = async (ruta) => peticion(ruta);

  const obtenerAccesoAdminCliente = async () =>
    peticion("cliente_admin.php").catch(() => ({
      has_admin_access: false,
      admin_authenticated: false,
    }));

  const obtenerCesta = async () => peticion("carrito.php");

  const anadirItemCesta = async (slug, cantidad = 1) =>
    peticion("carrito.php", {
      method: "POST",
      body: JSON.stringify({ slug, cantidad }),
    });

  const actualizarItemCesta = async (itemId, cantidad) =>
    peticion("carrito.php", {
      method: "PATCH",
      body: JSON.stringify({ item_id: itemId, cantidad }),
    });

  const quitarItemCesta = async (itemId) =>
    peticion("carrito.php", {
      method: "DELETE",
      body: JSON.stringify({ item_id: itemId }),
    });

  const vaciarCesta = async () =>
    peticion("carrito.php", {
      method: "DELETE",
      body: JSON.stringify({ all: true }),
    });

  const listarProductos = async () =>
    peticion("productos.php").then((respuesta) => (respuesta.data || []).map(mapearProducto));

  const listarProductosAdmin = async () =>
    peticion("productos.php?admin=1").then((respuesta) => (respuesta.data || []).map(normalizarRegistroProducto));

  const obtenerProductoPorSlug = async (slug) =>
    peticion(`productos.php?slug=${encodeURIComponent(slug)}`).then((respuesta) => (respuesta.data ? mapearProducto(respuesta.data) : null));

  const crearSolicitud = async (payload) =>
    peticion("solicitudes.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const actualizarSolicitud = async (id, estado) =>
    peticion("solicitudes.php", {
      method: "PATCH",
      body: JSON.stringify({ id, estado }),
    });

  const listarSolicitudes = async () =>
    peticion("solicitudes.php").then((respuesta) => respuesta.data || []);

  const guardarVolanteGenerado = async (payload) =>
    peticion("volantes_generados.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const listarVolantesGenerados = async () =>
    peticion("volantes_generados.php").then((respuesta) => respuesta.data || []);

  const listarVolantesAdmin = async () =>
    peticion("admin_volantes.php").then((respuesta) => respuesta.data || []);

  const detectarDuplicados = async () =>
    peticion("admin_duplicados.php").then((respuesta) => respuesta.data || []);

  const limpiarDuplicados = async () =>
    peticion("admin_duplicados.php", { method: "POST" });

  const listarClientesAdmin = async () =>
    peticion("admin_clientes.php").then((respuesta) => respuesta.data || []);

  const actualizarClienteActivo = async (id, activo) =>
    peticion("admin_clientes.php", {
      method: "PATCH",
      body: JSON.stringify({ id, activo }),
    });

  const crearProducto = async (payload) =>
    peticion("productos.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const actualizarProducto = async (id, payload) =>
    peticion(`productos.php?id=${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

  const eliminarProducto = async (id) =>
    peticion(`productos.php?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

  const backend = {
    addCartItem: anadirItemCesta,
    clearCart: vaciarCesta,
    createSolicitud: crearSolicitud,
    createProduct: crearProducto,
    deleteProduct: eliminarProducto,
    escapeHtml: escaparHtml,
    getCart: obtenerCesta,
    getCustomerAdminAccess: obtenerAccesoAdminCliente,
    getProductBySlug: obtenerProductoPorSlug,
    getAdminSession: obtenerSesionAdmin,
    getCustomerSession: obtenerSesionCliente,
    getSession: obtenerSesion,
    getStoredCustomerSession: obtenerSesionClienteGuardada,
    isConfigured: estaConfigurado,
    guardarVolanteGenerado,
    listarVolantesGenerados,
    listAdminVolantes: listarVolantesAdmin,
    listAdminClientes: listarClientesAdmin,
    updateClienteActivo: actualizarClienteActivo,
    detectarDuplicados,
    limpiarDuplicados,
    listProductsAdmin: listarProductosAdmin,
    listProducts: listarProductos,
    listSolicitudes: listarSolicitudes,
    login: iniciarSesionAdmin,
    loginCustomer: iniciarSesionCliente,
    logout: cerrarSesionAdmin,
    logoutCustomer: cerrarSesionCliente,
    changeCustomerPassword: cambiarPasswordCliente,
    requestPasswordReset: solicitarRecuperacionPassword,
    resetCustomerPassword: restablecerPasswordCliente,
    checkout: checkoutProcesar,
    checkoutPreview,
    adminTotpEstado,
    adminTotpIniciar,
    adminTotpVerificar,
    adminTotpDesactivar,
    fetchJson,
    mapProduct: mapearProducto,
    registerCustomer: registrarCliente,
    removeCartItem: quitarItemCesta,
    updateCartItem: actualizarItemCesta,
    updateProduct: actualizarProducto,
    updateSolicitud: actualizarSolicitud,
  };

  window.CDPBackend = backend;
})();
