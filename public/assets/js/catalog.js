;(async () => {
  const normalizarTexto = (valor) =>
    (valor || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim();

  const aNumero = (valor) => Number.parseFloat(valor || "0") || 0;
  const escaparHtml = (valor) => window.CDPBackend?.escapeHtml(valor) || "";

  const catalogo = document.querySelector("[data-catalog]");
  if (!catalogo) return;

  const rejillaProductos = catalogo.querySelector("#catalogo-grid");
  if (!rejillaProductos) return;

  const mostrarMensajeCatalogo = (mensaje) => {
    rejillaProductos.innerHTML = `<div class="catalog-grid-message">${escaparHtml(mensaje)}</div>`;
  };

  const renderizarTarjetaProducto = (producto) => {
    const imagen = producto.gallery[0] || "assets/img/logo_cdp_transparente.png";
    const descuento = (() => {
      const actual = aNumero(producto.priceNumber);
      const anterior = aNumero((producto.oldPrice || "").replace(/\D/g, ""));
      if (!anterior || !actual || anterior <= actual) return "";
      return `-${Math.round(((anterior - actual) / anterior) * 100)}%`;
    })();
    const chipPersonalizable = producto.habilitar_color_detalle
      ? `<span class="product-custom-badge" title="Color del detalle personalizable"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>Personalizable</span>`
      : "";

    return `
      <a class="product-card" href="producto.html?id=${encodeURIComponent(producto.id)}" data-brand="${escaparHtml(producto.brandFilter)}" data-model="${escaparHtml(producto.modelFilter)}" data-material="${escaparHtml(producto.material)}" data-color="${escaparHtml(producto.color)}" data-price="${escaparHtml(producto.priceNumber)}" data-tags="${escaparHtml(producto.tags)}">
        <div class="product-media">
          <span class="product-badge">${escaparHtml(producto.badge)}</span>${chipPersonalizable}<span class="product-fav" data-feather="heart"></span><span class="product-rating">${escaparHtml(producto.rating)}</span>
          <img src="${escaparHtml(imagen)}" alt="${escaparHtml(producto.brand + " " + producto.title)}">
        </div>
        <div class="product-meta">
          <div class="product-topline">
            <div><div class="product-brand">${escaparHtml(producto.brand)}</div><div class="product-name">${escaparHtml(producto.title)}</div><div class="product-fit">${escaparHtml(producto.fitSummary)}</div></div>
            <div class="product-price"><strong>${escaparHtml(producto.price)}</strong>${producto.oldPrice ? `<br><s>${escaparHtml(producto.oldPrice)}</s>` : ""}${descuento ? `<br><span class="product-discount">${escaparHtml(descuento)}</span>` : ""}</div>
          </div>
          <div class="product-actions">Ver ficha <span data-feather="arrow-right"></span></div>
        </div>
      </a>
    `;
  };

  const cargarCatalogoBackend = async () => {
    if (!window.CDPBackend?.isConfigured()) {
      mostrarMensajeCatalogo("Abre la web desde XAMPP para cargar los productos del catalogo.");
      return;
    }

    try {
      const productos = await window.CDPBackend.listProducts();
      if (!productos.length) {
        mostrarMensajeCatalogo("No hay productos guardados en MySQL. Importa productos desde el panel de administrador.");
        return;
      }
      rejillaProductos.innerHTML = productos.map(renderizarTarjetaProducto).join("");
      catalogo.dataset.source = "mysql";
      if (window.feather) feather.replace();
    } catch (error) {
      console.warn("No se pudo cargar el catalogo desde MySQL.", error);
      mostrarMensajeCatalogo("No se pudo cargar el catalogo desde MySQL. Revisa XAMPP, la base de datos y las tablas.");
    }
  };

  await cargarCatalogoBackend();

  const inputBusqueda = catalogo.querySelector("[data-catalog-search]");
  const tarjetasProducto = Array.from(catalogo.querySelectorAll(".product-card"));
  const contadorResultados = catalogo.querySelector("[data-catalog-count]");
  const estadoVacio = catalogo.querySelector("[data-catalog-empty]");
  const filtrosRapidos = Array.from(catalogo.querySelectorAll("[data-quick-filter]"));
  const formularioFiltros = catalogo.querySelector("[data-filter-form]");
  const botonesResetear = Array.from(catalogo.querySelectorAll("[data-reset-filters]"));
  const rangoPrecioMin = catalogo.querySelector("[data-filter-price-min]");
  const rangoPrecioMax = catalogo.querySelector("[data-filter-price-max]");
  const salidaPrecioMin = catalogo.querySelector("[data-price-min-output]");
  const salidaPrecioMax = catalogo.querySelector("[data-price-max-output]");
  const progresoRango = catalogo.querySelector("[data-range-progress]");
  const chipResultadosFiltro = catalogo.querySelector("[data-filter-results]");
  const contenedorChipsActivos = catalogo.querySelector("[data-active-chips]");
  const productosPorPagina = 6;
  let paginaActual = 1;
  const controlesPaginacion = document.createElement("nav");
  controlesPaginacion.className = "catalog-pagination";
  controlesPaginacion.setAttribute("aria-label", "Paginacion de productos");
  controlesPaginacion.hidden = true;
  rejillaProductos.insertAdjacentElement("afterend", controlesPaginacion);

  if (!tarjetasProducto.length) {
    if (contadorResultados) contadorResultados.textContent = "0 resultado(s)";
    if (estadoVacio) estadoVacio.hidden = true;
    return;
  }

  const datosTarjeta = tarjetasProducto.map((tarjeta) => {
    const dataset = tarjeta.dataset;
    const texto = normalizarTexto([tarjeta.textContent, dataset.tags, dataset.brand, dataset.model, dataset.material, dataset.color].join(" "));
    return {
      tarjeta,
      brand: normalizarTexto(dataset.brand),
      model: normalizarTexto(dataset.model),
      material: normalizarTexto(dataset.material),
      color: normalizarTexto(dataset.color),
      precio: aNumero(dataset.price),
      texto,
    };
  });

  const obtenerValoresMarcados = (nombre) =>
    formularioFiltros
      ? Array.from(formularioFiltros.querySelectorAll(`input[name="${nombre}"]:checked`)).map((input) => normalizarTexto(input.value))
      : [];

  const PRECIO_MINIMO = aNumero(rangoPrecioMin?.min || "0");
  const PRECIO_MAXIMO = aNumero(rangoPrecioMax?.max || "9999");

  const obtenerEstado = () => {
    let precioMin = aNumero(rangoPrecioMin?.value || PRECIO_MINIMO);
    let precioMax = aNumero(rangoPrecioMax?.value || PRECIO_MAXIMO);
    if (precioMin > precioMax) [precioMin, precioMax] = [precioMax, precioMin];

    return {
      busqueda: normalizarTexto(inputBusqueda ? inputBusqueda.value : ""),
      brand: normalizarTexto(formularioFiltros?.elements.brand?.value || ""),
      model: normalizarTexto(formularioFiltros?.elements.model?.value || ""),
      materiales: obtenerValoresMarcados("material"),
      colores: obtenerValoresMarcados("color"),
      precioMin,
      precioMax,
    };
  };

  const coincideBusqueda = (item, busqueda) => {
    if (!busqueda) return true;
    return busqueda.split(/\s+/).every((termino) => item.texto.includes(termino));
  };

  const coincideMultiple = (origen, valoresSeleccionados) => {
    if (!valoresSeleccionados.length) return true;
    return valoresSeleccionados.some((valor) => origen.includes(valor));
  };

  const actualizarSalidaPrecio = () => {
    if (!rangoPrecioMin || !rangoPrecioMax) return;
    let valorMin = aNumero(rangoPrecioMin.value);
    let valorMax = aNumero(rangoPrecioMax.value);
    if (valorMin > valorMax - 20) {
      if (document.activeElement === rangoPrecioMin) {
        valorMin = valorMax - 20;
        rangoPrecioMin.value = String(Math.max(PRECIO_MINIMO, valorMin));
      } else {
        valorMax = valorMin + 20;
        rangoPrecioMax.value = String(Math.min(PRECIO_MAXIMO, valorMax));
      }
    }
    if (salidaPrecioMin) salidaPrecioMin.textContent = `${rangoPrecioMin.value} EUR`;
    if (salidaPrecioMax) salidaPrecioMax.textContent = `${rangoPrecioMax.value} EUR`;
    if (progresoRango) {
      const rango = PRECIO_MAXIMO - PRECIO_MINIMO || 1;
      const izquierda = ((aNumero(rangoPrecioMin.value) - PRECIO_MINIMO) / rango) * 100;
      const derecha = 100 - ((aNumero(rangoPrecioMax.value) - PRECIO_MINIMO) / rango) * 100;
      progresoRango.style.left = `${izquierda}%`;
      progresoRango.style.right = `${derecha}%`;
    }
  };

  const ETIQUETAS_MARCA = { bmw: "BMW", audi: "Audi", mercedes: "Mercedes", volkswagen: "Volkswagen" };
  const ETIQUETAS_MODELO = {
    e46: "BMW E46 / E39",
    e90: "BMW E90 / E60",
    f82: "BMW Serie F",
    "audi-sline": "Audi RS",
    amg: "Mercedes AMG",
    gti: "Volkswagen GTI",
  };
  const capitalizar = (valor) => valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : "";

  const renderizarChipsActivos = (estado) => {
    if (!contenedorChipsActivos) return;
    const chips = [];
    if (estado.brand) chips.push({ type: "brand", value: estado.brand, label: ETIQUETAS_MARCA[estado.brand] || capitalizar(estado.brand) });
    if (estado.model) chips.push({ type: "model", value: estado.model, label: ETIQUETAS_MODELO[estado.model] || capitalizar(estado.model) });
    estado.materiales.forEach((m) => chips.push({ type: "material", value: m, label: capitalizar(m) }));
    estado.colores.forEach((c) => chips.push({ type: "color", value: c, label: capitalizar(c) }));
    if (estado.precioMin > PRECIO_MINIMO || estado.precioMax < PRECIO_MAXIMO) {
      chips.push({ type: "price", value: "price", label: `${estado.precioMin} - ${estado.precioMax} EUR` });
    }
    if (estado.busqueda) chips.push({ type: "search", value: estado.busqueda, label: `"${estado.busqueda}"` });

    if (!chips.length) {
      contenedorChipsActivos.hidden = true;
      contenedorChipsActivos.innerHTML = "";
      return;
    }

    contenedorChipsActivos.hidden = false;
    contenedorChipsActivos.innerHTML = chips.map((chip) => `
      <span class="filter-chip">${escaparHtml(chip.label)}<button class="filter-chip__remove" type="button" data-chip-type="${escaparHtml(chip.type)}" data-chip-value="${escaparHtml(chip.value)}" aria-label="Quitar filtro ${escaparHtml(chip.label)}">&times;</button></span>
    `).join("") + (chips.length > 1 ? '<button class="filter-active-chips__clear" type="button" data-reset-filters>Limpiar todo</button>' : "");
  };

  const recalcularContadores = () => {
    const estado = obtenerEstado();
    const pasaSalvo = (item, salvo) =>
      coincideBusqueda(item, estado.busqueda) &&
      (!estado.brand || item.brand === estado.brand) &&
      (!estado.model || item.model.includes(estado.model)) &&
      (salvo === "material" || coincideMultiple(item.material, estado.materiales)) &&
      (salvo === "color" || coincideMultiple(item.color, estado.colores)) &&
      item.precio >= estado.precioMin && item.precio <= estado.precioMax;

    catalogo.querySelectorAll("[data-count-material]").forEach((nodo) => {
      const valor = nodo.dataset.countMaterial;
      const cuenta = datosTarjeta.filter((item) => pasaSalvo(item, "material") && item.material.includes(valor)).length;
      nodo.textContent = cuenta;
      const envoltorio = nodo.closest(".filter-pill");
      const input = envoltorio?.querySelector("input");
      if (input) {
        const deshabilitar = !input.checked && cuenta === 0;
        input.disabled = deshabilitar;
        envoltorio.classList.toggle("is-disabled", deshabilitar);
        envoltorio.classList.toggle("is-checked", input.checked);
      }
    });

    catalogo.querySelectorAll("[data-count-color]").forEach((nodo) => {
      const valor = nodo.dataset.countColor;
      const cuenta = datosTarjeta.filter((item) => pasaSalvo(item, "color") && item.color.includes(valor)).length;
      nodo.textContent = cuenta;
      const envoltorio = nodo.closest(".filter-color");
      const input = envoltorio?.querySelector("input");
      if (input) {
        const deshabilitar = !input.checked && cuenta === 0;
        input.disabled = deshabilitar;
        envoltorio.classList.toggle("is-disabled", deshabilitar);
        envoltorio.classList.toggle("is-checked", input.checked);
      }
    });
  };

  const marcarFiltrosRapidosActivos = (estado) => {
    filtrosRapidos.forEach((boton) => {
      const tipo = boton.dataset.quickType || "search";
      const valor = normalizarTexto(boton.dataset.quickFilter);
      const activo =
        (tipo === "all" && !estado.busqueda && !estado.brand && !estado.model && !estado.materiales.length && !estado.colores.length) ||
        (tipo === "brand" && estado.brand === valor) ||
        (tipo === "model" && estado.model === valor) ||
        (tipo === "material" && estado.materiales.includes(valor)) ||
        (tipo === "search" && estado.busqueda === valor);
      boton.classList.toggle("is-active", activo);
    });
  };

  const renderizarPaginacion = (totalItems, totalPaginas) => {
    if (!controlesPaginacion) return;

    if (totalItems <= productosPorPagina) {
      controlesPaginacion.hidden = true;
      controlesPaginacion.innerHTML = "";
      return;
    }

    const botonesPagina = Array.from({ length: totalPaginas }, (_, indice) => {
      const pagina = indice + 1;
      const activa = pagina === paginaActual;
      return `<button class="catalog-page-btn${activa ? " is-active" : ""}" type="button" data-catalog-page="${pagina}" aria-label="Ir a pagina ${pagina}"${activa ? ' aria-current="page"' : ""}>${pagina}</button>`;
    }).join("");

    controlesPaginacion.hidden = false;
    controlesPaginacion.innerHTML = `
      <button class="catalog-page-btn catalog-page-step" type="button" data-catalog-page="prev"${paginaActual === 1 ? " disabled" : ""}>
        <span data-feather="chevron-left"></span>
        Anterior
      </button>
      <div class="catalog-page-numbers">${botonesPagina}</div>
      <button class="catalog-page-btn catalog-page-step" type="button" data-catalog-page="next"${paginaActual === totalPaginas ? " disabled" : ""}>
        Siguiente
        <span data-feather="chevron-right"></span>
      </button>
    `;

    if (window.feather) feather.replace();
  };

  const aplicarFiltros = ({ resetPage = false } = {}) => {
    const estado = obtenerEstado();
    if (resetPage) paginaActual = 1;

    const itemsFiltrados = datosTarjeta.filter(
      (item) =>
        coincideBusqueda(item, estado.busqueda) &&
        (!estado.brand || item.brand === estado.brand) &&
        (!estado.model || item.model.includes(estado.model)) &&
        coincideMultiple(item.material, estado.materiales) &&
        coincideMultiple(item.color, estado.colores) &&
        item.precio >= estado.precioMin &&
        item.precio <= estado.precioMax
    );

    const visibles = itemsFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(visibles / productosPorPagina));
    if (paginaActual > totalPaginas) paginaActual = totalPaginas;

    const inicioPagina = (paginaActual - 1) * productosPorPagina;
    const itemsPaginaVisible = new Set(itemsFiltrados.slice(inicioPagina, inicioPagina + productosPorPagina));

    datosTarjeta.forEach((item) => {
      item.tarjeta.hidden = !itemsPaginaVisible.has(item);
    });

    if (contadorResultados) {
      contadorResultados.textContent = visibles
        ? `${visibles} resultado(s) - Pagina ${paginaActual} de ${totalPaginas}`
        : "0 resultado(s)";
    }
    if (chipResultadosFiltro) {
      chipResultadosFiltro.textContent = `${visibles} ${visibles === 1 ? "producto" : "productos"}`;
      chipResultadosFiltro.hidden = false;
    }
    if (estadoVacio) estadoVacio.hidden = visibles > 0;
    marcarFiltrosRapidosActivos(estado);
    actualizarSalidaPrecio();
    renderizarChipsActivos(estado);
    recalcularContadores();
    renderizarPaginacion(visibles, totalPaginas);
  };

  const resetearFiltros = () => {
    if (inputBusqueda) inputBusqueda.value = "";
    if (formularioFiltros) formularioFiltros.reset();
    if (rangoPrecioMin) rangoPrecioMin.value = String(PRECIO_MINIMO);
    if (rangoPrecioMax) rangoPrecioMax.value = String(PRECIO_MAXIMO);
    aplicarFiltros({ resetPage: true });
  };

  contenedorChipsActivos?.addEventListener("click", (evento) => {
    const botonQuitar = evento.target.closest("[data-chip-type]");
    if (!botonQuitar) return;
    const tipo = botonQuitar.dataset.chipType;
    const valor = botonQuitar.dataset.chipValue;

    if (tipo === "brand" && formularioFiltros?.elements.brand) formularioFiltros.elements.brand.value = "";
    else if (tipo === "model" && formularioFiltros?.elements.model) formularioFiltros.elements.model.value = "";
    else if (tipo === "material" || tipo === "color") {
      const input = formularioFiltros?.querySelector(`input[name="${tipo}"][value="${valor}"]`);
      if (input) input.checked = false;
    } else if (tipo === "search" && inputBusqueda) inputBusqueda.value = "";
    else if (tipo === "price") {
      if (rangoPrecioMin) rangoPrecioMin.value = String(PRECIO_MINIMO);
      if (rangoPrecioMax) rangoPrecioMax.value = String(PRECIO_MAXIMO);
    }
    aplicarFiltros({ resetPage: true });
  });

  formularioFiltros?.querySelectorAll(".filter-pill input, .filter-color input").forEach((input) => {
    const envoltorio = input.closest(".filter-pill, .filter-color");
    if (!envoltorio) return;
    const sincronizar = () => envoltorio.classList.toggle("is-checked", input.checked);
    input.addEventListener("change", sincronizar);
    sincronizar();
  });

  inputBusqueda?.addEventListener("input", () => aplicarFiltros({ resetPage: true }));
  formularioFiltros?.addEventListener("input", () => aplicarFiltros({ resetPage: true }));
  formularioFiltros?.addEventListener("change", () => aplicarFiltros({ resetPage: true }));
  botonesResetear.forEach((boton) => boton.addEventListener("click", resetearFiltros));
  controlesPaginacion.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-catalog-page]");
    if (!boton || boton.disabled) return;

    const accion = boton.dataset.catalogPage;
    if (accion === "prev") paginaActual -= 1;
    else if (accion === "next") paginaActual += 1;
    else paginaActual = aNumero(accion);

    aplicarFiltros();
    rejillaProductos.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  filtrosRapidos.forEach((boton) => {
    boton.addEventListener("click", () => {
      const tipo = boton.dataset.quickType || "search";
      const valor = boton.dataset.quickFilter || "";

      if (tipo === "all") {
        resetearFiltros();
        return;
      }

      if (tipo === "brand" && formularioFiltros?.elements.brand) formularioFiltros.elements.brand.value = valor;
      if (tipo === "model" && formularioFiltros?.elements.model) formularioFiltros.elements.model.value = valor;
      if (tipo === "material" && formularioFiltros) {
        const input = formularioFiltros.querySelector(`input[name="material"][value="${valor}"]`);
        if (input) input.checked = true;
      }
      if (tipo === "search" && inputBusqueda) inputBusqueda.value = valor;

      aplicarFiltros({ resetPage: true });
    });
  });

  const consulta = new URLSearchParams(window.location.search);
  if (consulta.has("brand") && formularioFiltros?.elements.brand) formularioFiltros.elements.brand.value = consulta.get("brand");
  if (consulta.has("model") && formularioFiltros?.elements.model) formularioFiltros.elements.model.value = consulta.get("model");
  if (consulta.has("q") && inputBusqueda) inputBusqueda.value = consulta.get("q");

  if (rangoPrecioMin) rangoPrecioMin.value = String(PRECIO_MINIMO);
  if (rangoPrecioMax) rangoPrecioMax.value = String(PRECIO_MAXIMO);
  aplicarFiltros({ resetPage: true });
})();
