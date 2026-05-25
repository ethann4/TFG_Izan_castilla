(function () {
  const backend = window.CDPBackend;
  const panelAdmin = document.querySelector("[data-admin-dashboard]");
  const botonSalir = document.querySelector("[data-admin-logout]");
  const chipSesion = document.querySelector("[data-admin-session]");
  const formularioProducto = document.querySelector("[data-product-form]");
  const estadoProducto = document.querySelector("[data-product-status]");
  const tablaProductos = document.querySelector("[data-products-table]");
  const tablaSolicitudes = document.querySelector("[data-requests-table]");
  const tablaClientes = document.querySelector("[data-clientes-table]");
  const rejillaVolantes = document.querySelector("[data-volantes-grid]");
  const tituloFormularioProducto = document.querySelector("[data-product-form-title]");
  const estadoImportarProductos = document.querySelector("[data-import-products-status]");
  const productosPreparados = Array.isArray(window.CDP_PRODUCTOS_PREPARADOS) ? window.CDP_PRODUCTOS_PREPARADOS : [];
  const urlLoginCuenta = "../cuenta.html?admin=1";

  let productos = [];
  let solicitudes = [];
  let volantes = [];
  let clientes = [];
  let sesionAdmin = null;

  const filtros = {
    productos: { consulta: "", estado: "" },
    solicitudes: { consulta: "", estado: "" },
    volantes: { consulta: "", estado: "" },
    clientes: { consulta: "", estado: "" },
  };

  const mostrarEstado = (nodo, mensaje, tipo = "info") => {
    if (!nodo) return;
    nodo.hidden = false;
    nodo.className = `admin-status is-${tipo}`;
    nodo.textContent = mensaje;
  };

  const ocultarEstado = (nodo) => {
    if (nodo) nodo.hidden = true;
  };

  const escaparHtml = (valor) => backend?.escapeHtml(valor) || "";

  const aSlug = (valor) =>
    (valor || "")
      .toString()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const parsearLista = (valor) =>
    (valor || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

  const formatearDinero = (valor) => {
    const numero = Number.parseFloat(valor);
    if (!Number.isFinite(numero)) return "";
    return `${new Intl.NumberFormat("es-ES").format(numero)} EUR`;
  };

  const formatearFecha = (valor) => {
    if (!valor) return "";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleDateString("es-ES");
  };

  const formatearFechaHora = (valor) => {
    if (!valor) return "Nunca";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "Nunca";
    return fecha.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  };

  const parsearJson = (valor) => {
    if (!valor) return {};
    if (typeof valor === "object") return valor;

    try {
      const parseado = JSON.parse(valor);
      return parseado && typeof parseado === "object" ? parseado : {};
    } catch (error) {
      return {};
    }
  };

  const formatearEstado = (valor) => {
    const estado = (valor || "pendiente").toString().replace(/_/g, " ");
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const claseEstado = (valor) => {
    if (valor === "confirmada") return "bg-success";
    if (valor === "rechazada") return "bg-secondary";
    if (valor === "solicitud_enviada") return "bg-info text-dark";
    return "bg-warning text-dark";
  };

  const coincideConsulta = (item, consulta, claves) => {
    if (!consulta) return true;
    const aguja = consulta.toLowerCase();
    return claves.some((clave) => (item[clave] || "").toString().toLowerCase().includes(aguja));
  };

  const IMAGEN_RELLENO = "../assets/img/logo_cdp_transparente.png";

  const resolverRutaImagen = (ruta) => {
    if (!ruta) return IMAGEN_RELLENO;
    const valor = ruta.toString().trim();
    if (!valor) return IMAGEN_RELLENO;
    if (/^(https?:|data:|\/\/|\/)/i.test(valor)) return valor;
    if (valor.startsWith("../")) return valor;
    return `../${valor}`;
  };

  const obtenerSesion = () => sesionAdmin;
  const normalizarSlug = (valor) => (valor || "").toString().toLowerCase();

  const buscarProductoExistente = (productoPreparado) => {
    const slug = normalizarSlug(productoPreparado.slug);
    return productos.find((producto) => producto.slug === productoPreparado.slug) || productos.find((producto) => normalizarSlug(producto.slug) === slug);
  };

  const actualizarContadores = () => {
    document.querySelectorAll("[data-products-count-side]").forEach((nodo) => { nodo.textContent = productos.length; });
    document.querySelectorAll("[data-requests-count-side]").forEach((nodo) => { nodo.textContent = solicitudes.length; });
    document.querySelectorAll("[data-volantes-count-side]").forEach((nodo) => { nodo.textContent = volantes.length; });
    document.querySelectorAll("[data-clientes-count-side]").forEach((nodo) => { nodo.textContent = clientes.length; });
  };

  const actualizarKpis = () => {
    const productosActivos = productos.filter((p) => p.activo).length;
    const sinStock = productos.filter((p) => Number(p.stock) <= 0).length;
    const valorCatalogo = productos.filter((p) => p.activo).reduce((acc, p) => acc + (Number(p.precio) || 0), 0);
    const pendientes = solicitudes.filter((r) => r.estado === "pendiente").length;
    const volantesEnviados = volantes.filter((v) => v.estado === "solicitud_enviada").length;
    const clientesActivos = clientes.filter((c) => Number(c.activo) === 1).length;

    const poner = (selector, valor) => {
      const nodo = document.querySelector(selector);
      if (nodo) nodo.textContent = valor;
    };

    poner("[data-kpi-products]", productos.length);
    poner("[data-kpi-products-active]", `${productosActivos} activos`);
    poner("[data-kpi-requests]", solicitudes.length);
    poner("[data-kpi-requests-pending]", `${pendientes} pendientes`);
    poner("[data-kpi-volantes]", volantes.length);
    poner("[data-kpi-volantes-enviados]", `${volantesEnviados} con solicitud`);
    poner("[data-kpi-clientes]", clientes.length);
    poner("[data-kpi-clientes-activos]", `${clientesActivos} activos`);
    poner("[data-kpi-valor]", formatearDinero(valorCatalogo));
    poner("[data-kpi-sinstock]", sinStock);
  };

  const renderizarPanelSolicitudes = () => {
    const nodo = document.querySelector("[data-dashboard-requests]");
    if (!nodo) return;
    if (!solicitudes.length) {
      nodo.innerHTML = '<p class="admin-block__empty">Sin solicitudes todavia.</p>';
      return;
    }
    nodo.innerHTML = solicitudes.slice(0, 5).map((sol) => `
      <div class="admin-list-item">
        <div>
          <strong>${escaparHtml(sol.nombre)}</strong>
          <small>${escaparHtml(sol.modelo_coche || sol.email || "")} &middot; ${formatearFecha(sol.creado_en)}</small>
        </div>
        <span class="badge ${claseEstado(sol.estado)}">${escaparHtml(formatearEstado(sol.estado))}</span>
      </div>
    `).join("");
  };

  const renderizarPanelVolantes = () => {
    const nodo = document.querySelector("[data-dashboard-volantes]");
    if (!nodo) return;
    if (!volantes.length) {
      nodo.innerHTML = '<p class="admin-block__empty">Aun no hay volantes generados.</p>';
      return;
    }
    nodo.innerHTML = volantes.slice(0, 5).map((vol) => `
      <div class="admin-list-item">
        <div>
          <strong>${escaparHtml(vol.titulo || `${vol.marca || ""} ${vol.modelo || ""}`)}</strong>
          <small>${escaparHtml(vol.cliente_nombre || vol.cliente_email || "Cliente")} &middot; ${formatearFecha(vol.creado_en)}</small>
        </div>
        <span class="badge ${claseEstado(vol.estado)}">${escaparHtml(formatearEstado(vol.estado))}</span>
      </div>
    `).join("");
  };

  const renderizarPanelClientes = () => {
    const nodo = document.querySelector("[data-dashboard-clientes]");
    if (!nodo) return;
    if (!clientes.length) {
      nodo.innerHTML = '<p class="admin-block__empty">Aun no hay clientes registrados.</p>';
      return;
    }
    nodo.innerHTML = clientes.slice(0, 5).map((cli) => `
      <div class="admin-list-item">
        <div>
          <strong>${escaparHtml(cli.nombre || "Cliente")}</strong>
          <small>${escaparHtml(cli.email || "")} &middot; ${formatearFecha(cli.creado_en)}</small>
        </div>
        <span class="badge ${Number(cli.activo) === 1 ? "bg-success" : "bg-secondary"}">${Number(cli.activo) === 1 ? "Activo" : "Inactivo"}</span>
      </div>
    `).join("");
  };

  const activarPestana = (nombrePestana) => {
    document.querySelectorAll("[data-admin-tab]").forEach((boton) => {
      boton.classList.toggle("is-active", boton.dataset.adminTab === nombrePestana);
    });
    document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.adminPanel === nombrePestana);
    });
  };

  const obtenerPayload = () => {
    const datosForm = new FormData(formularioProducto);
    const leer = (nombre) => datosForm.get(nombre)?.toString().trim() || "";
    const numeroOnull = (nombre) => {
      const valor = leer(nombre);
      return valor ? Number.parseFloat(valor) : null;
    };

    return {
      slug: leer("slug"),
      marca: leer("marca"),
      marca_filtro: leer("marca_filtro"),
      modelo: leer("modelo"),
      modelo_filtro: leer("modelo_filtro"),
      nombre: leer("nombre"),
      descripcion: leer("descripcion"),
      descripcion_corta: leer("descripcion_corta"),
      material: leer("material"),
      color: leer("color"),
      habilitar_color_detalle: datosForm.has("habilitar_color_detalle"),
      precio: Number.parseFloat(leer("precio")) || 0,
      precio_anterior: numeroOnull("precio_anterior"),
      etiqueta: leer("etiqueta") || "Nuevo",
      valoracion: leer("valoracion") || "4.8",
      imagen_principal: leer("imagen_principal"),
      galeria: parsearLista(leer("galeria")),
      acabados: parsearLista(leer("acabados")),
      compatibilidad: parsearLista(leer("compatibilidad")),
      especificaciones: parsearLista(leer("especificaciones")),
      tags: leer("tags"),
      stock: Number.parseInt(leer("stock") || "0", 10),
      activo: datosForm.has("activo"),
      actualizado_en: new Date().toISOString(),
    };
  };

  const rellenarFormularioProducto = (producto) => {
    if (!formularioProducto) return;
    const poner = (nombre, valor) => {
      const input = formularioProducto.elements[nombre];
      if (!input) return;
      if (input.type === "checkbox") input.checked = Boolean(valor);
      else input.value = valor ?? "";
    };

    poner("id", producto.id);
    poner("slug", producto.slug);
    poner("marca", producto.marca);
    poner("marca_filtro", producto.marca_filtro);
    poner("modelo", producto.modelo);
    poner("modelo_filtro", producto.modelo_filtro);
    poner("nombre", producto.nombre);
    poner("descripcion", producto.descripcion);
    poner("descripcion_corta", producto.descripcion_corta);
    poner("material", producto.material);
    poner("color", producto.color);
    poner("precio", producto.precio);
    poner("precio_anterior", producto.precio_anterior);
    poner("etiqueta", producto.etiqueta);
    poner("valoracion", producto.valoracion);
    poner("imagen_principal", producto.imagen_principal);
    poner("habilitar_color_detalle", producto.habilitar_color_detalle);
    poner("galeria", (producto.galeria || []).join("\n"));
    poner("acabados", (producto.acabados || []).join("\n"));
    poner("compatibilidad", (producto.compatibilidad || []).join("\n"));
    poner("especificaciones", (producto.especificaciones || []).join("\n"));
    poner("tags", producto.tags);
    poner("stock", producto.stock);
    poner("activo", producto.activo);

    if (tituloFormularioProducto) tituloFormularioProducto.textContent = "Editar producto";
    activarPestana("producto");
    ocultarEstado(estadoProducto);
  };

  const resetearFormularioProducto = () => {
    formularioProducto?.reset();
    if (formularioProducto?.elements.id) formularioProducto.elements.id.value = "";
    if (formularioProducto?.elements.activo) formularioProducto.elements.activo.checked = true;
    if (formularioProducto?.elements.habilitar_color_detalle) formularioProducto.elements.habilitar_color_detalle.checked = false;
    if (formularioProducto?.elements.stock) formularioProducto.elements.stock.value = "1";
    if (tituloFormularioProducto) tituloFormularioProducto.textContent = "Crear producto";
    ocultarEstado(estadoProducto);
  };

  const filtrarProductos = () => {
    const { consulta, estado } = filtros.productos;
    return productos.filter((p) => {
      if (estado === "activo" && !p.activo) return false;
      if (estado === "inactivo" && p.activo) return false;
      if (estado === "sin-stock" && Number(p.stock) > 0) return false;
      return coincideConsulta(p, consulta, ["nombre", "slug", "marca", "modelo", "tags"]);
    });
  };

  const renderizarProductos = () => {
    if (!tablaProductos) return;
    const lista = filtrarProductos();
    if (!lista.length) {
      tablaProductos.innerHTML = '<tr><td colspan="6">Sin resultados.</td></tr>';
      return;
    }

    tablaProductos.innerHTML = lista.map((producto) => `
      <tr>
        <td>
          <div class="admin-product-cell">
            <div class="admin-product-thumb">
              <img src="${escaparHtml(resolverRutaImagen(producto.imagen_principal))}" alt="${escaparHtml(producto.nombre)}" loading="lazy" onerror="this.src='${IMAGEN_RELLENO}'">
            </div>
            <div>
              <strong>${escaparHtml(producto.nombre)}</strong>
              <small>${escaparHtml(producto.slug)}</small>
            </div>
          </div>
        </td>
        <td>${escaparHtml(producto.marca)}<br><small>${escaparHtml(producto.modelo || "")}</small></td>
        <td>${escaparHtml(formatearDinero(producto.precio))}</td>
        <td>${escaparHtml(producto.stock)}</td>
        <td><span class="badge ${producto.activo ? "bg-success" : "bg-secondary"}">${producto.activo ? "Activo" : "Inactivo"}</span></td>
        <td>
          <div class="admin-table-actions">
            <button class="admin-mini-btn" type="button" data-edit-product="${escaparHtml(producto.id)}">Editar</button>
            <button class="admin-mini-btn" type="button" data-toggle-product="${escaparHtml(producto.id)}">${producto.activo ? "Desactivar" : "Activar"}</button>
            <button class="admin-mini-btn is-danger" type="button" data-delete-product="${escaparHtml(producto.id)}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join("");
  };

  const filtrarSolicitudes = () => {
    const { consulta, estado } = filtros.solicitudes;
    return solicitudes.filter((r) => {
      if (estado && r.estado !== estado) return false;
      return coincideConsulta(r, consulta, ["nombre", "email", "telefono", "modelo_coche", "mensaje"]);
    });
  };

  const renderizarDisenoSolicitud = (solicitud) => {
    const resumen = parsearJson(solicitud.resumen_json);
    const imagen = solicitud.boceto_3d || "../assets/img/logo_cdp_transparente.png";
    const modelo = solicitud.modelo_coche || [resumen.marca, resumen.modelo].filter(Boolean).join(" ");
    const material = solicitud.material || [resumen.aro, resumen.agarres].filter(Boolean).join(" / ");

    return `
      <div class="admin-design-preview">
        <div class="admin-design-preview__image">
          <img src="${escaparHtml(imagen)}" alt="${escaparHtml(modelo || "Volante generado")}">
        </div>
        <div>
          <strong>${escaparHtml(modelo || "Volante configurado")}</strong>
          <small>${escaparHtml(material || "Configuracion 3D")}</small>
        </div>
      </div>
    `;
  };

  const renderizarBoton3dSolicitud = (solicitud) => {
    const configuracion = parsearJson(solicitud.configuracion_json);
    if (!Object.keys(configuracion).length) return "";

    const payload = { configuracion, resumen: parsearJson(solicitud.resumen_json) };
    const url = `../Creacionvirtual.html?panel=admin&configuracion=${encodeURIComponent(JSON.stringify(payload))}`;
    return `<a class="admin-mini-btn" href="${escaparHtml(url)}" target="_blank" rel="noreferrer">Ver 3D</a>`;
  };

  const renderizarEstadoSolicitud = (solicitud) => `
    <span class="badge ${claseEstado(solicitud.estado)}">${escaparHtml(formatearEstado(solicitud.estado))}</span>
    <div class="admin-table-actions mt-2">
      ${renderizarBoton3dSolicitud(solicitud)}
      <button class="admin-mini-btn" type="button" data-request-state-id="${escaparHtml(solicitud.id)}" data-request-state="confirmada">Confirmar</button>
      <button class="admin-mini-btn is-danger" type="button" data-request-state-id="${escaparHtml(solicitud.id)}" data-request-state="rechazada">Rechazar</button>
    </div>
  `;

  const renderizarSolicitudes = () => {
    if (!tablaSolicitudes) return;
    const lista = filtrarSolicitudes();
    if (!lista.length) {
      tablaSolicitudes.innerHTML = '<tr><td colspan="6">Sin resultados.</td></tr>';
      return;
    }

    tablaSolicitudes.innerHTML = lista.map((solicitud) => `
      <tr>
        <td>${renderizarDisenoSolicitud(solicitud)}</td>
        <td><strong>${escaparHtml(solicitud.nombre)}</strong><br><small>${formatearFecha(solicitud.creado_en)}</small></td>
        <td>${escaparHtml(solicitud.email)}<br><small>${escaparHtml(solicitud.telefono || "")}</small></td>
        <td>${escaparHtml(solicitud.presupuesto || "")}</td>
        <td>${escaparHtml(solicitud.mensaje || "").replace(/\n/g, "<br>")}</td>
        <td>${renderizarEstadoSolicitud(solicitud)}</td>
      </tr>
    `).join("");
  };

  const filtrarVolantes = () => {
    const { consulta, estado } = filtros.volantes;
    return volantes.filter((v) => {
      if (estado && v.estado !== estado) return false;
      return coincideConsulta(v, consulta, ["titulo", "marca", "modelo", "cliente_nombre", "cliente_email"]);
    });
  };

  const renderizarVolantes = () => {
    if (!rejillaVolantes) return;
    const lista = filtrarVolantes();
    if (!lista.length) {
      rejillaVolantes.innerHTML = '<p class="admin-block__empty">Sin volantes que coincidan con el filtro.</p>';
      return;
    }

    rejillaVolantes.innerHTML = lista.map((vol) => {
      const resumen = vol.resumen_json || parsearJson(vol.resumen_json);
      const imagen = vol.boceto_3d || "../assets/img/logo_cdp_transparente.png";
      const detalles = [
        resumen.aro ? `Aro ${resumen.aro}` : "",
        resumen.agarres ? `Agarres ${resumen.agarres}` : "",
        resumen.costuras ? `Costuras ${resumen.costuras}` : "",
      ].filter(Boolean).join(" &middot; ");
      const configuracion = vol.configuracion_json || parsearJson(vol.configuracion_json);
      const payload = { configuracion, resumen };
      const verUrl = `../Creacionvirtual.html?panel=admin&configuracion=${encodeURIComponent(JSON.stringify(payload))}`;

      return `
        <article class="admin-card">
          <div class="admin-card__image"><img src="${escaparHtml(imagen)}" alt="${escaparHtml(vol.titulo || "Volante")}"></div>
          <div class="admin-card__body">
            <h4 class="admin-card__title">${escaparHtml(vol.titulo || `${vol.marca || ""} ${vol.modelo || ""}`)}</h4>
            <span class="admin-card__client">${escaparHtml(vol.cliente_nombre || "Cliente")} &middot; ${escaparHtml(vol.cliente_email || "")}</span>
            <div class="admin-card__meta">
              <span><strong>${formatearDinero(vol.precio_total) || "0 EUR"}</strong></span>
              <span>${formatearFecha(vol.creado_en)}</span>
            </div>
            ${detalles ? `<div class="admin-card__meta"><span>${detalles}</span></div>` : ""}
            <div class="admin-card__footer">
              <span class="badge ${claseEstado(vol.estado)}">${escaparHtml(formatearEstado(vol.estado))}</span>
              <a class="admin-mini-btn" href="${escaparHtml(verUrl)}" target="_blank" rel="noreferrer">Ver 3D</a>
            </div>
          </div>
        </article>
      `;
    }).join("");
  };

  const filtrarClientes = () => {
    const { consulta, estado } = filtros.clientes;
    return clientes.filter((c) => {
      if (estado === "activo" && Number(c.activo) !== 1) return false;
      if (estado === "inactivo" && Number(c.activo) === 1) return false;
      return coincideConsulta(c, consulta, ["nombre", "email", "telefono"]);
    });
  };

  const renderizarClientes = () => {
    if (!tablaClientes) return;
    const lista = filtrarClientes();
    if (!lista.length) {
      tablaClientes.innerHTML = '<tr><td colspan="6">Sin clientes que coincidan.</td></tr>';
      return;
    }

    tablaClientes.innerHTML = lista.map((cli) => {
      const activo = Number(cli.activo) === 1;
      return `
        <tr>
          <td><strong>${escaparHtml(cli.nombre || "Cliente")}</strong><br><small>ID ${escaparHtml(cli.id)}</small></td>
          <td>${escaparHtml(cli.email || "")}<br><small>${escaparHtml(cli.telefono || "")}</small></td>
          <td>${formatearFechaHora(cli.creado_en)}</td>
          <td>${formatearFechaHora(cli.ultimo_acceso)}</td>
          <td><span class="badge ${activo ? "bg-success" : "bg-secondary"}">${activo ? "Activo" : "Inactivo"}</span></td>
          <td>
            <div class="admin-table-actions">
              <button class="admin-mini-btn" type="button" data-cliente-toggle="${escaparHtml(cli.id)}" data-cliente-activo="${activo ? "1" : "0"}">${activo ? "Desactivar" : "Activar"}</button>
              <a class="admin-mini-btn" href="mailto:${escaparHtml(cli.email)}">Email</a>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  };

  const refrescarTodo = () => {
    actualizarContadores();
    actualizarKpis();
    renderizarProductos();
    renderizarSolicitudes();
    renderizarVolantes();
    renderizarClientes();
    renderizarPanelSolicitudes();
    renderizarPanelVolantes();
    renderizarPanelClientes();
    if (window.feather) feather.replace();
  };

  const cargarProductos = async () => {
    productos = await backend.listProductsAdmin();
    refrescarTodo();
  };

  const cargarSolicitudes = async () => {
    solicitudes = await backend.listSolicitudes();
    refrescarTodo();
  };

  const cargarVolantes = async () => {
    try {
      volantes = await backend.listAdminVolantes();
    } catch (error) {
      volantes = [];
    }
    refrescarTodo();
  };

  const cargarClientes = async () => {
    try {
      clientes = await backend.listAdminClientes();
    } catch (error) {
      clientes = [];
    }
    refrescarTodo();
  };

  const cargarDatosAdmin = async () => {
    try {
      await Promise.all([cargarProductos(), cargarSolicitudes(), cargarVolantes(), cargarClientes()]);
    } catch (error) {
      console.warn("No se pudieron cargar todos los datos del admin.", error);
      mostrarEstado(estadoProducto, "No se pudieron cargar los datos. Comprueba la sesion y MySQL.", "error");
    }
  };

  const actualizarUiSesion = async () => {
    sesionAdmin = await backend.getAdminSession();
    const logueado = Boolean(sesionAdmin);

    if (panelAdmin) panelAdmin.hidden = !logueado;
    if (botonSalir) botonSalir.hidden = !logueado;
    if (chipSesion) chipSesion.textContent = logueado ? `Administrador: ${sesionAdmin.user?.email || "sesion activa"}` : "Redirigiendo a cuenta";

    if (logueado) {
      await cargarDatosAdmin();
      return;
    }

    window.location.replace(urlLoginCuenta);
  };

  const importarProductosFoto = async () => {
    if (!productosPreparados.length) {
      mostrarEstado(estadoImportarProductos, "No hay productos preparados.", "error");
      return;
    }
    if (!obtenerSesion()) {
      mostrarEstado(estadoImportarProductos, "Inicia sesion como administrador.", "error");
      return;
    }
    if (!productos.length) await cargarProductos();

    let creados = 0;
    let actualizados = 0;
    const fallos = [];

    for (const [indice, productoPreparado] of productosPreparados.entries()) {
      const posicion = `${indice + 1}/${productosPreparados.length}`;
      const productoExistente = buscarProductoExistente(productoPreparado);
      const payload = { ...productoPreparado, slug: productoExistente?.slug || productoPreparado.slug, actualizado_en: new Date().toISOString() };

      try {
        mostrarEstado(estadoImportarProductos, `Importando ${posicion}: ${productoPreparado.nombre}`, "info");
        if (productoExistente) {
          await backend.updateProduct(productoExistente.id, payload);
          actualizados += 1;
        } else {
          await backend.createProduct(payload);
          creados += 1;
        }
      } catch (error) {
        fallos.push(productoPreparado.nombre);
      }
    }

    await cargarProductos();
    if (fallos.length) {
      mostrarEstado(estadoImportarProductos, `Importacion parcial: ${creados} nuevos, ${actualizados} actualizados, ${fallos.length} con error.`, "error");
      return;
    }
    mostrarEstado(estadoImportarProductos, `Importacion completada: ${creados} nuevos y ${actualizados} actualizados.`, "success");
  };

  const exportarCsv = (tipo) => {
    let filas = [];
    let cabeceras = [];
    let nombreArchivo = `${tipo}-${new Date().toISOString().slice(0, 10)}.csv`;

    if (tipo === "productos") {
      cabeceras = ["id", "nombre", "slug", "marca", "modelo", "precio", "stock", "activo"];
      filas = productos.map((p) => [p.id, p.nombre, p.slug, p.marca, p.modelo, p.precio, p.stock, p.activo ? "1" : "0"]);
    } else if (tipo === "solicitudes") {
      cabeceras = ["id", "nombre", "email", "telefono", "modelo_coche", "presupuesto", "estado", "creado_en"];
      filas = solicitudes.map((r) => [r.id, r.nombre, r.email, r.telefono, r.modelo_coche, r.presupuesto, r.estado, r.creado_en]);
    } else if (tipo === "clientes") {
      cabeceras = ["id", "nombre", "email", "telefono", "activo", "creado_en", "ultimo_acceso"];
      filas = clientes.map((c) => [c.id, c.nombre, c.email, c.telefono, c.activo, c.creado_en, c.ultimo_acceso]);
    }

    const escapar = (valor) => {
      const s = (valor ?? "").toString().replace(/"/g, '""');
      return `"${s}"`;
    };
    const csv = [cabeceras, ...filas].map((fila) => fila.map(escapar).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  botonSalir?.addEventListener("click", async () => {
    await backend.logout();
    sesionAdmin = null;
    await actualizarUiSesion();
  });

  document.querySelectorAll("[data-admin-tab]").forEach((boton) => {
    boton.addEventListener("click", () => activarPestana(boton.dataset.adminTab));
  });

  document.querySelectorAll("[data-go-tab]").forEach((boton) => {
    boton.addEventListener("click", () => activarPestana(boton.dataset.goTab));
  });

  formularioProducto?.elements.nombre?.addEventListener("input", () => {
    if (!formularioProducto.elements.slug.value) formularioProducto.elements.slug.value = aSlug(formularioProducto.elements.nombre.value);
  });

  formularioProducto?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!formularioProducto.checkValidity()) {
      formularioProducto.reportValidity();
      return;
    }

    const payload = obtenerPayload();
    const id = formularioProducto.elements.id.value;

    try {
      mostrarEstado(estadoProducto, "Guardando producto...", "info");
      if (id) await backend.updateProduct(id, payload);
      else await backend.createProduct(payload);
      mostrarEstado(estadoProducto, id ? "Producto actualizado." : "Producto creado.", "success");
      resetearFormularioProducto();
      await cargarProductos();
    } catch (error) {
      const mensaje = error?.message || "No se pudo guardar.";
      mostrarEstado(estadoProducto, mensaje, "error");
    }
  });

  document.querySelector("[data-product-reset]")?.addEventListener("click", resetearFormularioProducto);
  document.querySelector("[data-products-refresh]")?.addEventListener("click", cargarProductos);
  document.querySelector("[data-requests-refresh]")?.addEventListener("click", cargarSolicitudes);
  document.querySelector("[data-volantes-refresh]")?.addEventListener("click", cargarVolantes);
  document.querySelector("[data-clientes-refresh]")?.addEventListener("click", cargarClientes);
  document.querySelector("[data-dashboard-refresh]")?.addEventListener("click", cargarDatosAdmin);
  document.querySelectorAll("[data-import-photo-products]").forEach((btn) => btn.addEventListener("click", importarProductosFoto));

  document.querySelectorAll("[data-export-csv]").forEach((boton) => {
    boton.addEventListener("click", () => exportarCsv(boton.dataset.exportCsv));
  });

  document.querySelector("[data-clean-duplicates]")?.addEventListener("click", async () => {
    try {
      const duplicados = await backend.detectarDuplicados();
      if (!duplicados.length) {
        mostrarEstado(estadoImportarProductos || estadoProducto, "No hay productos duplicados.", "success");
        return;
      }

      const total = duplicados.reduce((acc, g) => acc + (g.copias - 1), 0);
      const detalle = duplicados.slice(0, 5).map((g) => `- ${g.nombre} (${g.copias} copias)`).join("\n");
      const extra = duplicados.length > 5 ? `\n... y ${duplicados.length - 5} grupos mas` : "";

      const confirmado = window.confirm(
        `Se han detectado ${duplicados.length} grupos de productos duplicados.\n` +
        `Se eliminaran ${total} productos (conservando el mas antiguo de cada grupo):\n\n` +
        `${detalle}${extra}\n\n` +
        `Continuar?`
      );
      if (!confirmado) return;

      mostrarEstado(estadoImportarProductos || estadoProducto, "Eliminando duplicados...", "info");
      const resultado = await backend.limpiarDuplicados();
      await cargarProductos();
      mostrarEstado(estadoImportarProductos || estadoProducto, `Se han eliminado ${resultado.eliminados} productos duplicados.`, "success");
    } catch (error) {
      console.warn("No se pudieron limpiar los duplicados.", error);
      mostrarEstado(estadoImportarProductos || estadoProducto, error.message || "No se pudieron limpiar los duplicados.", "error");
    }
  });

  document.querySelector("[data-products-search]")?.addEventListener("input", (evento) => {
    filtros.productos.consulta = evento.currentTarget.value;
    renderizarProductos();
  });
  document.querySelector('[data-products-filter="estado"]')?.addEventListener("change", (evento) => {
    filtros.productos.estado = evento.currentTarget.value;
    renderizarProductos();
  });

  document.querySelector("[data-requests-search]")?.addEventListener("input", (evento) => {
    filtros.solicitudes.consulta = evento.currentTarget.value;
    renderizarSolicitudes();
  });
  document.querySelector('[data-requests-filter="estado"]')?.addEventListener("change", (evento) => {
    filtros.solicitudes.estado = evento.currentTarget.value;
    renderizarSolicitudes();
  });

  document.querySelector("[data-volantes-search]")?.addEventListener("input", (evento) => {
    filtros.volantes.consulta = evento.currentTarget.value;
    renderizarVolantes();
  });
  document.querySelector('[data-volantes-filter="estado"]')?.addEventListener("change", (evento) => {
    filtros.volantes.estado = evento.currentTarget.value;
    renderizarVolantes();
  });

  document.querySelector("[data-clientes-search]")?.addEventListener("input", (evento) => {
    filtros.clientes.consulta = evento.currentTarget.value;
    renderizarClientes();
  });
  document.querySelector('[data-clientes-filter="estado"]')?.addEventListener("change", (evento) => {
    filtros.clientes.estado = evento.currentTarget.value;
    renderizarClientes();
  });

  tablaSolicitudes?.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("[data-request-state-id]");
    if (!boton) return;

    try {
      await backend.updateSolicitud(boton.dataset.requestStateId, boton.dataset.requestState);
      await cargarSolicitudes();
    } catch (error) {
      console.warn("No se pudo actualizar la solicitud.", error);
    }
  });

  tablaProductos?.addEventListener("click", async (evento) => {
    const botonEditar = evento.target.closest("[data-edit-product]");
    const botonToggle = evento.target.closest("[data-toggle-product]");
    const botonEliminar = evento.target.closest("[data-delete-product]");

    if (botonEditar) {
      const producto = productos.find((item) => item.id === botonEditar.dataset.editProduct);
      if (producto) rellenarFormularioProducto(producto);
      return;
    }

    if (botonToggle) {
      const producto = productos.find((item) => item.id === botonToggle.dataset.toggleProduct);
      if (!producto) return;
      await backend.updateProduct(producto.id, { activo: !producto.activo, actualizado_en: new Date().toISOString() });
      await cargarProductos();
      return;
    }

    if (botonEliminar) {
      const producto = productos.find((item) => item.id === botonEliminar.dataset.deleteProduct);
      if (!producto) return;
      const confirmado = window.confirm(`Eliminar definitivamente "${producto.nombre}"?`);
      if (!confirmado) return;
      try {
        await backend.deleteProduct(producto.id);
        await cargarProductos();
      } catch (error) {
        mostrarEstado(estadoImportarProductos || estadoProducto, "No se pudo eliminar.", "error");
      }
    }
  });

  tablaClientes?.addEventListener("click", async (evento) => {
    const botonToggle = evento.target.closest("[data-cliente-toggle]");
    if (!botonToggle) return;

    const id = botonToggle.dataset.clienteToggle;
    const activo = botonToggle.dataset.clienteActivo === "1";
    try {
      await backend.updateClienteActivo(id, !activo);
      await cargarClientes();
    } catch (error) {
      console.warn("No se pudo actualizar el cliente.", error);
    }
  });

  if (!backend?.isConfigured()) {
    if (chipSesion) chipSesion.textContent = "Abre la web desde XAMPP";
    if (panelAdmin) panelAdmin.hidden = true;
    return;
  }

  actualizarUiSesion();
})();
