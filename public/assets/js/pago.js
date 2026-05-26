(function () {
  "use strict";

  const IVA = 0.21;
  const CLAVE_VOLANTE_PENDIENTE = "cdp.volante.pendiente";

  const nodos = {
    imagenPreview:     document.getElementById("pagoPreviewImg"),
    mediaPreview:      document.querySelector(".pago-preview__media"),
    titulo:            document.getElementById("pagoTitulo"),
    subtitulo:         document.getElementById("pagoSubtitulo"),
    entrega:           document.getElementById("pagoEntrega"),
    lineas:            document.getElementById("pagoLineas"),
    lineaBase:         document.getElementById("pagoLineaBase"),
    lineaModelo:       document.getElementById("pagoLineaModelo"),
    lineaBasePrecio:   document.getElementById("pagoLineaBasePrecio"),
    subtotal:          document.getElementById("pagoSubtotal"),
    envio:             document.getElementById("pagoEnvio"),
    iva:               document.getElementById("pagoIva"),
    total:             document.getElementById("pagoTotal"),
    ctaTotal:          document.getElementById("pagoCtaTotal"),
    formulario:        document.getElementById("pagoForm"),
    camposTarjeta:     document.querySelector("[data-card-fields]"),
    estado:            document.getElementById("pagoStatus"),
    botonEnviar:       document.getElementById("pagoSubmit"),
    capaProcesando:    document.getElementById("pagoOverlay"),
    capaExito:         document.getElementById("pagoSuccess"),
    exitoId:           document.getElementById("pagoSuccessId"),
    exitoFecha:        document.getElementById("pagoSuccessFecha"),
  };

  const formatearPrecio = (valor) => {
    const n = Number.parseFloat(valor) || 0;
    return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " €";
  };

  const decodificarConfig = () => {
    try {
      const carrito = JSON.parse(localStorage.getItem("cdp.cart.checkout") || "null");
      if (carrito && carrito.tipo === "carrito") return carrito;
    } catch (error) { /* sigue */ }

    try {
      const checkout = JSON.parse(localStorage.getItem("cdp.volante.checkout") || "null");
      if (checkout) return checkout;
    } catch (error) { /* sigue */ }

    try {
      const params = new URLSearchParams(window.location.search);
      const cfg = params.get("cfg");
      if (cfg) {
        const json = decodeURIComponent(escape(atob(cfg)));
        return JSON.parse(json);
      }
    } catch (error) { /* sigue */ }

    try {
      const pendiente = JSON.parse(localStorage.getItem(CLAVE_VOLANTE_PENDIENTE) || "null");
      if (pendiente?.diseno) return pendiente.diseno;
    } catch (error) { /* sigue */ }

    return null;
  };

  const ponerImagenPreview = (src) => {
    if (!nodos.imagenPreview || !nodos.mediaPreview) return;
    if (src) {
      nodos.imagenPreview.src = src;
      nodos.mediaPreview.classList.remove("is-empty");
    } else {
      nodos.mediaPreview.classList.add("is-empty");
    }
  };

  const formatearFechaEntrega = () => {
    const formateador = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" });
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return formateador.format(fecha);
  };

  const renderizarPreview = (config) => {
    if (!config) {
      ponerImagenPreview(null);
      nodos.titulo.textContent = "Sin configuracion";
      nodos.subtitulo.textContent = "Vuelve al configurador para crear tu diseño.";
      return;
    }

    if (nodos.entrega) nodos.entrega.textContent = `${formatearFechaEntrega()} (aprox.)`;

    if (config.tipo === "carrito") {
      const items = config.items || [];
      const numItems = items.length;
      const totalUnidades = config.total_quantity || items.reduce((acc, it) => acc + (it.cantidad || 1), 0);
      const primero = items[0] || {};

      nodos.titulo.textContent = "Pedido de cesta";
      nodos.subtitulo.textContent = `${totalUnidades} unidad(es) · ${numItems} producto(s) distinto(s)`;

      if (nodos.lineaBase) nodos.lineaBase.textContent = `${numItems} producto(s) en cesta`;
      if (nodos.lineaModelo) {
        nodos.lineaModelo.textContent = items.map((i) => i.nombre).slice(0, 2).join(" · ") + (numItems > 2 ? "..." : "");
      }

      ponerImagenPreview(primero.imagen || null);
      return;
    }

    const resumen = config.resumen || {};
    const marca = resumen.marca || config.marca || "CDP";
    const modelo = resumen.modelo || config.modelo || "";

    nodos.titulo.textContent = `Volante CDP a medida`;
    nodos.subtitulo.textContent = `${marca} ${modelo} · Configuración personalizada`;

    if (nodos.lineaBase) nodos.lineaBase.textContent = `Volante ${marca} ${modelo}`;
    if (nodos.lineaModelo) {
      const partes = [
        resumen.aro ? `Aro ${resumen.aro}` : "",
        resumen.agarres ? `Agarres ${resumen.agarres}` : "",
        resumen.costuras ? `Costuras ${resumen.costuras}` : "",
      ].filter(Boolean);
      nodos.lineaModelo.textContent = partes.join(" · ");
    }

    ponerImagenPreview(config.boceto_3d || null);
  };

  const renderizarLineas = (config) => {
    if (!config) return;

    if (config.tipo === "carrito") {
      const items = config.items || [];
      const total = Number(config.total) || items.reduce((acc, it) => acc + Number(it.total || 0), 0);
      if (nodos.lineaBasePrecio) nodos.lineaBasePrecio.textContent = formatearPrecio(items[0]?.total || 0);

      const lineasItems = items.map((item) => `
        <div class="pago-line">
          <div>
            <strong>${escaparHtml(item.nombre)} ${item.cantidad > 1 ? `<span style="color:#9aa0ad">x${item.cantidad}</span>` : ""}</strong>
            <small>${escaparHtml(item.marca || "")} ${escaparHtml(item.modelo || "")}</small>
          </div>
          <span>${formatearPrecio(item.total)}</span>
        </div>
      `).join("");

      if (nodos.lineas) {
        nodos.lineas.innerHTML = lineasItems;
      }

      actualizarTotales(total);
      return;
    }

    const precio = config.precio || {};
    const desglose = Array.isArray(precio.desglose) ? precio.desglose : [];
    const base = Number(precio.base ?? precio.total ?? 0);
    const extras = desglose.filter((d) => Number(d.precio) > 0);

    if (nodos.lineaBasePrecio) nodos.lineaBasePrecio.textContent = formatearPrecio(base);

    const lineasExtras = extras
      .map(
        (extra) => `
        <div class="pago-line">
          <div>
            <strong>${escaparHtml(extra.label || extra.key)}</strong>
            <small>${escaparHtml(extra.opcion || "")}</small>
          </div>
          <span>+ ${formatearPrecio(extra.precio)}</span>
        </div>
      `
      )
      .join("");

    if (nodos.lineas) {
      const lineaBase = nodos.lineas.querySelector(".pago-line--main");
      nodos.lineas.innerHTML = "";
      if (lineaBase) nodos.lineas.appendChild(lineaBase);
      nodos.lineas.insertAdjacentHTML("beforeend", lineasExtras);
    }

    actualizarTotales(base + extras.reduce((acc, e) => acc + Number(e.precio || 0), 0));
  };

  const escaparHtml = (valor) => {
    if (window.CDPBackend?.escapeHtml) return window.CDPBackend.escapeHtml(valor);
    const div = document.createElement("div");
    div.textContent = valor ?? "";
    return div.innerHTML;
  };

  const actualizarTotales = (valorSubtotal) => {
    const subtotal = Number(valorSubtotal) || 0;
    const valorIva = subtotal * IVA;
    const valorTotal = subtotal + valorIva;

    if (nodos.subtotal) nodos.subtotal.textContent = formatearPrecio(subtotal);
    if (nodos.iva) nodos.iva.textContent = formatearPrecio(valorIva);
    if (nodos.total) nodos.total.textContent = formatearPrecio(valorTotal);
    if (nodos.ctaTotal) nodos.ctaTotal.textContent = formatearPrecio(valorTotal);
  };

  // Metodo de pago: muestra u oculta los campos de tarjeta

  const alternarCamposPago = () => {
    const marcado = nodos.formulario?.querySelector('input[name="metodo"]:checked');
    if (!nodos.camposTarjeta) return;
    nodos.camposTarjeta.hidden = marcado?.value !== "tarjeta";
  };

  // Validacion del formulario

  const mostrarEstado = (mensaje, tipo = "error") => {
    if (!nodos.estado) return;
    nodos.estado.hidden = false;
    nodos.estado.className = `pago-status is-${tipo}`;
    nodos.estado.textContent = mensaje;
    nodos.estado.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validarFormulario = () => {
    if (!nodos.formulario.checkValidity()) {
      nodos.formulario.reportValidity();
      return false;
    }

    const datos = new FormData(nodos.formulario);
    const metodo = datos.get("metodo");

    if (metodo === "tarjeta") {
      const numero = (datos.get("card_number") || "").toString().replace(/\s+/g, "");
      const caducidad = (datos.get("card_exp") || "").toString();
      const cvc = (datos.get("card_cvc") || "").toString();
      const titular = (datos.get("card_name") || "").toString().trim();

      if (!/^\d{15,19}$/.test(numero)) {
        mostrarEstado("El número de tarjeta debe tener entre 15 y 19 dígitos.");
        return false;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(caducidad)) {
        mostrarEstado("La caducidad debe tener formato MM/AA.");
        return false;
      }
      if (!/^\d{3,4}$/.test(cvc)) {
        mostrarEstado("El CVC debe tener 3 o 4 dígitos.");
        return false;
      }
      if (titular.length < 3) {
        mostrarEstado("Indica el nombre del titular de la tarjeta.");
        return false;
      }
    }

    return true;
  };

  // Pago simulado

  const construirPayloadPedido = (config) => {
    const datos = new FormData(nodos.formulario);
    const direccion = {
      direccion: (datos.get("direccion") || "").toString().trim(),
      cp: (datos.get("cp") || "").toString().trim(),
      ciudad: (datos.get("ciudad") || "").toString().trim(),
      ccaa: (datos.get("ccaa") || "").toString().trim(),
      pais: "Espana",
    };

    const base = {
      email: (datos.get("email") || "").toString().trim(),
      nombre: (datos.get("nombre") || "").toString().trim(),
      telefono: (datos.get("telefono") || "").toString().trim(),
      metodo_pago: (datos.get("metodo") || "tarjeta").toString(),
      direccion,
    };

    if (config && config.tipo === "carrito") {
      return { ...base, tipo: "carrito" };
    }

    return {
      ...base,
      tipo: "volante",
      configuracion: {
        marca: config?.resumen?.marca || config?.marca || "CDP",
        modelo: config?.resumen?.modelo || config?.modelo || "a medida",
        resumen: config?.resumen || null,
        configuracion: config?.configuracion || null,
      },
      precio: config?.precio || { base: 0, desglose: [] },
    };
  };

  const procesarPago = async (config) => {
    nodos.capaProcesando.hidden = false;
    nodos.botonEnviar.disabled = true;

    try {
      const payload = construirPayloadPedido(config);
      let pedidoServer = null;

      if (window.CDPBackend?.checkout) {
        pedidoServer = await window.CDPBackend.checkout(payload);
      } else {
        // fallback local si el backend no esta disponible
        await new Promise((r) => setTimeout(r, 1200));
      }

      nodos.capaProcesando.hidden = true;
      const referencia = pedidoServer?.pedido?.referencia || ("CDP-" + Date.now().toString().slice(-6));
      nodos.exitoId.textContent = referencia;
      nodos.exitoFecha.textContent = formatearFechaEntrega();
      if (pedidoServer?.pedido && nodos.total) {
        nodos.total.textContent = formatearPrecio(pedidoServer.pedido.total);
      }
      nodos.capaExito.hidden = false;

      try {
        localStorage.removeItem(CLAVE_VOLANTE_PENDIENTE);
        localStorage.removeItem("cdp.cart.checkout");
        localStorage.removeItem("cdp.volante.checkout");
      } catch (error) { /* ignorar */ }

      if (window.feather) window.feather.replace();
    } catch (error) {
      nodos.capaProcesando.hidden = true;
      nodos.botonEnviar.disabled = false;
      mostrarEstado(error.message || "No se pudo procesar el pago. Revisa los datos e intenta de nuevo.", "error");
    }
  };

  // Auto-formato de campos de tarjeta

  const configurarFormatosTarjeta = () => {
    const numero = nodos.formulario?.elements.card_number;
    const caducidad = nodos.formulario?.elements.card_exp;
    const cvc = nodos.formulario?.elements.card_cvc;

    numero?.addEventListener("input", (evento) => {
      const crudo = evento.target.value.replace(/\D/g, "").slice(0, 19);
      evento.target.value = crudo.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    });

    caducidad?.addEventListener("input", (evento) => {
      const crudo = evento.target.value.replace(/\D/g, "").slice(0, 4);
      evento.target.value = crudo.length > 2 ? crudo.slice(0, 2) + "/" + crudo.slice(2) : crudo;
    });

    cvc?.addEventListener("input", (evento) => {
      evento.target.value = evento.target.value.replace(/\D/g, "").slice(0, 4);
    });
  };

  // Inicializacion

  const inicializar = () => {
    const config = decodificarConfig();
    renderizarPreview(config);
    renderizarLineas(config);

    if (!config) {
      mostrarEstado("No se ha encontrado ninguna configuración. Vuelve al configurador para crear tu diseño.", "info");
      nodos.botonEnviar.disabled = true;
      return;
    }

    alternarCamposPago();
    configurarFormatosTarjeta();

    nodos.formulario?.querySelectorAll('input[name="metodo"]').forEach((radio) => {
      radio.addEventListener("change", alternarCamposPago);
    });

    // Recalculo de envio/IVA/total cuando el cliente cambia el CP
    const inputCp = nodos.formulario?.elements.cp;
    let cpTimer = null;
    inputCp?.addEventListener("input", () => {
      clearTimeout(cpTimer);
      cpTimer = setTimeout(async () => {
        const cp = (inputCp.value || "").replace(/\D/g, "");
        if (cp.length !== 5 || !window.CDPBackend?.checkoutPreview) return;
        try {
          const payload = construirPayloadPedido(config);
          payload.cp = cp;
          const preview = await window.CDPBackend.checkoutPreview(payload);
          if (nodos.subtotal) nodos.subtotal.textContent = formatearPrecio(preview.subtotal);
          if (nodos.envio) nodos.envio.textContent = formatearPrecio(preview.envio);
          if (nodos.iva) nodos.iva.textContent = formatearPrecio(preview.iva);
          if (nodos.total) nodos.total.textContent = formatearPrecio(preview.total);
          if (nodos.ctaTotal) nodos.ctaTotal.textContent = formatearPrecio(preview.total);
        } catch (error) { /* CP fuera de rango, mantenemos el resumen actual */ }
      }, 280);
    });

    nodos.formulario?.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      nodos.estado.hidden = true;
      if (!validarFormulario()) return;
      await procesarPago(config);
    });
  };

  inicializar();
})();
