(async function () {
  const ponerTexto = (id, valor) => {
    const nodo = document.getElementById(id);
    if (nodo && valor !== undefined && valor !== null) nodo.textContent = valor;
  };

  const mostrarProductoNoDisponible = (mensaje) => {
    ponerTexto("productBadge", "SQL");
    ponerTexto("productBrand", "CDP Customs");
    ponerTexto("productTitle", "Producto no disponible");
    ponerTexto("productPrice", "");
    ponerTexto("productOldPrice", "");
    ponerTexto("productDiscount", "");
    ponerTexto("productRatingText", "");
    ponerTexto("productSummary", mensaje);
  };

  if (!window.CDPBackend?.isConfigured()) {
    mostrarProductoNoDisponible("Abre la web desde XAMPP para cargar esta ficha desde MySQL.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") || params.get("product");
  if (!slug) {
    mostrarProductoNoDisponible("Abre una ficha desde el catalogo para cargar el producto SQL.");
    return;
  }

  const anadirChip = (contenedor, valor) => {
    if (!contenedor || !valor) return;
    const span = document.createElement("span");
    span.className = "detail-chip";
    span.textContent = valor;
    contenedor.appendChild(span);
  };

  const normalizarPrecio = (valor) => {
    if (!valor) return 0;
    return Number(
      valor
        .replace(/\s|EUR|€/gi, "")
        .replace(/\.(?=\d{3}(?:[^\d]|$))/g, "")
        .replace(/,/g, ".")
    );
  };

  const calcularDescuento = (precio, precioAnterior) => {
    const actual = normalizarPrecio(precio);
    const anterior = normalizarPrecio(precioAnterior);
    if (!anterior || !actual || anterior <= actual) return "";
    return `-${Math.round(((anterior - actual) / anterior) * 100)}%`;
  };

  const construirConfigColorDetalle = (producto, galeria) => {
    if (!producto?.habilitar_color_detalle) return null;

    const claveProducto = (producto.id || slug || "").toString().toLowerCase();
    const tieneGaleriaDetalleAzul = galeria.some((imagen) => imagen.toLowerCase().includes("cuero_azul_achatado"));
    const tieneGaleriaCosturaRoja = galeria.some((imagen) => imagen.toLowerCase().includes("cuero_alcantara_rojo"));

    if (claveProducto === "bmw-f80-f82-cuero-alcantara-rojo-sport" || tieneGaleriaCosturaRoja) {
      return {
        defaultColor: "#d62828",
        label: "Color costuras",
        ariaLabel: "Elegir color RGB de las costuras",
        mode: "stitching",
        gallery: galeria,
      };
    }

    if (claveProducto === "e46-cuero-azul-achatado" || tieneGaleriaDetalleAzul) {
      return {
        defaultColor: "#1b61ff",
        label: "Color tira",
        ariaLabel: "Elegir color RGB de la tira",
        mode: "stripe",
        gallery: galeria,
      };
    }

    return null;
  };

  const cacheColorTira = new Map();
  const cacheImagenes = new Map();
  const ANCHO_MAXIMO_PROCESO = 900;

  const cargarImagenUnaVez = (rutaImagen) => {
    if (cacheImagenes.has(rutaImagen)) return cacheImagenes.get(rutaImagen);
    const promesa = new Promise((resolver, rechazar) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolver(img);
      img.onerror = rechazar;
      img.src = rutaImagen;
    });
    cacheImagenes.set(rutaImagen, promesa);
    return promesa;
  };

  const PRESETS_POR_MODO = {
    stripe: ["#1b61ff", "#ffffff", "#d62828", "#00a651", "#ffba00", "#000000"],
    stitching: ["#d62828", "#ffffff", "#ffba00", "#1b61ff", "#ff8c00", "#0a0a0a"],
  };

  const normalizarColorHex = (valor) => {
    const color = (valor || "").trim().toLowerCase();
    if (color === "rojo") return "#d62828";
    if (color === "azul") return "#1b61ff";
    if (/^#[0-9a-f]{6}$/.test(color)) return color;
    if (/^#[0-9a-f]{3}$/.test(color)) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    return "#1b61ff";
  };

  const hexARgb = (hex) => {
    const valor = normalizarColorHex(hex).slice(1);
    return {
      r: Number.parseInt(valor.slice(0, 2), 16),
      g: Number.parseInt(valor.slice(2, 4), 16),
      b: Number.parseInt(valor.slice(4, 6), 16),
    };
  };

  const rgbAHsv = (r, g, b) => {
    const rojo = r / 255;
    const verde = g / 255;
    const azul = b / 255;
    const max = Math.max(rojo, verde, azul);
    const min = Math.min(rojo, verde, azul);
    const delta = max - min;
    let matiz = 0;

    if (delta && max === rojo) matiz = 60 * (((verde - azul) / delta) % 6);
    else if (delta && max === verde) matiz = 60 * ((azul - rojo) / delta + 2);
    else if (delta) matiz = 60 * ((rojo - verde) / delta + 4);

    if (matiz < 0) matiz += 360;

    return {
      h: matiz,
      s: max ? delta / max : 0,
      v: max,
    };
  };

  const hsvARgb = ({ h, s, v }) => {
    const croma = v * s;
    const x = croma * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - croma;
    let rojo = 0;
    let verde = 0;
    let azul = 0;

    if (h < 60) [rojo, verde, azul] = [croma, x, 0];
    else if (h < 120) [rojo, verde, azul] = [x, croma, 0];
    else if (h < 180) [rojo, verde, azul] = [0, croma, x];
    else if (h < 240) [rojo, verde, azul] = [0, x, croma];
    else if (h < 300) [rojo, verde, azul] = [x, 0, croma];
    else [rojo, verde, azul] = [croma, 0, x];

    return {
      r: Math.round((rojo + m) * 255),
      g: Math.round((verde + m) * 255),
      b: Math.round((azul + m) * 255),
    };
  };

  const obtenerRegionesTira = (rutaImagen) => {
    const nombre = rutaImagen.toLowerCase();
    if (nombre.includes("cuero_azul_achatado") && nombre.includes("principal")) return [{ x1: 0.492, y1: 0.157, x2: 0.520, y2: 0.245 }];
    if (nombre.includes("cuero_azul_achatado") && nombre.includes("lateral")) return [{ x1: 0.438, y1: 0.158, x2: 0.472, y2: 0.248 }];
    if (nombre.includes("cuero_azul_achatado") && nombre.includes("vista_x2")) return [{ x1: 0.230, y1: 0.103, x2: 0.276, y2: 0.180 }];
    return [];
  };

  const obtenerRegionesCosturas = (rutaImagen) => {
    const nombre = rutaImagen.toLowerCase();
    if (nombre.includes("cuero_alcantara_rojo") && nombre.includes("principal")) {
      return [
        { x1: 0.16, y1: 0.16, x2: 0.84, y2: 0.49 },
        { x1: 0.15, y1: 0.34, x2: 0.36, y2: 0.80 },
        { x1: 0.64, y1: 0.34, x2: 0.85, y2: 0.80 },
        { x1: 0.22, y1: 0.72, x2: 0.78, y2: 0.84 },
      ];
    }

    if (nombre.includes("cuero_alcantara_rojo") && nombre.includes("lateral")) {
      return [
        { x1: 0.22, y1: 0.16, x2: 0.78, y2: 0.47 },
        { x1: 0.22, y1: 0.35, x2: 0.39, y2: 0.80 },
        { x1: 0.70, y1: 0.33, x2: 0.79, y2: 0.79 },
        { x1: 0.22, y1: 0.72, x2: 0.70, y2: 0.84 },
      ];
    }

    if (nombre.includes("cuero_alcantara_rojo") && nombre.includes("vista_x2")) {
      return [
        { x1: 0.00, y1: 0.00, x2: 0.64, y2: 0.26 },
        { x1: 0.48, y1: 0.18, x2: 0.78, y2: 0.82 },
        { x1: 0.00, y1: 0.67, x2: 0.48, y2: 0.84 },
      ];
    }

    return [];
  };

  const esPixelOriginalTira = (r, g, b) => {
    const hsv = rgbAHsv(r, g, b);
    return hsv.h >= 194 && hsv.h <= 255 && hsv.s >= 0.28 && hsv.v >= 0.16 && b > r + 16 && b > g + 2;
  };

  const esPixelOriginalCostura = (r, g, b) => {
    const hsv = rgbAHsv(r, g, b);
    return (hsv.h <= 18 || hsv.h >= 342) && hsv.s >= 0.45 && hsv.v >= 0.15 && r > g + 22 && r > b + 16;
  };

  const obtenerRegionesRecolor = (rutaImagen, modo) => (modo === "stitching" ? obtenerRegionesCosturas(rutaImagen) : obtenerRegionesTira(rutaImagen));
  const esPixelOriginalDetalle = (r, g, b, modo) =>
    modo === "stitching" ? esPixelOriginalCostura(r, g, b) : esPixelOriginalTira(r, g, b);

  const recolorearImagenDetalleProducto = async (rutaImagen, color, modo = "stripe", colorPorDefecto = "#1b61ff") => {
    const colorNormalizado = normalizarColorHex(color);
    const defectoNormalizado = normalizarColorHex(colorPorDefecto);
    const regiones = obtenerRegionesRecolor(rutaImagen, modo);

    if (!regiones.length || colorNormalizado === defectoNormalizado) {
      return rutaImagen;
    }

    const claveCache = `${rutaImagen}|${modo}|${colorNormalizado}`;
    if (cacheColorTira.has(claveCache)) {
      return cacheColorTira.get(claveCache);
    }

    let imagen;
    try {
      imagen = await cargarImagenUnaVez(rutaImagen);
    } catch (error) {
      return rutaImagen;
    }

    const escala = imagen.naturalWidth > ANCHO_MAXIMO_PROCESO ? ANCHO_MAXIMO_PROCESO / imagen.naturalWidth : 1;
    const ancho = Math.round(imagen.naturalWidth * escala);
    const alto = Math.round(imagen.naturalHeight * escala);

    const lienzo = document.createElement("canvas");
    lienzo.width = ancho;
    lienzo.height = alto;
    const contexto = lienzo.getContext("2d", { willReadFrequently: true });
    const objetivo = rgbAHsv(...Object.values(hexARgb(colorNormalizado)));

    contexto.drawImage(imagen, 0, 0, ancho, alto);
    const cuadro = contexto.getImageData(0, 0, ancho, alto);
    const pixeles = cuadro.data;

    regiones.forEach((region) => {
      const xIni = Math.max(0, Math.floor(ancho * region.x1));
      const xFin = Math.min(ancho, Math.ceil(ancho * region.x2));
      const yIni = Math.max(0, Math.floor(alto * region.y1));
      const yFin = Math.min(alto, Math.ceil(alto * region.y2));

      for (let y = yIni; y < yFin; y += 1) {
        for (let x = xIni; x < xFin; x += 1) {
          const indice = (y * ancho + x) * 4;
          const rojo = pixeles[indice];
          const verde = pixeles[indice + 1];
          const azul = pixeles[indice + 2];

          if (!esPixelOriginalDetalle(rojo, verde, azul, modo)) continue;

          const actual = rgbAHsv(rojo, verde, azul);
          const siguiente = hsvARgb({
            h: objetivo.h,
            s: Math.min(1, Math.max(actual.s, objetivo.s * 0.82)),
            v: actual.v,
          });

          pixeles[indice] = siguiente.r;
          pixeles[indice + 1] = siguiente.g;
          pixeles[indice + 2] = siguiente.b;
        }
      }
    });

    contexto.putImageData(cuadro, 0, 0);
    const resultado = lienzo.toDataURL("image/jpeg", 0.85);
    cacheColorTira.set(claveCache, resultado);
    return resultado;
  };

  try {
    const producto = await window.CDPBackend.getProductBySlug(slug);
    if (!producto) {
      mostrarProductoNoDisponible("Este producto no existe en MySQL. Importa productos desde el panel de administrador.");
      return;
    }

    const descuento = calcularDescuento(producto.price, producto.oldPrice);

    ponerTexto("productBadge", producto.badge);
    const chipPersonalizable = document.getElementById("productCustomBadge");
    if (chipPersonalizable) chipPersonalizable.hidden = !producto.habilitar_color_detalle;
    ponerTexto("productBrand", producto.brand);
    ponerTexto("productTitle", producto.title);
    ponerTexto("productPrice", producto.price);
    ponerTexto("productOldPrice", producto.oldPrice);
    ponerTexto("productDiscount", descuento);
    ponerTexto("productRatingText", producto.rating);
    ponerTexto("productSummary", producto.summary);
    ponerTexto("productBreadcrumb", `Inicio / Catalogo / ${producto.brand} / ${producto.title}`);
    document.title = `${producto.title} | CDP Customs`;

    const imagenPrincipal = document.getElementById("mainProductImage");
    const imagenSecundaria = document.getElementById("secondaryProductImage");
    const envoltorioProducto = document.querySelector(".product-wrap");
    const galeriaBase = producto.gallery.length ? producto.gallery : ["assets/img/logo_cdp_transparente.png"];
    const configColorDetalle = construirConfigColorDetalle(producto, galeriaBase);
    let galeriaActiva = [...galeriaBase];
    let tituloGaleriaActiva = producto.title;
    let elementoEnfocadoUltimo = null;
    let indiceLightbox = 0;
    let nivelZoom = 1;
    let distanciaPinzaInicio = 0;
    let zoomPinzaInicio = 1;

    const mostrarImagenesProducto = (indice = 0) => {
      if (!galeriaActiva.length) return;
      const indiceSeguro = Math.min(Math.max(indice, 0), galeriaActiva.length - 1);
      const imagen = galeriaActiva[indiceSeguro] || galeriaActiva[0];
      const indiceSecundario = galeriaActiva.length > 1 ? (indiceSeguro + 1) % galeriaActiva.length : indiceSeguro;

      if (imagenPrincipal) {
        imagenPrincipal.src = imagen;
        imagenPrincipal.dataset.galleryIndex = indiceSeguro.toString();
        imagenPrincipal.alt = `${tituloGaleriaActiva} vista principal`;
      }

      if (imagenSecundaria) {
        imagenSecundaria.src = galeriaActiva[indiceSecundario] || imagen;
        imagenSecundaria.dataset.galleryIndex = indiceSecundario.toString();
        imagenSecundaria.alt = `${tituloGaleriaActiva} vista secundaria`;
      }

      if (envoltorioProducto) envoltorioProducto.style.backgroundImage = `url('${galeriaActiva[0]}')`;

      document.querySelectorAll(".thumb-button").forEach((item) => {
        item.classList.toggle("active", Number(item.dataset.galleryIndex || 0) === indiceSeguro);
      });
    };

    const lightbox = document.getElementById("productLightbox");
    const imagenLightbox = document.getElementById("productLightboxImage");
    const marcoLightbox = document.querySelector(".product-lightbox-frame");
    const etiquetaZoom = document.getElementById("productZoomLevel");
    const botonCerrarLightbox = document.querySelector("[data-lightbox-close]");
    const botonAnteriorLightbox = document.querySelector("[data-lightbox-prev]");
    const botonSiguienteLightbox = document.querySelector("[data-lightbox-next]");
    const botonZoomMas = document.querySelector("[data-lightbox-zoom-in]");
    const botonZoomMenos = document.querySelector("[data-lightbox-zoom-out]");
    const botonReiniciarZoom = document.querySelector("[data-lightbox-reset]");

    const acotarZoom = (valor) => Math.min(3, Math.max(1, Number(valor.toFixed(2))));

    const ponerOrigenZoomDesdePunto = (clienteX, clienteY) => {
      if (!marcoLightbox || !imagenLightbox) return;
      const rect = marcoLightbox.getBoundingClientRect();
      const x = ((clienteX - rect.left) / rect.width) * 100;
      const y = ((clienteY - rect.top) / rect.height) * 100;
      imagenLightbox.style.transformOrigin = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
    };

    const obtenerDistanciaTactil = (toques) => {
      const dx = toques[0].clientX - toques[1].clientX;
      const dy = toques[0].clientY - toques[1].clientY;
      return Math.hypot(dx, dy);
    };

    const obtenerCentroTactil = (toques) => ({
      clientX: (toques[0].clientX + toques[1].clientX) / 2,
      clientY: (toques[0].clientY + toques[1].clientY) / 2,
    });

    const renderizarLightbox = () => {
      if (!lightbox || !imagenLightbox) return;
      const imagen = galeriaActiva[indiceLightbox] || galeriaActiva[0];
      imagenLightbox.src = imagen;
      imagenLightbox.alt = `${tituloGaleriaActiva} detalle ${indiceLightbox + 1}`;
      lightbox.style.setProperty("--product-lightbox-zoom", nivelZoom.toString());
      lightbox.classList.toggle("is-zoomed", nivelZoom > 1);
      if (etiquetaZoom) etiquetaZoom.textContent = `${Math.round(nivelZoom * 100)}%`;
      if (botonAnteriorLightbox) botonAnteriorLightbox.disabled = galeriaActiva.length <= 1;
      if (botonSiguienteLightbox) botonSiguienteLightbox.disabled = galeriaActiva.length <= 1;
      if (marcoLightbox && nivelZoom === 1) imagenLightbox.style.transformOrigin = "center";
    };

    const ponerZoomLightbox = (valor, puntoOrigen = null) => {
      if (puntoOrigen) ponerOrigenZoomDesdePunto(puntoOrigen.clientX, puntoOrigen.clientY);
      nivelZoom = acotarZoom(valor);
      renderizarLightbox();
    };

    const moverImagenLightbox = (direccion) => {
      if (!galeriaActiva.length) return;
      indiceLightbox = (indiceLightbox + direccion + galeriaActiva.length) % galeriaActiva.length;
      nivelZoom = 1;
      renderizarLightbox();
    };

    const abrirLightbox = (indice) => {
      if (!lightbox || !imagenLightbox) return;
      elementoEnfocadoUltimo = document.activeElement;
      indiceLightbox = Number.isFinite(indice) ? Math.min(Math.max(indice, 0), galeriaActiva.length - 1) : 0;
      nivelZoom = 1;
      renderizarLightbox();
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-lightbox-open");
      botonCerrarLightbox?.focus();
    };

    const cerrarLightbox = () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-lightbox-open");
      if (elementoEnfocadoUltimo && typeof elementoEnfocadoUltimo.focus === "function") {
        elementoEnfocadoUltimo.focus();
      }
    };

    document.querySelector("[data-product-zoom='main']")?.addEventListener("click", () => {
      abrirLightbox(Number(imagenPrincipal?.dataset.galleryIndex || 0));
    });

    document.querySelector("[data-product-zoom='secondary']")?.addEventListener("click", () => {
      abrirLightbox(Number(imagenSecundaria?.dataset.galleryIndex || 0));
    });

    botonCerrarLightbox?.addEventListener("click", cerrarLightbox);
    botonAnteriorLightbox?.addEventListener("click", () => moverImagenLightbox(-1));
    botonSiguienteLightbox?.addEventListener("click", () => moverImagenLightbox(1));
    botonZoomMas?.addEventListener("click", () => ponerZoomLightbox(nivelZoom + 0.25));
    botonZoomMenos?.addEventListener("click", () => ponerZoomLightbox(nivelZoom - 0.25));
    botonReiniciarZoom?.addEventListener("click", () => ponerZoomLightbox(1));

    lightbox?.addEventListener("click", (evento) => {
      if (evento.target === lightbox) cerrarLightbox();
    });

    marcoLightbox?.addEventListener("mousemove", (evento) => {
      if (!imagenLightbox || nivelZoom <= 1) return;
      ponerOrigenZoomDesdePunto(evento.clientX, evento.clientY);
    });

    marcoLightbox?.addEventListener("wheel", (evento) => {
      if (!lightbox || lightbox.hidden) return;
      evento.preventDefault();
      const direccion = evento.deltaY < 0 ? 1 : -1;
      ponerZoomLightbox(nivelZoom + direccion * 0.2, evento);
    }, { passive: false });

    marcoLightbox?.addEventListener("touchstart", (evento) => {
      if (evento.touches.length !== 2) return;
      evento.preventDefault();
      distanciaPinzaInicio = obtenerDistanciaTactil(evento.touches);
      zoomPinzaInicio = nivelZoom;
      const centro = obtenerCentroTactil(evento.touches);
      ponerOrigenZoomDesdePunto(centro.clientX, centro.clientY);
    }, { passive: false });

    marcoLightbox?.addEventListener("touchmove", (evento) => {
      if (evento.touches.length !== 2 || !distanciaPinzaInicio) return;
      evento.preventDefault();
      const centro = obtenerCentroTactil(evento.touches);
      const siguienteZoom = zoomPinzaInicio * (obtenerDistanciaTactil(evento.touches) / distanciaPinzaInicio);
      ponerZoomLightbox(siguienteZoom, centro);
    }, { passive: false });

    marcoLightbox?.addEventListener("touchend", (evento) => {
      if (evento.touches.length >= 2) return;
      distanciaPinzaInicio = 0;
      zoomPinzaInicio = nivelZoom;
    });

    document.addEventListener("keydown", (evento) => {
      if (!lightbox || lightbox.hidden) return;
      if (evento.key === "Escape") cerrarLightbox();
      if (evento.key === "ArrowLeft") moverImagenLightbox(-1);
      if (evento.key === "ArrowRight") moverImagenLightbox(1);
      if (evento.key === "+" || evento.key === "=") ponerZoomLightbox(nivelZoom + 0.25);
      if (evento.key === "-") ponerZoomLightbox(nivelZoom - 0.25);
      if (evento.key === "0") ponerZoomLightbox(1);
    });

    const chipsAcabado = document.getElementById("finishChips");
    const chipsCompatibilidad = document.getElementById("fitmentChips");
    const listaEspecificaciones = document.getElementById("specList");
    const tiraMiniaturas = document.getElementById("thumbStrip");
    const selectorColor = document.getElementById("productColorSelector");
    const inputColor = document.getElementById("productStripeColor");
    const valorColor = document.getElementById("productStripeColorValue");
    const etiquetaColor = selectorColor?.querySelector(".product-color-label");
    const muestraColor = document.getElementById("productStripeSwatch");
    const presetsColor = document.getElementById("productColorPresets");
    let tokenRenderColor = 0;
    let colorPendiente = null;
    let rafProgramado = false;

    const renderizarChips = (contenedor, valores) => {
      if (!contenedor) return;
      contenedor.innerHTML = "";
      valores.forEach((valor) => anadirChip(contenedor, valor));
    };

    const renderizarEspecificaciones = () => {
      if (!listaEspecificaciones) return;
      listaEspecificaciones.innerHTML = "";
      producto.specs.forEach((spec) => {
        const li = document.createElement("li");
        li.textContent = spec;
        listaEspecificaciones.appendChild(li);
      });
    };

    const actualizarCtaWhatsapp = (titulo) => {
      const ctaWhatsapp = document.getElementById("productWhatsapp");
      if (ctaWhatsapp) {
        ctaWhatsapp.href = `#" " + titulo)}`;
      }
    };

    const renderizarTextoProducto = () => {
      const titulo = producto.title;
      tituloGaleriaActiva = titulo;
      ponerTexto("productBadge", producto.badge);
      ponerTexto("productTitle", titulo);
      ponerTexto("productSummary", producto.summary);
      ponerTexto("productBreadcrumb", `Inicio / Catalogo / ${producto.brand} / ${titulo}`);
      document.title = `${titulo} | CDP Customs`;
      renderizarChips(chipsAcabado, producto.finishes);
      actualizarCtaWhatsapp(titulo);
    };

    const renderizarMiniaturas = () => {
      if (!tiraMiniaturas) return;
      tiraMiniaturas.innerHTML = "";
      galeriaActiva.forEach((imagen, indice) => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = `thumb-button${indice === 0 ? " active" : ""}`;
        boton.dataset.galleryIndex = indice.toString();
        const img = document.createElement("img");
        img.src = imagen;
        img.alt = `${tituloGaleriaActiva} vista ${indice + 1}`;
        boton.appendChild(img);
        boton.addEventListener("click", () => mostrarImagenesProducto(indice));
        tiraMiniaturas.appendChild(boton);
      });
    };

    const actualizarUiColor = (colorNormalizado) => {
      if (inputColor && inputColor.value.toLowerCase() !== colorNormalizado) inputColor.value = colorNormalizado;
      if (valorColor) valorColor.textContent = colorNormalizado.toUpperCase();
      if (muestraColor) muestraColor.style.setProperty("--current-color", colorNormalizado);
      if (selectorColor) selectorColor.style.setProperty("--current-color", colorNormalizado);
      presetsColor?.querySelectorAll(".product-color-preset").forEach((nodo) => {
        nodo.classList.toggle("is-active", nodo.dataset.presetColor === colorNormalizado);
      });
    };

    const aplicarColorInmediato = async (colorNormalizado) => {
      const tokenActual = (tokenRenderColor += 1);
      selectorColor?.classList.add("is-loading");

      try {
        const datosImagenPrincipal = await recolorearImagenDetalleProducto(
          galeriaBase[0],
          colorNormalizado,
          configColorDetalle.mode,
          configColorDetalle.defaultColor
        );
        if (tokenActual !== tokenRenderColor) return;

        galeriaActiva = [datosImagenPrincipal, ...galeriaBase.slice(1).map((img, indice) => galeriaActiva[indice + 1] || img)];
        renderizarTextoProducto();
        renderizarMiniaturas();
        mostrarImagenesProducto(0);

        const rutasResto = galeriaBase.slice(1);
        if (rutasResto.length) {
          Promise.all(rutasResto.map((imagen) =>
            recolorearImagenDetalleProducto(imagen, colorNormalizado, configColorDetalle.mode, configColorDetalle.defaultColor)
          )).then((procesadas) => {
            if (tokenActual !== tokenRenderColor) return;
            galeriaActiva = [datosImagenPrincipal, ...procesadas];
            renderizarMiniaturas();
            if (lightbox && !lightbox.hidden) renderizarLightbox();
          });
        }

        if (lightbox && !lightbox.hidden) {
          indiceLightbox = 0;
          nivelZoom = 1;
          renderizarLightbox();
        }
      } finally {
        if (tokenActual === tokenRenderColor) selectorColor?.classList.remove("is-loading");
      }
    };

    const seleccionarColorTira = (color) => {
      const colorNormalizado = normalizarColorHex(color);
      actualizarUiColor(colorNormalizado);
      colorPendiente = colorNormalizado;

      if (rafProgramado) return;
      rafProgramado = true;

      requestAnimationFrame(() => {
        rafProgramado = false;
        const colorAplicar = colorPendiente;
        colorPendiente = null;
        if (colorAplicar) aplicarColorInmediato(colorAplicar);
      });
    };

    const renderizarPresets = () => {
      if (!presetsColor) return;
      const presets = PRESETS_POR_MODO[configColorDetalle.mode] || PRESETS_POR_MODO.stripe;
      presetsColor.innerHTML = presets.map((color) => `
        <button class="product-color-preset" type="button" data-preset-color="${color}" style="--preset-color: ${color}" aria-label="Color ${color}"></button>
      `).join("");
      presetsColor.querySelectorAll(".product-color-preset").forEach((nodo) => {
        nodo.addEventListener("click", () => seleccionarColorTira(nodo.dataset.presetColor));
      });
    };

    const renderizarSelectorColor = () => {
      if (!configColorDetalle || !selectorColor || !inputColor) return false;
      selectorColor.hidden = false;
      if (etiquetaColor) etiquetaColor.textContent = configColorDetalle.label || "Color detalle";
      if (configColorDetalle.ariaLabel) inputColor.setAttribute("aria-label", configColorDetalle.ariaLabel);
      const colorPedido = params.get("color");
      const colorInicial = normalizarColorHex(colorPedido || configColorDetalle.defaultColor);

      renderizarPresets();

      inputColor.addEventListener("input", (evento) => {
        seleccionarColorTira(evento.currentTarget.value);
      });

      galeriaBase.forEach((ruta) => { cargarImagenUnaVez(ruta).catch(() => {}); });

      seleccionarColorTira(colorInicial);
      return true;
    };

    renderizarChips(chipsCompatibilidad, producto.fitment);
    renderizarEspecificaciones();

    if (!renderizarSelectorColor()) {
      renderizarTextoProducto();
      renderizarMiniaturas();
      mostrarImagenesProducto(0);
    }

    const botonAnadirCesta = document.getElementById("productAddCart");
    const estadoCesta = document.getElementById("productCartStatus");
    const mostrarEstadoCesta = (mensaje, tipo = "success") => {
      if (!estadoCesta) return;
      estadoCesta.hidden = false;
      estadoCesta.textContent = mensaje;
      estadoCesta.className = `product-cart-status is-${tipo}`;
    };

    botonAnadirCesta?.addEventListener("click", async () => {
      if (!window.CDPBackend?.addCartItem) return;

      botonAnadirCesta.disabled = true;
      mostrarEstadoCesta("Anadiendo producto a la cesta...", "success");

      try {
        const cesta = await window.CDPBackend.addCartItem(producto.id, 1);
        mostrarEstadoCesta("Producto anadido a la cesta. Puedes revisarlo desde el icono del carrito.", "success");
        window.CDPShop?.renderCartCount?.(cesta.total_quantity || 0);
      } catch (error) {
        const requiereLogin = /401|Sesion de cliente/i.test(error.message || "");
        mostrarEstadoCesta(
          requiereLogin
            ? "Inicia sesion o registrate como cliente para anadir productos a la cesta."
            : "No se pudo anadir el producto a la cesta. Revisa XAMPP y la sesion de cliente.",
          "error"
        );
      } finally {
        botonAnadirCesta.disabled = false;
      }
    });

    if (window.feather) feather.replace();
  } catch (error) {
    console.warn("No se pudo cargar el producto desde MySQL.", error);
    mostrarProductoNoDisponible("No se pudo cargar el producto desde MySQL. Revisa XAMPP, la base de datos y las tablas.");
  }
})();

(function actualizarTimelinePedido() {
  const formateador = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
  const sumarDias = (base, dias) => {
    const fecha = new Date(base);
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  };
  const formatearFecha = (fecha) => formateador.format(fecha).replace(".", "");

  const hoy = new Date();
  const fechas = {
    pedido: formatearFecha(hoy),
    envio: formatearFecha(sumarDias(hoy, 20)),
    entrega: formatearFecha(sumarDias(hoy, 30)),
  };

  Object.entries(fechas).forEach(([clave, valor]) => {
    const nodo = document.querySelector(`[data-timeline-date="${clave}"]`);
    if (nodo) nodo.textContent = valor;
  });

  const eta = document.querySelector("[data-timeline-eta]");
  if (eta) {
    const diasEntrega = Math.max(1, Math.round((sumarDias(hoy, 30) - hoy) / 86400000));
    eta.innerHTML = `Recibe tu volante en aprox. <strong>${diasEntrega} días</strong>`;
  }
})();
