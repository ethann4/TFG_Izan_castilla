(function () {
  "use strict";

  const raiz = document.querySelector("[data-configurator]");
  if (!raiz) return;

  const PASOS = [
    { id: "marca",       etiqueta: "Marca",        fuente: "select"  },
    { id: "modelo",      etiqueta: "Modelo",       fuente: "select"  },
    { id: "logo",        etiqueta: "Logo",         fuente: "select"  },
    { id: "aro",         etiqueta: "Aro",          fuente: "options" },
    { id: "agarres",     etiqueta: "Agarres",      fuente: "options" },
    { id: "costuras",    etiqueta: "Costuras",     fuente: "options" },
    { id: "marcador",    etiqueta: "Marcador",     fuente: "options" },
    { id: "molduras",    etiqueta: "Molduras",     fuente: "options" },
    { id: "pantallaRpm", etiqueta: "Pantalla RPM", fuente: "options" },
    { id: "levas",       etiqueta: "Levas",        fuente: "options" },
  ];

  const nodos = {
    tituloProducto:   raiz.querySelector("[data-cv-product-title]"),
    precioProducto:   raiz.querySelector("[data-cv-product-price]"),
    precioResumen:    raiz.querySelector("[data-summary-price]"),
    inferior:         raiz.querySelector("[data-cv-bottom]"),
    opciones:         raiz.querySelector("[data-cv-options]"),
    opcionActual:     raiz.querySelector("[data-cv-option-current]"),
    precioOpcion:     raiz.querySelector("[data-cv-option-price]"),
    nombrePaso:       raiz.querySelector("[data-cv-step-name]"),
    contadorPaso:     raiz.querySelector("[data-cv-step-counter]"),
    anterior:         raiz.querySelector("[data-cv-prev]"),
    siguiente:        raiz.querySelector("[data-cv-next]"),
    colapsar:         raiz.querySelector("[data-cv-collapse]"),
    menuAbrir:        raiz.querySelector("[data-cv-menu-open]"),
    menuCerrar:       raiz.querySelector("[data-cv-menu-close]"),
    menuCapa:         raiz.querySelector("[data-cv-menu-overlay]"),
    menuPanel:        raiz.querySelector("[data-cv-menu-panel]"),
    menuCuerpo:       raiz.querySelector("[data-cv-menu-body]"),
    compartir:        raiz.querySelector("[data-cv-share]"),
    feedbackCompartir: raiz.querySelector("[data-cv-share-feedback]"),
    hecho:            raiz.querySelector("[data-cv-done]"),
    chipMarca:        raiz.querySelector("[data-brand-badge]"),
  };

  let pasoActual = 0;

  // Helpers para leer del DOM legacy

  function obtenerSelectLegacy(clave) {
    return raiz.querySelector(`[data-config-select="${clave}"]`);
  }

  function obtenerGrupoOpcionesLegacy(clave) {
    return raiz.querySelector(`[data-option-group="${clave}"]`);
  }

  function valorResumen(clave) {
    const nodo = raiz.querySelector(`[data-summary="${clave}"]`);
    return nodo ? nodo.textContent.trim() : "";
  }

  // Render de las opciones del paso activo

  function construirOpcionDesdeSelect(select) {
    return Array.from(select.options || []).map((opt) => ({
      id: opt.value,
      etiqueta: opt.textContent.trim() || opt.value,
      activa: opt.selected,
      inactiva: opt.disabled,
      precio: 0,
      muestra: null,
    }));
  }

  function construirOpcionDesdeBotones(grupo) {
    return Array.from(grupo.querySelectorAll("[data-config-option]")).map((boton) => {
      const elemMuestra = boton.querySelector(".option-swatch");
      const elemEtiqueta = boton.querySelector("span:not(.option-swatch)") || boton;
      const elemPrecio = boton.querySelector("small");
      return {
        id: boton.dataset.value,
        etiqueta: (elemEtiqueta.textContent || "").trim() || boton.dataset.value,
        activa: boton.classList.contains("is-active"),
        inactiva: boton.disabled,
        textoPrecio: elemPrecio ? elemPrecio.textContent.trim() : "",
        muestra: elemMuestra ? elemMuestra.style.background || elemMuestra.style.backgroundColor : null,
        ref: boton,
      };
    });
  }

  function leerOpcionesPaso(paso) {
    if (paso.fuente === "select") {
      const select = obtenerSelectLegacy(paso.id);
      return select ? construirOpcionDesdeSelect(select) : [];
    }
    const grupo = obtenerGrupoOpcionesLegacy(paso.id);
    return grupo ? construirOpcionDesdeBotones(grupo) : [];
  }

  function aplicarSeleccion(paso, idOpcion, refOpcion) {
    if (paso.fuente === "select") {
      const select = obtenerSelectLegacy(paso.id);
      if (!select) return;
      select.value = idOpcion;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    if (refOpcion && typeof refOpcion.click === "function") {
      refOpcion.click();
    }
  }

  function renderizarPaso() {
    const paso = PASOS[pasoActual];
    if (!paso) return;

    nodos.nombrePaso.textContent = paso.etiqueta;
    nodos.contadorPaso.textContent = `${pasoActual + 1}/${PASOS.length}`;
    nodos.anterior.disabled = pasoActual === 0;
    nodos.siguiente.disabled = pasoActual === PASOS.length - 1;

    const lista = leerOpcionesPaso(paso);
    nodos.opciones.innerHTML = "";

    if (!lista.length) {
      nodos.opciones.innerHTML = '<span class="cv-option-empty" style="color:#9aa0ad;font-size:.84rem">Sin opciones disponibles</span>';
      nodos.opcionActual.textContent = "";
      nodos.precioOpcion.hidden = true;
      return;
    }

    lista.forEach((opt) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "cv-option" + (opt.activa ? " is-active" : "");
      boton.disabled = !!opt.inactiva;
      boton.dataset.cvOption = opt.id;

      if (opt.muestra) {
        const muestra = document.createElement("span");
        muestra.className = "cv-option-swatch";
        muestra.style.setProperty("--option-color", opt.muestra);
        boton.appendChild(muestra);
      }

      const texto = document.createElement("span");
      texto.className = "cv-option-text";
      texto.textContent = opt.etiqueta;
      boton.appendChild(texto);

      boton.addEventListener("click", () => {
        if (boton.disabled) return;
        aplicarSeleccion(paso, opt.id, opt.ref);
      });

      nodos.opciones.appendChild(boton);
    });

    sincronizarMetaOpcionActual();
  }

  function sincronizarMetaOpcionActual() {
    const paso = PASOS[pasoActual];
    if (!paso) return;

    const lista = leerOpcionesPaso(paso);
    const activa = lista.find((o) => o.activa) || lista[0];
    nodos.opcionActual.textContent = activa ? activa.etiqueta : "";

    const textoPrecio = activa && activa.textoPrecio ? activa.textoPrecio : "";
    if (textoPrecio) {
      nodos.precioOpcion.textContent = textoPrecio;
      nodos.precioOpcion.hidden = false;
    } else {
      nodos.precioOpcion.hidden = true;
    }
  }

  function irAPaso(indice) {
    const acotado = Math.max(0, Math.min(PASOS.length - 1, indice));
    if (acotado === pasoActual) return;
    pasoActual = acotado;
    renderizarPaso();
  }

  // Topbar: titulo + precio

  function sincronizarBarraSuperior() {
    const marca = valorResumen("marca");
    const modelo = valorResumen("modelo");
    if (nodos.tituloProducto) {
      const partes = ["Volante CDP"];
      if (marca) partes.push(marca);
      if (modelo) partes.push(modelo);
      nodos.tituloProducto.textContent = partes.filter(Boolean).join(" · ");
    }

    if (nodos.precioResumen) {
      const crudo = (nodos.precioResumen.textContent || "0 EUR").trim().replace("EUR", "€");
      if (nodos.precioProducto) nodos.precioProducto.textContent = crudo;
      const precioHecho = document.querySelector("[data-cv-done-price]");
      if (precioHecho) precioHecho.textContent = crudo;
    }
  }

  // Menu lateral

  function renderizarMenu() {
    if (!nodos.menuCuerpo) return;
    nodos.menuCuerpo.innerHTML = PASOS.map((paso, indice) => {
      const valor = valorResumen(paso.id) || "—";
      const activa = indice === pasoActual;
      return `
        <button type="button" class="cv-menu-item${activa ? " is-active" : ""}" data-cv-menu-step="${indice}">
          <div class="cv-menu-item__info">
            <span class="cv-menu-item__label">${paso.etiqueta}</span>
            <span class="cv-menu-item__value">${valor}</span>
          </div>
          <span class="cv-menu-item__chevron"><span data-feather="chevron-right"></span></span>
        </button>
      `;
    }).join("");

    nodos.menuCuerpo.querySelectorAll("[data-cv-menu-step]").forEach((boton) => {
      boton.addEventListener("click", () => {
        irAPaso(Number(boton.dataset.cvMenuStep));
        cerrarMenu();
      });
    });

    if (window.feather) window.feather.replace();
  }

  function abrirMenu() {
    renderizarMenu();
    nodos.menuCapa.classList.add("is-open");
    nodos.menuPanel.classList.add("is-open");
    nodos.menuPanel.setAttribute("aria-hidden", "false");
  }

  function cerrarMenu() {
    nodos.menuCapa.classList.remove("is-open");
    nodos.menuPanel.classList.remove("is-open");
    nodos.menuPanel.setAttribute("aria-hidden", "true");
  }

  // Sincronizacion con configurator.js mediante MutationObserver
  // configurator.js actualiza [data-summary] y [data-summary-price]
  // cuando cambia algo. Observamos esos cambios para refrescar UI.

  const nodosResumen = Array.from(raiz.querySelectorAll("[data-summary]"));
  const observador = new MutationObserver(() => {
    renderizarPaso();
    sincronizarBarraSuperior();
  });
  nodosResumen.forEach((n) => observador.observe(n, { childList: true, characterData: true, subtree: true }));
  if (nodos.precioResumen) {
    observador.observe(nodos.precioResumen, { childList: true, characterData: true, subtree: true });
  }

  // Tambien observamos cambios en option-groups por compatibilidad
  // (cuando configurator.js regenera los botones con createOptionButton).
  PASOS.filter((s) => s.fuente === "options").forEach((paso) => {
    const grupo = obtenerGrupoOpcionesLegacy(paso.id);
    if (grupo) observador.observe(grupo, { childList: true, subtree: true, attributes: true, attributeFilter: ["class","disabled"] });
  });

  // Observa el select de marca/modelo/logo (las options cambian al
  // poblarse).
  PASOS.filter((s) => s.fuente === "select").forEach((paso) => {
    const select = obtenerSelectLegacy(paso.id);
    if (select) {
      observador.observe(select, { childList: true, subtree: true });
      select.addEventListener("change", () => { renderizarPaso(); sincronizarBarraSuperior(); });
    }
  });

  // Listeners principales

  nodos.anterior?.addEventListener("click", () => irAPaso(pasoActual - 1));
  nodos.siguiente?.addEventListener("click", () => irAPaso(pasoActual + 1));

  nodos.colapsar?.addEventListener("click", () => {
    const colapsado = nodos.inferior.classList.toggle("is-collapsed");
    nodos.colapsar.setAttribute("aria-label", colapsado ? "Mostrar opciones" : "Ocultar opciones");
  });

  nodos.menuAbrir?.addEventListener("click", abrirMenu);
  nodos.menuCerrar?.addEventListener("click", cerrarMenu);
  nodos.menuCapa?.addEventListener("click", cerrarMenu);
  nodos.hecho?.addEventListener("click", () => {
    if (window.CDPConfigurator?.irAlPago) {
      window.CDPConfigurator.irAlPago();
    } else {
      abrirMenu();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarMenu();
    if (evento.key === "ArrowLeft" && !esCampoTexto(evento.target)) irAPaso(pasoActual - 1);
    if (evento.key === "ArrowRight" && !esCampoTexto(evento.target)) irAPaso(pasoActual + 1);
  });

  function esCampoTexto(destino) {
    if (!destino) return false;
    const etiqueta = (destino.tagName || "").toLowerCase();
    return etiqueta === "input" || etiqueta === "textarea" || etiqueta === "select" || destino.isContentEditable;
  }

  // Compartir copia URL al portapapeles

  nodos.compartir?.addEventListener("click", async () => {
    const url = typeof window.CDPConfiguratorShare === "function"
      ? window.CDPConfiguratorShare()
      : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: nodos.tituloProducto?.textContent || "Volante CDP", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      mostrarFeedbackCompartir("Enlace copiado");
    } catch (error) {
      mostrarFeedbackCompartir("No se pudo compartir");
    }
  });

  function mostrarFeedbackCompartir(mensaje) {
    if (!nodos.feedbackCompartir) return;
    nodos.feedbackCompartir.textContent = mensaje;
    nodos.feedbackCompartir.classList.add("is-visible");
    setTimeout(() => nodos.feedbackCompartir.classList.remove("is-visible"), 1800);
  }

  // Inicializacion con un pequeno retraso para esperar a configurator.js

  requestAnimationFrame(() => {
    renderizarPaso();
    sincronizarBarraSuperior();
    if (window.feather) window.feather.replace();
  });

  setTimeout(() => {
    renderizarPaso();
    sincronizarBarraSuperior();
  }, 400);

  // Cuando Babylon termina de cargar, ocultar loader
  const cargador = raiz.querySelector("[data-babylon-loader]");
  if (cargador) {
    const comprobarCargador = setInterval(() => {
      if (cargador.hidden || cargador.style.display === "none") {
        clearInterval(comprobarCargador);
      }
    }, 200);
  }
})();
