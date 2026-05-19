(async function () {
  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node && value !== undefined && value !== null) node.textContent = value;
  };

  const showUnavailableProduct = (message) => {
    setText("productBadge", "SQL");
    setText("productBrand", "CDP Customs");
    setText("productTitle", "Producto no disponible");
    setText("productPrice", "");
    setText("productOldPrice", "");
    setText("productDiscount", "");
    setText("productRatingText", "");
    setText("productSummary", message);
  };

  if (!window.CDPBackend?.isConfigured()) {
    showUnavailableProduct("Abre la web desde XAMPP para cargar esta ficha desde MySQL.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") || params.get("product");
  if (!slug) {
    showUnavailableProduct("Abre una ficha desde el catalogo para cargar el producto SQL.");
    return;
  }

  const appendChip = (container, value) => {
    if (!container || !value) return;
    const span = document.createElement("span");
    span.className = "detail-chip";
    span.textContent = value;
    container.appendChild(span);
  };

  const normalizePrice = (value) => {
    if (!value) return 0;
    return Number(
      value
        .replace(/\s|EUR|\u20ac/gi, "")
        .replace(/\.(?=\d{3}(?:[^\d]|$))/g, "")
        .replace(/,/g, ".")
    );
  };

  const calculateDiscount = (price, oldPrice) => {
    const current = normalizePrice(price);
    const previous = normalizePrice(oldPrice);
    if (!previous || !current || previous <= current) return "";
    return `-${Math.round(((previous - current) / previous) * 100)}%`;
  };

  try {
    const product = await window.CDPBackend.getProductBySlug(slug);
    if (!product) {
      showUnavailableProduct("Este producto no existe en MySQL. Importa productos desde el panel de administrador.");
      return;
    }

    const discount = calculateDiscount(product.price, product.oldPrice);

    setText("productBadge", product.badge);
    setText("productBrand", product.brand);
    setText("productTitle", product.title);
    setText("productPrice", product.price);
    setText("productOldPrice", product.oldPrice);
    setText("productDiscount", discount);
    setText("productRatingText", product.rating);
    setText("productSummary", product.summary);
    setText("productBreadcrumb", `Inicio / Catalogo / ${product.brand} / ${product.title}`);
    document.title = `${product.title} | CDP Customs`;

    const mainImage = document.getElementById("mainProductImage");
    const secondaryImage = document.getElementById("secondaryProductImage");
    const productWrap = document.querySelector(".product-wrap");
    const gallery = product.gallery.length ? product.gallery : ["assets/img/logo_cdp_transparente.png"];
    let lastFocusedElement = null;
    let lightboxIndex = 0;
    let zoomLevel = 1;
    let pinchStartDistance = 0;
    let pinchStartZoom = 1;

    if (mainImage) {
      mainImage.src = gallery[0];
      mainImage.dataset.galleryIndex = "0";
      mainImage.alt = `${product.title} vista principal`;
    }
    if (secondaryImage) {
      const secondaryIndex = gallery.length > 1 ? 1 : 0;
      secondaryImage.src = gallery[secondaryIndex] || gallery[0];
      secondaryImage.dataset.galleryIndex = secondaryIndex.toString();
      secondaryImage.alt = `${product.title} vista secundaria`;
    }
    if (productWrap) productWrap.style.backgroundImage = `url('${gallery[0]}')`;

    const lightbox = document.getElementById("productLightbox");
    const lightboxImage = document.getElementById("productLightboxImage");
    const lightboxFrame = document.querySelector(".product-lightbox-frame");
    const zoomLabel = document.getElementById("productZoomLevel");
    const closeLightboxButton = document.querySelector("[data-lightbox-close]");
    const prevLightboxButton = document.querySelector("[data-lightbox-prev]");
    const nextLightboxButton = document.querySelector("[data-lightbox-next]");
    const zoomInButton = document.querySelector("[data-lightbox-zoom-in]");
    const zoomOutButton = document.querySelector("[data-lightbox-zoom-out]");
    const resetZoomButton = document.querySelector("[data-lightbox-reset]");

    const clampZoom = (value) => Math.min(3, Math.max(1, Number(value.toFixed(2))));

    const setZoomOriginFromPoint = (clientX, clientY) => {
      if (!lightboxFrame || !lightboxImage) return;
      const rect = lightboxFrame.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      lightboxImage.style.transformOrigin = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
    };

    const getTouchDistance = (touches) => {
      const deltaX = touches[0].clientX - touches[1].clientX;
      const deltaY = touches[0].clientY - touches[1].clientY;
      return Math.hypot(deltaX, deltaY);
    };

    const getTouchCenter = (touches) => ({
      clientX: (touches[0].clientX + touches[1].clientX) / 2,
      clientY: (touches[0].clientY + touches[1].clientY) / 2,
    });

    const renderLightbox = () => {
      if (!lightbox || !lightboxImage) return;
      const image = gallery[lightboxIndex] || gallery[0];
      lightboxImage.src = image;
      lightboxImage.alt = `${product.title} detalle ${lightboxIndex + 1}`;
      lightbox.style.setProperty("--product-lightbox-zoom", zoomLevel.toString());
      lightbox.classList.toggle("is-zoomed", zoomLevel > 1);
      if (zoomLabel) zoomLabel.textContent = `${Math.round(zoomLevel * 100)}%`;
      if (prevLightboxButton) prevLightboxButton.disabled = gallery.length <= 1;
      if (nextLightboxButton) nextLightboxButton.disabled = gallery.length <= 1;
      if (lightboxFrame && zoomLevel === 1) lightboxImage.style.transformOrigin = "center";
    };

    const setLightboxZoom = (value, originPoint = null) => {
      if (originPoint) setZoomOriginFromPoint(originPoint.clientX, originPoint.clientY);
      zoomLevel = clampZoom(value);
      renderLightbox();
    };

    const moveLightboxImage = (direction) => {
      if (!gallery.length) return;
      lightboxIndex = (lightboxIndex + direction + gallery.length) % gallery.length;
      zoomLevel = 1;
      renderLightbox();
    };

    const openLightbox = (index) => {
      if (!lightbox || !lightboxImage) return;
      lastFocusedElement = document.activeElement;
      lightboxIndex = Number.isFinite(index) ? index : 0;
      zoomLevel = 1;
      renderLightbox();
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("has-lightbox-open");
      closeLightboxButton?.focus();
    };

    const closeLightbox = () => {
      if (!lightbox) return;
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("has-lightbox-open");
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    };

    document.querySelector("[data-product-zoom='main']")?.addEventListener("click", () => {
      openLightbox(Number(mainImage?.dataset.galleryIndex || 0));
    });

    document.querySelector("[data-product-zoom='secondary']")?.addEventListener("click", () => {
      openLightbox(Number(secondaryImage?.dataset.galleryIndex || 0));
    });

    closeLightboxButton?.addEventListener("click", closeLightbox);
    prevLightboxButton?.addEventListener("click", () => moveLightboxImage(-1));
    nextLightboxButton?.addEventListener("click", () => moveLightboxImage(1));
    zoomInButton?.addEventListener("click", () => setLightboxZoom(zoomLevel + 0.25));
    zoomOutButton?.addEventListener("click", () => setLightboxZoom(zoomLevel - 0.25));
    resetZoomButton?.addEventListener("click", () => setLightboxZoom(1));

    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    lightboxFrame?.addEventListener("mousemove", (event) => {
      if (!lightboxImage || zoomLevel <= 1) return;
      setZoomOriginFromPoint(event.clientX, event.clientY);
    });

    lightboxFrame?.addEventListener("wheel", (event) => {
      if (!lightbox || lightbox.hidden) return;
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      setLightboxZoom(zoomLevel + direction * 0.2, event);
    }, { passive: false });

    lightboxFrame?.addEventListener("touchstart", (event) => {
      if (event.touches.length !== 2) return;
      event.preventDefault();
      pinchStartDistance = getTouchDistance(event.touches);
      pinchStartZoom = zoomLevel;
      const center = getTouchCenter(event.touches);
      setZoomOriginFromPoint(center.clientX, center.clientY);
    }, { passive: false });

    lightboxFrame?.addEventListener("touchmove", (event) => {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      event.preventDefault();
      const center = getTouchCenter(event.touches);
      const nextZoom = pinchStartZoom * (getTouchDistance(event.touches) / pinchStartDistance);
      setLightboxZoom(nextZoom, center);
    }, { passive: false });

    lightboxFrame?.addEventListener("touchend", (event) => {
      if (event.touches.length >= 2) return;
      pinchStartDistance = 0;
      pinchStartZoom = zoomLevel;
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox || lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") moveLightboxImage(-1);
      if (event.key === "ArrowRight") moveLightboxImage(1);
      if (event.key === "+" || event.key === "=") setLightboxZoom(zoomLevel + 0.25);
      if (event.key === "-") setLightboxZoom(zoomLevel - 0.25);
      if (event.key === "0") setLightboxZoom(1);
    });

    const finishChips = document.getElementById("finishChips");
    const fitmentChips = document.getElementById("fitmentChips");
    const specList = document.getElementById("specList");
    const thumbStrip = document.getElementById("thumbStrip");

    if (finishChips) finishChips.innerHTML = "";
    if (fitmentChips) fitmentChips.innerHTML = "";
    if (specList) specList.innerHTML = "";
    if (thumbStrip) thumbStrip.innerHTML = "";

    product.finishes.forEach((finish) => appendChip(finishChips, finish));
    product.fitment.forEach((fitment) => appendChip(fitmentChips, fitment));
    product.specs.forEach((spec) => {
      if (!specList) return;
      const li = document.createElement("li");
      li.textContent = spec;
      specList.appendChild(li);
    });

    gallery.forEach((image, index) => {
      if (!thumbStrip || !mainImage || !secondaryImage) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `thumb-button${index === 0 ? " active" : ""}`;
      const img = document.createElement("img");
      img.src = image;
      img.alt = `${product.title} vista ${index + 1}`;
      button.appendChild(img);
      button.addEventListener("click", () => {
        mainImage.src = image;
        mainImage.dataset.galleryIndex = index.toString();
        const secondaryIndex = gallery.length > 1 ? (index + 1) % gallery.length : index;
        secondaryImage.src = gallery[secondaryIndex] || image;
        secondaryImage.dataset.galleryIndex = secondaryIndex.toString();
        document.querySelectorAll(".thumb-button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
      thumbStrip.appendChild(button);
    });

    const whatsappCta = document.getElementById("productWhatsapp");
    if (whatsappCta) {
      whatsappCta.href = `https://wa.me/34676525005?text=Hola,%20quiero%20informacion%20sobre%20${encodeURIComponent(product.brand + " " + product.title)}`;
    }

    const addCartButton = document.getElementById("productAddCart");
    const cartStatus = document.getElementById("productCartStatus");
    const setCartStatus = (message, type = "success") => {
      if (!cartStatus) return;
      cartStatus.hidden = false;
      cartStatus.textContent = message;
      cartStatus.className = `product-cart-status is-${type}`;
    };

    addCartButton?.addEventListener("click", async () => {
      if (!window.CDPBackend?.addCartItem) return;

      addCartButton.disabled = true;
      setCartStatus("Anadiendo producto a la cesta...", "success");

      try {
        const cart = await window.CDPBackend.addCartItem(product.id, 1);
        setCartStatus("Producto anadido a la cesta. Puedes revisarlo desde el icono del carrito.", "success");
        window.CDPShop?.renderCartCount?.(cart.total_quantity || 0);
      } catch (error) {
        const needsLogin = /401|Sesion de cliente/i.test(error.message || "");
        setCartStatus(
          needsLogin
            ? "Inicia sesion o registrate como cliente para anadir productos a la cesta."
            : "No se pudo anadir el producto a la cesta. Revisa XAMPP y la sesion de cliente.",
          "error"
        );
      } finally {
        addCartButton.disabled = false;
      }
    });

    if (window.feather) feather.replace();
  } catch (error) {
    console.warn("No se pudo cargar el producto desde MySQL.", error);
    showUnavailableProduct("No se pudo cargar el producto desde MySQL. Revisa XAMPP, la base de datos y las tablas.");
  }
})();
