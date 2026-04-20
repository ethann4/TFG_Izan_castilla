(() => {
  const root = document.querySelector("[data-configurator]");
  if (!root) return;

  const wheelImage = root.querySelector("[data-wheel-image]");
  const marker = root.querySelector("[data-marker]");
  const screen = root.querySelector("[data-screen]");
  const paddles = Array.from(root.querySelectorAll("[data-paddle]"));
  const summaryNodes = {
    material: root.querySelector("[data-summary-material]"),
    rim: root.querySelector("[data-summary-rim]"),
    stitching: root.querySelector("[data-summary-stitching]"),
    marker: root.querySelector("[data-summary-marker]"),
    paddles: root.querySelector("[data-summary-paddles]"),
    extras: root.querySelector("[data-summary-extras]"),
    price: root.querySelector("[data-summary-price]"),
  };

  const materialImages = {
    cuero: "assets/img/gallery/E46/e46_Cuero_rojo.png",
    alcantara: "assets/img/gallery/E46/E46_Alcantara.png",
    carbono: "assets/img/gallery/E46/E46_Carbono_cuero.png",
  };

  const prices = {
    base: 420,
    material: { cuero: 0, alcantara: 80, carbono: 160 },
    paddles: { sin: 0, aluminio: 90, carbono: 140 },
    extras: { pantalla: 290, carbono: 120 },
  };

  const state = {
    material: "carbono",
    rimColor: "#d62828",
    rimLabel: "Rojo motorsport",
    stitching: "#ffffff",
    stitchingLabel: "Blanca",
    marker: "#d62828",
    markerLabel: "Rojo",
    paddles: "carbono",
    extras: new Set(["pantalla"]),
  };

  const setActive = (selector, value) => {
    root.querySelectorAll(selector).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.value === value);
    });
  };

  const formatPrice = (value) => `${value.toLocaleString("es-ES")} EUR`;

  const render = () => {
    if (wheelImage) wheelImage.src = materialImages[state.material];
    root.style.setProperty("--rim-color", state.rimColor);
    root.style.setProperty("--marker-color", state.marker);
    root.style.setProperty("--stitching-color", state.stitching);
    if (marker) marker.style.backgroundColor = state.marker;
    if (screen) screen.classList.toggle("is-visible", state.extras.has("pantalla"));
    paddles.forEach((paddle) => paddle.classList.toggle("is-visible", state.paddles !== "sin"));

    const extrasLabels = [];
    if (state.extras.has("pantalla")) extrasLabels.push("Pantalla RPM");
    if (state.extras.has("carbono")) extrasLabels.push("Molduras carbono");
    if (!extrasLabels.length) extrasLabels.push("Sin extras");

    const total =
      prices.base +
      prices.material[state.material] +
      prices.paddles[state.paddles] +
      (state.extras.has("pantalla") ? prices.extras.pantalla : 0) +
      (state.extras.has("carbono") ? prices.extras.carbono : 0);

    if (summaryNodes.material) summaryNodes.material.textContent = state.material;
    if (summaryNodes.rim) summaryNodes.rim.textContent = state.rimLabel;
    if (summaryNodes.stitching) summaryNodes.stitching.textContent = state.stitchingLabel;
    if (summaryNodes.marker) summaryNodes.marker.textContent = state.markerLabel;
    if (summaryNodes.paddles) summaryNodes.paddles.textContent = state.paddles;
    if (summaryNodes.extras) summaryNodes.extras.textContent = extrasLabels.join(", ");
    if (summaryNodes.price) summaryNodes.price.textContent = formatPrice(total);

    setActive("[data-config-material]", state.material);
    setActive("[data-config-rim]", state.rimColor);
    setActive("[data-config-stitching]", state.stitching);
    setActive("[data-config-marker]", state.marker);
    setActive("[data-config-paddles]", state.paddles);
  };

  root.querySelectorAll("[data-config-material]").forEach((button) => {
    button.addEventListener("click", () => {
      state.material = button.dataset.value;
      render();
    });
  });

  root.querySelectorAll("[data-config-rim]").forEach((button) => {
    button.addEventListener("click", () => {
      state.rimColor = button.dataset.value;
      state.rimLabel = button.dataset.label;
      render();
    });
  });

  root.querySelectorAll("[data-config-stitching]").forEach((button) => {
    button.addEventListener("click", () => {
      state.stitching = button.dataset.value;
      state.stitchingLabel = button.dataset.label;
      render();
    });
  });

  root.querySelectorAll("[data-config-marker]").forEach((button) => {
    button.addEventListener("click", () => {
      state.marker = button.dataset.value;
      state.markerLabel = button.dataset.label;
      render();
    });
  });

  root.querySelectorAll("[data-config-paddles]").forEach((button) => {
    button.addEventListener("click", () => {
      state.paddles = button.dataset.value;
      render();
    });
  });

  root.querySelectorAll("[data-config-extra]").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) state.extras.add(input.value);
      else state.extras.delete(input.value);
      render();
    });
  });

  render();
})();
