(async function () {
  if (!window.CDPSupabase?.isConfigured()) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") || params.get("product");
  if (!slug) return;

  const setText = (id, value) => {
    const node = document.getElementById(id);
    if (node && value !== undefined && value !== null) node.textContent = value;
  };

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
        .replace(/\s|EUR|€/gi, "")
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
    const product = await window.CDPSupabase.getProductBySlug(slug);
    if (!product) return;

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

    if (mainImage) mainImage.src = gallery[0];
    if (secondaryImage) secondaryImage.src = gallery[1] || gallery[0];
    if (productWrap) productWrap.style.backgroundImage = `url('${gallery[0]}')`;

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
        secondaryImage.src = gallery[(index + 1) % gallery.length] || image;
        document.querySelectorAll(".thumb-button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
      thumbStrip.appendChild(button);
    });

    const whatsappCta = document.getElementById("productWhatsapp");
    if (whatsappCta) {
      whatsappCta.href = `https://wa.me/34676525005?text=Hola,%20quiero%20informacion%20sobre%20${encodeURIComponent(product.brand + " " + product.title)}`;
    }

    if (window.feather) feather.replace();
  } catch (error) {
    console.warn("No se pudo cargar el producto desde Supabase.", error);
  }
})();
