/*===============================================
|  CDP CUSTOMS | CONFIGURADOR VISUAL PREMIUM
|  Babylon.js + GLB/GLTF + PBR materials
|  Preparado para backend PHP/MySQL
================================================*/

(function () {
  "use strict";

  const MODEL_URL = "assets/models/volante.glb";

  const partAliases = {
    aro: ["aro", "rim", "ring_outer", "wheel_ring"],
    agarres_laterales: ["agarre", "agarres", "grip", "thumb", "lateral"],
    costuras: ["costura", "costuras", "stitch", "thread", "seam"],
    logo: ["logo", "emblema", "emblem", "badge"],
    levas: ["leva", "levas", "paddle", "shift"],
    marcador_superior: ["marcador", "marker", "stripe", "top_mark"],
    pantalla_rpm: ["pantalla", "rpm", "display", "screen"],
    molduras: ["moldura", "molduras", "trim", "spoke", "centro", "hub", "airbag"],
  };

  const configuratorData = {
    BMW: {
      modelos: [
        { id: "E46", label: "E46", basePrice: 450, levasMagneticas: false },
        { id: "E39", label: "E39", basePrice: 460, levasMagneticas: false },
        { id: "F30", label: "F30", basePrice: 540, levasMagneticas: true },
        { id: "F82", label: "F82", basePrice: 590, levasMagneticas: true },
      ],
      logos: ["M", "Performance"],
      brandLogo: "assets/img/gallery/bmw.png",
      compatibilidades: {
        levasMagneticas: ["F30", "F82"],
      },
    },
    Audi: {
      modelos: [
        { id: "A3", label: "A3", basePrice: 480, levasMagneticas: false },
        { id: "S3", label: "S3", basePrice: 540, levasMagneticas: true },
        { id: "RS3", label: "RS3", basePrice: 620, levasMagneticas: true },
      ],
      logos: ["S line", "RS", "S"],
      brandLogo: "assets/img/gallery/AUDI.png",
    },
    Volkswagen: {
      modelos: [
        { id: "Golf R", label: "Golf R", basePrice: 560, levasMagneticas: true },
        { id: "Golf GTI", label: "Golf GTI", basePrice: 510, levasMagneticas: false },
        { id: "Golf GTD", label: "Golf GTD", basePrice: 500, levasMagneticas: false },
      ],
      logos: ["R", "R-Line", "GTI", "GTD"],
      brandLogo: "assets/img/gallery/Volkswagen.png",
    },
    Mercedes: {
      modelos: [
        { id: "A45", label: "A45", basePrice: 610, levasMagneticas: true },
        { id: "C63", label: "C63", basePrice: 720, levasMagneticas: true },
        { id: "CLA45", label: "CLA45", basePrice: 640, levasMagneticas: true },
      ],
      logos: ["AMG", "Mercedes", "Night Package"],
      brandLogo: "assets/img/gallery/MERCEDES.png",
    },
  };

  const optionData = {
    aro: [
      {
        id: "carbono",
        label: "Carbono",
        price: 160,
        texture: "carbono",
        materialProfile: "carbon",
        swatch: "linear-gradient(45deg, #090909, #4d4d4d 45%, #141414 50%, #666)",
      },
      {
        id: "alcantara",
        label: "Alcantara",
        price: 90,
        texture: "alcantara",
        materialProfile: "fabric",
        swatch: "linear-gradient(135deg, #161616, #727272)",
      },
      {
        id: "cuero",
        label: "Cuero",
        price: 0,
        texture: "cuero",
        materialProfile: "leather",
        swatch: "linear-gradient(135deg, #050505, #3a3a3a)",
      },
      {
        id: "carbono-forjado",
        label: "Carbono forjado",
        price: 220,
        texture: "carbonoForjado",
        materialProfile: "forgedCarbon",
        swatch: "radial-gradient(circle, #8a8a8a 0 9%, #101010 10% 100%)",
      },
    ],
    agarres: [
      {
        id: "cuero-perforado",
        label: "Cuero perforado",
        price: 60,
        texture: "cueroPerforado",
        materialProfile: "leather",
        swatch: "repeating-radial-gradient(circle, #050505 0 3px, #4a4a4a 4px 8px)",
      },
      {
        id: "cuero-liso",
        label: "Cuero liso",
        price: 35,
        texture: "cuero",
        materialProfile: "leather",
        swatch: "linear-gradient(135deg, #050505, #343434)",
      },
      {
        id: "alcantara",
        label: "Alcantara",
        price: 75,
        texture: "alcantara",
        materialProfile: "fabric",
        swatch: "linear-gradient(135deg, #171717, #707070)",
      },
    ],
    costuras: [
      { id: "rojo", label: "Rojo", price: 20, color: "#d62828", swatch: "#d62828" },
      { id: "azul", label: "Azul", price: 20, color: "#1b61ff", swatch: "#1b61ff" },
      { id: "blanco", label: "Blanco", price: 15, color: "#f5f5f5", swatch: "#f5f5f5" },
      {
        id: "tricolor",
        label: "Tricolor",
        price: 45,
        texture: "tricolor",
        swatch: "linear-gradient(90deg, #1b61ff 0 33%, #f5f5f5 33% 66%, #d62828 66% 100%)",
      },
      {
        id: "italiano",
        label: "Italiano",
        price: 45,
        texture: "italiano",
        swatch: "linear-gradient(90deg, #119447 0 33%, #fff 33% 66%, #d62828 66% 100%)",
      },
      {
        id: "aleman",
        label: "Aleman",
        price: 45,
        texture: "aleman",
        swatch: "linear-gradient(90deg, #111 0 33%, #d62828 33% 66%, #f2c94c 66% 100%)",
      },
      {
        id: "frances",
        label: "Frances",
        price: 45,
        texture: "frances",
        swatch: "linear-gradient(90deg, #1b61ff 0 33%, #fff 33% 66%, #d62828 66% 100%)",
      },
    ],
    pantallaRpm: [
      { id: true, label: "Si", price: 180 },
      { id: false, label: "No", price: 0 },
    ],
    levas: [
      { id: "sin-levas", label: "Sin levas", price: 0 },
      { id: "magneticas", label: "Magneticas", price: 160, needsMagnetic: true },
      { id: "aluminio", label: "Aluminio", price: 70 },
      { id: "carbono", label: "Carbono", price: 90 },
    ],
    marcador: [
      { id: "negro", label: "OEM negro", price: 0, color: "#111111", swatch: "#111111" },
      { id: "rojo", label: "Rojo", price: 15, color: "#d62828", swatch: "#d62828" },
      { id: "azul", label: "Azul", price: 15, color: "#1b61ff", swatch: "#1b61ff" },
      { id: "blanco", label: "Blanco", price: 10, color: "#f5f5f5", swatch: "#f5f5f5" },
      { id: "amarillo", label: "Amarillo", price: 15, color: "#f2c94c", swatch: "#f2c94c" },
      {
        id: "tricolor",
        label: "Tricolor",
        price: 35,
        texture: "tricolorVertical",
        swatch: "linear-gradient(180deg, #1b61ff 0 33%, #fff 33% 66%, #d62828 66% 100%)",
      },
    ],
  };

  const config = {
    marca: "BMW",
    modelo: "E46",
    aro: "alcantara",
    agarres: "alcantara",
    costuras: "blanco",
    logo: "M",
    pantallaRpm: false,
    levas: "sin-levas",
    marcador: "negro",
  };

  const state = {
    engine: null,
    scene: null,
    camera: null,
    canvas: null,
    modelRoot: null,
    parts: {},
    materials: {},
    textures: {},
    price: 0,
    priceLines: [],
    loadedFromGlb: false,
    placeholderStyle: "",
    resizeObserver: null,
  };

  const root = document.querySelector("[data-configurator]");
  const nodes = {
    stage: root?.querySelector("[data-babylon-stage]"),
    canvas: root?.querySelector("[data-babylon-canvas]"),
    loader: root?.querySelector("[data-babylon-loader]"),
    resetCamera: root?.querySelector("[data-camera-reset]"),
    selects: {
      marca: root?.querySelector('[data-config-select="marca"]'),
      modelo: root?.querySelector('[data-config-select="modelo"]'),
      logo: root?.querySelector('[data-config-select="logo"]'),
    },
    optionGroups: Array.from(root?.querySelectorAll("[data-option-group]") || []),
    stepButtons: Array.from(root?.querySelectorAll("[data-step-target]") || []),
    stepPanels: Array.from(root?.querySelectorAll("[data-step-panel]") || []),
    brandLogo: root?.querySelector("[data-brand-logo]"),
    brandBadge: root?.querySelector("[data-brand-badge]"),
    compatibilityStatus: root?.querySelector("[data-compatibility-status]"),
    previewBase: root?.querySelector("[data-preview-base]"),
    previewBackend: root?.querySelector("[data-preview-backend]"),
    summary: Array.from(root?.querySelectorAll("[data-summary]") || []),
    price: root?.querySelector("[data-summary-price]"),
    priceBreakdown: root?.querySelector("[data-price-breakdown]"),
    jsonOutput: root?.querySelector("[data-config-json]"),
    requestLink: root?.querySelector("[data-config-request]"),
  };

  function initConfigurator() {
    if (!root || !nodes.canvas || !nodes.stage) return;

    if (!window.BABYLON) {
      showViewerMessage("Babylon.js no se ha podido cargar");
      return;
    }

    initBabylonScene();
    bindConfiguratorEvents();
    updateAvailableOptions();
    updateSummary();
    updatePrice();

    loadSteeringModel().then(() => {
      updateModelAppearance();
      hideLoader();
    });
  }

  function initBabylonScene() {
    state.canvas = nodes.canvas;
    state.engine = new BABYLON.Engine(state.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    state.scene = new BABYLON.Scene(state.engine);
    state.scene.clearColor = new BABYLON.Color4(0.006, 0.006, 0.007, 0);
    state.scene.environmentIntensity = 0.85;
    state.scene.imageProcessingConfiguration.toneMappingEnabled = true;
    state.scene.imageProcessingConfiguration.toneMappingType =
      BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    state.scene.imageProcessingConfiguration.exposure = 1.08;
    state.scene.imageProcessingConfiguration.contrast = 1.18;

    state.camera = new BABYLON.ArcRotateCamera(
      "cdp_camera",
      Math.PI / 2,
      Math.PI / 2,
      5.0,
      new BABYLON.Vector3(0, 0.02, 0),
      state.scene
    );
    state.camera.attachControl(state.canvas, true);
    state.camera.lowerRadiusLimit = 3.0;
    state.camera.upperRadiusLimit = 6.6;
    state.camera.lowerBetaLimit = Math.PI / 2.55;
    state.camera.upperBetaLimit = Math.PI / 1.55;
    state.camera.angularSensibilityX = 520;
    state.camera.angularSensibilityY = 560;
    state.camera.wheelPrecision = 36;
    state.camera.panningSensibility = 0;
    state.camera.inertia = 0.82;
    state.camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

    addPremiumLighting();
    createTextureLibrary();
    createMaterialLibrary();
    createStudioBase();

    state.engine.runRenderLoop(() => {
      state.scene.render();
    });

    resizeRenderer();
    if ("ResizeObserver" in window) {
      state.resizeObserver = new ResizeObserver(resizeRenderer);
      state.resizeObserver.observe(nodes.stage);
    }
    window.addEventListener("resize", resizeRenderer);
  }

  function addPremiumLighting() {
    const hemi = new BABYLON.HemisphericLight(
      "cdp_hemi",
      new BABYLON.Vector3(0, 1, 0),
      state.scene
    );
    hemi.intensity = 0.72;
    hemi.groundColor = new BABYLON.Color3(0.02, 0.02, 0.024);

    const key = new BABYLON.DirectionalLight(
      "cdp_key",
      new BABYLON.Vector3(-0.4, -0.85, -0.34),
      state.scene
    );
    key.position = new BABYLON.Vector3(4.2, 6.0, 5.2);
    key.intensity = 3.4;

    const redRim = new BABYLON.PointLight(
      "cdp_red_rim",
      new BABYLON.Vector3(-3.3, 1.1, 2.3),
      state.scene
    );
    redRim.diffuse = new BABYLON.Color3(0.9, 0.12, 0.12);
    redRim.specular = new BABYLON.Color3(1, 0.24, 0.2);
    redRim.intensity = 2.35;
    redRim.range = 7.2;

    const coolRim = new BABYLON.PointLight(
      "cdp_cool_rim",
      new BABYLON.Vector3(3.2, -0.5, 2.2),
      state.scene
    );
    coolRim.diffuse = new BABYLON.Color3(0.28, 0.42, 1);
    coolRim.specular = new BABYLON.Color3(0.42, 0.54, 1);
    coolRim.intensity = 1.1;
    coolRim.range = 7;

    const top = new BABYLON.SpotLight(
      "cdp_top_spot",
      new BABYLON.Vector3(0, 3.4, 2.6),
      new BABYLON.Vector3(0, -1, -0.45),
      Math.PI / 2.2,
      18,
      state.scene
    );
    top.intensity = 1.8;

    const glow = new BABYLON.GlowLayer("cdp_glow", state.scene, {
      mainTextureSamples: 4,
      blurKernelSize: 28,
    });
    glow.intensity = 0.22;
  }

  function createStudioBase() {
    const backdrop = BABYLON.MeshBuilder.CreatePlane(
      "studio_fabric_backdrop",
      { width: 5.3, height: 4.05 },
      state.scene
    );
    backdrop.position = new BABYLON.Vector3(0, 0, -0.42);

    const material = new BABYLON.PBRMaterial("studio_fabric_mat", state.scene);
    material.albedoTexture = createFabricBackdropTexture();
    material.albedoColor = new BABYLON.Color3(0.55, 0.55, 0.55);
    material.metallic = 0;
    material.roughness = 0.96;
    material.backFaceCulling = false;
    backdrop.material = material;
    backdrop.isPickable = false;

    const shadow = BABYLON.MeshBuilder.CreatePlane(
      "studio_floor_shadow",
      { width: 3.4, height: 0.66 },
      state.scene
    );
    shadow.position = new BABYLON.Vector3(0, -1.34, -0.2);

    const shadowMat = new BABYLON.StandardMaterial("studio_floor_shadow_mat", state.scene);
    shadowMat.diffuseTexture = createShadowTexture();
    shadowMat.opacityTexture = shadowMat.diffuseTexture;
    shadowMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    shadowMat.disableLighting = true;
    shadowMat.backFaceCulling = false;
    shadow.material = shadowMat;
    shadow.isPickable = false;
  }

  function createFabricBackdropTexture() {
    const texture = new BABYLON.DynamicTexture(
      "black_fabric_backdrop_texture",
      { width: 1024, height: 1024 },
      state.scene,
      false
    );
    const ctx = texture.getContext();
    ctx.fillStyle = "#090909";
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 9000; i += 1) {
      const shade = 8 + Math.random() * 42;
      const alpha = 0.06 + Math.random() * 0.12;
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${alpha})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }

    for (let y = 0; y < 1024; y += 8) {
      ctx.strokeStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.02})`;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.random() * 6);
      ctx.lineTo(1024, y + Math.random() * 6);
      ctx.stroke();
    }

    texture.update(false);
    texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    return texture;
  }

  function createShadowTexture() {
    const texture = new BABYLON.DynamicTexture(
      "wheel_floor_shadow_texture",
      { width: 512, height: 192 },
      state.scene,
      true
    );
    const ctx = texture.getContext();
    const gradient = ctx.createRadialGradient(256, 96, 24, 256, 96, 230);
    gradient.addColorStop(0, "rgba(0,0,0,0.72)");
    gradient.addColorStop(0.58, "rgba(0,0,0,0.34)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.clearRect(0, 0, 512, 192);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 192);
    texture.hasAlpha = true;
    texture.update(false);
    return texture;
  }

  function loadSteeringModel() {
    const split = splitModelUrl(MODEL_URL);

    return BABYLON.SceneLoader.ImportMeshAsync("", split.root, split.file, state.scene)
      .then((result) => {
        const meshes = result.meshes.filter((mesh) => mesh instanceof BABYLON.Mesh && mesh.name !== "__root__");
        if (!meshes.length) throw new Error("Modelo GLB sin meshes utiles");

        resetParts();
        const importedRoot = new BABYLON.TransformNode("volante_glb_root", state.scene);
        meshes.forEach((mesh) => {
          mesh.parent = importedRoot;
          mesh.isPickable = false;
          if (!mesh.material) mesh.material = state.materials.molduras;
        });

        state.modelRoot = importedRoot;
        state.loadedFromGlb = true;
        normalizeImportedModel(importedRoot);
        registerImportedParts(meshes);
      })
      .catch(() => {
        state.loadedFromGlb = false;
        createPlaceholderWheel();
      });
  }

  function splitModelUrl(url) {
    const lastSlash = url.lastIndexOf("/");
    return {
      root: lastSlash >= 0 ? url.slice(0, lastSlash + 1) : "",
      file: lastSlash >= 0 ? url.slice(lastSlash + 1) : url,
    };
  }

  function normalizeImportedModel(modelRoot) {
    modelRoot.computeWorldMatrix(true);
    const bounds = modelRoot.getHierarchyBoundingVectors(true);
    const size = bounds.max.subtract(bounds.min);
    const center = bounds.min.add(size.scale(0.5));
    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = maxAxis > 0 ? 3.1 / maxAxis : 1;

    modelRoot.getChildMeshes().forEach((mesh) => {
      mesh.position.subtractInPlace(center);
    });
    modelRoot.scaling = new BABYLON.Vector3(scale, scale, scale);
    modelRoot.position = new BABYLON.Vector3(0, 0, 0.05);
    modelRoot.rotation = new BABYLON.Vector3(0, 0, 0);
  }

  function registerImportedParts(meshes) {
    meshes.forEach((mesh) => {
      const partKey = getPartKeyFromName(mesh.name);
      registerPart(partKey, mesh);
    });

    if (!getParts("aro").length && meshes[0]) {
      registerPart("aro", meshes[0]);
    }
  }

  function getPartKeyFromName(name) {
    const normalized = normalizeName(name);
    const priority = [
      "pantalla_rpm",
      "levas",
      "marcador_superior",
      "costuras",
      "agarres_laterales",
      "logo",
      "molduras",
      "aro",
    ];

    for (const key of priority) {
      if (partAliases[key].some((alias) => normalized.includes(alias))) return key;
    }
    return "molduras";
  }

  function createPlaceholderWheel() {
    if (isAudiRSStyle()) {
      createAudiRSPlaceholderWheel();
      return;
    }

    resetParts();
    state.placeholderStyle = "default";

    const wheel = new BABYLON.TransformNode("volante_placeholder_root", state.scene);
    wheel.position = new BABYLON.Vector3(0, -0.02, 0.06);
    wheel.rotation = new BABYLON.Vector3(0, 0, 0);
    wheel.scaling = new BABYLON.Vector3(1.04, 1.04, 1.04);
    state.modelRoot = wheel;

    const aro = BABYLON.MeshBuilder.CreateTorus(
      "aro",
      { diameter: 3.05, thickness: 0.34, tessellation: 300 },
      state.scene
    );
    aro.parent = wheel;
    aro.rotation.x = Math.PI / 2;
    aro.scaling = new BABYLON.Vector3(1.07, 0.2, 0.9);
    aro.position.z = 0.0;
    registerPart("aro", aro);

    const aroSoftShadow = BABYLON.MeshBuilder.CreateTorus(
      "aro_soft_shadow",
      { diameter: 2.63, thickness: 0.038, tessellation: 260 },
      state.scene
    );
    aroSoftShadow.parent = wheel;
    aroSoftShadow.rotation.x = Math.PI / 2;
    aroSoftShadow.scaling = new BABYLON.Vector3(1.07, 0.2, 0.9);
    aroSoftShadow.position.z = 0.16;
    aroSoftShadow.material = state.materials.shadowTrim;

    const leftGrip = createGripArc("agarres_laterales_left", 2.36, 3.92, wheel);
    const rightGrip = createGripArc("agarres_laterales_right", -0.78, 0.78, wheel);
    registerPart("agarres_laterales", leftGrip);
    registerPart("agarres_laterales", rightGrip);

    createRoundedSpoke("molduras_left_spoke", -0.72, 0.1, 0.18, 1.08, 0.28, -0.06, wheel);
    createRoundedSpoke("molduras_right_spoke", 0.72, 0.1, 0.18, 1.08, 0.28, 0.06, wheel);
    createRoundedSpoke("molduras_lower_spoke", 0, -0.72, 0.17, 1.02, 0.45, Math.PI / 2, wheel);

    const center = BABYLON.MeshBuilder.CreateSphere(
      "molduras_centro_airbag",
      { diameter: 1.08, segments: 72 },
      state.scene
    );
    center.parent = wheel;
    center.position.z = 0.35;
    center.scaling = new BABYLON.Vector3(1.18, 0.86, 0.24);
    center.material = state.materials.center;
    registerPart("molduras", center);

    const centerRing = BABYLON.MeshBuilder.CreateTorus(
      "molduras_centro_ring",
      { diameter: 0.43, thickness: 0.022, tessellation: 128 },
      state.scene
    );
    centerRing.parent = wheel;
    centerRing.rotation.x = Math.PI / 2;
    centerRing.position.z = 0.61;
    centerRing.material = state.materials.metalTrim;
    registerPart("molduras", centerRing);

    createButtonCluster("molduras_buttons_left", -1.03, 0.28, wheel);
    createButtonCluster("molduras_buttons_right", 1.03, 0.28, wheel);
    createThreadSegments(wheel);
    createLogo(wheel);
    createLowerBadge(wheel);
    createMarker(wheel);
    createRpmScreen(wheel);
    createPaddles(wheel);
  }

  function createAudiRSPlaceholderWheel() {
    resetParts();
    state.placeholderStyle = "audi-rs";

    const wheel = new BABYLON.TransformNode("volante_audi_rs_placeholder_root", state.scene);
    wheel.position = new BABYLON.Vector3(0, -0.03, 0.06);
    wheel.rotation = new BABYLON.Vector3(0, 0, 0);
    wheel.scaling = new BABYLON.Vector3(1.02, 1.02, 1.02);
    state.modelRoot = wheel;

    const aro = BABYLON.MeshBuilder.CreateTube(
      "aro_audi_rs_flat_bottom",
      {
        path: createAudiRSRimPath(),
        radius: 0.155,
        tessellation: 42,
        cap: BABYLON.Mesh.CAP_ALL,
      },
      state.scene
    );
    aro.parent = wheel;
    aro.material = state.materials.aro;
    registerPart("aro", aro);

    [
      { name: "agarres_laterales_left", x: -1.33, y: 0.52, rz: -0.36 },
      { name: "agarres_laterales_right", x: 1.33, y: 0.52, rz: 0.36 },
    ].forEach((item) => {
      const grip = BABYLON.MeshBuilder.CreateSphere(
        item.name,
        { diameter: 0.58, segments: 48 },
        state.scene
      );
      grip.parent = wheel;
      grip.position = new BABYLON.Vector3(item.x, item.y, 0.16);
      grip.scaling = new BABYLON.Vector3(0.44, 0.92, 0.28);
      grip.rotation.z = item.rz;
      registerPart("agarres_laterales", grip);
    });

    createAudiRSSpoke("molduras_audi_left_spoke", -0.62, -0.08, -0.1, wheel);
    createAudiRSSpoke("molduras_audi_right_spoke", 0.62, -0.08, 0.1, wheel);
    createAudiRSBottomSpoke(wheel);
    createAudiRSButtonPanel("molduras_audi_buttons_left", -0.92, 0.12, -0.08, wheel);
    createAudiRSButtonPanel("molduras_audi_buttons_right", 0.92, 0.12, 0.08, wheel);
    createAudiRSPaddles(wheel);
    createAudiRSCenter(wheel);
    createAudiRSStitches(wheel);
    createMarker(wheel);
    createRpmScreen(wheel);
  }

  function createAudiRSRimPath() {
    const points = [];
    const steps = 128;

    for (let i = 0; i <= steps; i += 1) {
      const angle = (Math.PI * 2 * i) / steps;
      const x = Math.cos(angle) * 1.58;
      let y = Math.sin(angle) * 1.35;

      if (y < -0.98) {
        y = -1.08 + Math.pow(Math.abs(x) / 1.58, 3.2) * 0.16;
      }

      const topPinch = Math.max(0, 1 - Math.abs(x) / 0.18);
      if (y > 1.18) y -= topPinch * 0.05;

      points.push(new BABYLON.Vector3(x, y, 0.05));
    }

    return points;
  }

  function createAudiRSSpoke(name, x, y, rotationZ, parent) {
    const group = new BABYLON.TransformNode(name, state.scene);
    group.parent = parent;
    group.position = new BABYLON.Vector3(x, y, 0.28);
    group.rotation.z = rotationZ;

    const spoke = BABYLON.MeshBuilder.CreateBox(
      `${name}_blade`,
      { width: 0.78, height: 0.18, depth: 0.12 },
      state.scene
    );
    spoke.parent = group;
    spoke.material = state.materials.molduras;
    registerPart("molduras", spoke);

    const lip = BABYLON.MeshBuilder.CreateBox(
      `${name}_upper_lip`,
      { width: 0.76, height: 0.035, depth: 0.04 },
      state.scene
    );
    lip.parent = group;
    lip.position = new BABYLON.Vector3(0, 0.105, 0.055);
    lip.material = state.materials.metalTrim;
    registerPart("molduras", lip);
  }

  function createAudiRSBottomSpoke(parent) {
    const bridge = BABYLON.MeshBuilder.CreateBox(
      "molduras_audi_bottom_y_spoke",
      { width: 0.48, height: 0.68, depth: 0.15 },
      state.scene
    );
    bridge.parent = parent;
    bridge.position = new BABYLON.Vector3(0, -0.66, 0.26);
    bridge.material = state.materials.molduras;
    registerPart("molduras", bridge);

    const cutout = BABYLON.MeshBuilder.CreateBox(
      "molduras_audi_bottom_cutout_shadow",
      { width: 0.27, height: 0.36, depth: 0.04 },
      state.scene
    );
    cutout.parent = parent;
    cutout.position = new BABYLON.Vector3(0, -0.66, 0.36);
    cutout.material = state.materials.shadowTrim;
    registerPart("molduras", cutout);

    const badge = BABYLON.MeshBuilder.CreatePlane(
      "molduras_audi_rs_badge_lower",
      { width: 0.28, height: 0.095 },
      state.scene
    );
    badge.parent = parent;
    badge.position = new BABYLON.Vector3(0, -1.02, 0.42);
    badge.material = createAudiRSBadgeMaterial();
    registerPart("molduras", badge);
  }

  function createAudiRSButtonPanel(name, x, y, rotationZ, parent) {
    const group = new BABYLON.TransformNode(name, state.scene);
    group.parent = parent;
    group.position = new BABYLON.Vector3(x, y, 0.42);
    group.rotation.z = rotationZ;

    const panel = BABYLON.MeshBuilder.CreateBox(
      `${name}_trapezoid_panel`,
      { width: 0.52, height: 0.27, depth: 0.08 },
      state.scene
    );
    panel.parent = group;
    panel.scaling.x = 1.18;
    panel.material = state.materials.buttonPanel;
    registerPart("molduras", panel);

    const buttons = [
      [-0.14, 0.045, 0.105, 0.052],
      [0.04, 0.052, 0.112, 0.048],
      [-0.12, -0.07, 0.08, 0.065],
      [0.075, -0.07, 0.115, 0.055],
    ];

    buttons.forEach(([bx, by, width, height], index) => {
      const button = BABYLON.MeshBuilder.CreateBox(
        `${name}_button_${index}`,
        { width, height, depth: 0.026 },
        state.scene
      );
      button.parent = group;
      button.position = new BABYLON.Vector3(bx, by, 0.055);
      button.material = state.materials.buttonFace;
      registerPart("molduras", button);
    });

    const iconDot = BABYLON.MeshBuilder.CreateCylinder(
      `${name}_small_round_button`,
      { diameter: 0.058, height: 0.026, tessellation: 24 },
      state.scene
    );
    iconDot.parent = group;
    iconDot.rotation.x = Math.PI / 2;
    iconDot.position = new BABYLON.Vector3(0.18, 0.065, 0.06);
    iconDot.material = state.materials.buttonFace;
    registerPart("molduras", iconDot);
  }

  function createAudiRSPaddles(parent) {
    [-1, 1].forEach((side) => {
      const paddle = BABYLON.MeshBuilder.CreateBox(
        side < 0 ? "levas_audi_rs_left" : "levas_audi_rs_right",
        { width: 0.16, height: 0.86, depth: 0.052 },
        state.scene
      );
      paddle.parent = parent;
      paddle.position = new BABYLON.Vector3(side * 1.16, 0.09, -0.18);
      paddle.rotation.z = side * -0.18;
      paddle.material = state.materials.levasCarbono;
      registerPart("levas", paddle);

      [-0.25, 0, 0.25].forEach((offset, index) => {
        const hole = BABYLON.MeshBuilder.CreateCylinder(
          `levas_audi_rs_hole_${side}_${index}`,
          { diameter: 0.075, height: 0.018, tessellation: 24 },
          state.scene
        );
        hole.parent = parent;
        hole.rotation.x = Math.PI / 2;
        hole.position = new BABYLON.Vector3(side * 1.16, 0.09 + offset, -0.145);
        hole.material = state.materials.shadowTrim;
        registerPart("levas", hole);
      });
    });
  }

  function createAudiRSCenter(parent) {
    const center = BABYLON.MeshBuilder.CreateSphere(
      "molduras_audi_round_airbag",
      { diameter: 0.96, segments: 96 },
      state.scene
    );
    center.parent = parent;
    center.position = new BABYLON.Vector3(0, -0.04, 0.42);
    center.scaling = new BABYLON.Vector3(1, 1, 0.2);
    center.material = state.materials.center;
    registerPart("molduras", center);

    for (let i = 0; i < 9; i += 1) {
      const seam = BABYLON.MeshBuilder.CreateTorus(
        `costuras_audi_center_ring_${i}`,
        { diameter: 0.72 + i * 0.023, thickness: 0.004, tessellation: 120 },
        state.scene
      );
      seam.parent = parent;
      seam.rotation.x = Math.PI / 2;
      seam.position = new BABYLON.Vector3(0, -0.04, 0.63 + i * 0.001);
      registerPart("costuras", seam);
    }

    createAudiLogo(parent);
  }

  function createAudiLogo(parent) {
    for (let i = 0; i < 4; i += 1) {
      const ring = BABYLON.MeshBuilder.CreateTorus(
        `logo_audi_ring_${i}`,
        { diameter: 0.16, thickness: 0.018, tessellation: 64 },
        state.scene
      );
      ring.parent = parent;
      ring.rotation.x = Math.PI / 2;
      ring.position = new BABYLON.Vector3(-0.135 + i * 0.09, -0.01, 0.66);
      ring.material = state.materials.logoBase;
      registerPart("logo", ring);
    }

    const rsPlane = BABYLON.MeshBuilder.CreatePlane(
      "logo_audi_rs_text",
      { width: 0.28, height: 0.07 },
      state.scene
    );
    rsPlane.parent = parent;
    rsPlane.position = new BABYLON.Vector3(0, -0.2, 0.665);
    rsPlane.material = createAudiRSBadgeMaterial();
    registerPart("logo", rsPlane);
  }

  function createAudiRSStitches(parent) {
    [
      [-1.48, -1.08, -0.82, 0.1],
      [1.48, -1.08, 0.82, -0.1],
      [-0.03, 1.35, 0, 0],
      [-1.05, 0.94, -0.62, -0.32],
      [1.05, 0.94, 0.62, 0.32],
    ].forEach(([x, y, rx, rz], groupIndex) => {
      for (let i = 0; i < 5; i += 1) {
        const stitch = BABYLON.MeshBuilder.CreateBox(
          `costuras_audi_rs_${groupIndex}_${i}`,
          { width: 0.012, height: 0.11, depth: 0.01 },
          state.scene
        );
        stitch.parent = parent;
        stitch.position = new BABYLON.Vector3(x + (i - 2) * 0.018, y, 0.34);
        stitch.rotation.z = rx + rz;
        registerPart("costuras", stitch);
      }
    });
  }

  function createAudiRSBadgeMaterial() {
    const texture = new BABYLON.DynamicTexture("audi_rs_badge_texture", { width: 256, height: 96 }, state.scene, true);
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "#d62828";
    ctx.fillRect(24, 28, 42, 40);
    ctx.fillStyle = "#f4f4f4";
    ctx.font = "900 42px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("RS", 78, 50);
    texture.hasAlpha = true;
    texture.update(false);

    const material = new BABYLON.PBRMaterial("audi_rs_badge_material", state.scene);
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveIntensity = 0.1;
    material.metallic = 0;
    material.roughness = 0.36;
    material.backFaceCulling = false;
    material.useAlphaFromAlbedoTexture = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    return material;
  }

  function createGripArc(name, startAngle, endAngle, parent) {
    const points = [];
    const steps = 42;

    for (let i = 0; i <= steps; i += 1) {
      const angle = startAngle + ((endAngle - startAngle) * i) / steps;
      points.push(new BABYLON.Vector3(
        Math.cos(angle) * 1.62,
        Math.sin(angle) * 1.28,
        0.24
      ));
    }

    const grip = BABYLON.MeshBuilder.CreateTube(
      name,
      {
        path: points,
        radius: 0.12,
        tessellation: 28,
        cap: BABYLON.Mesh.CAP_ALL,
      },
      state.scene
    );
    grip.parent = parent;
    return grip;
  }

  function createRoundedSpoke(name, x, y, z, width, height, rotationZ, parent) {
    const group = new BABYLON.TransformNode(name, state.scene);
    group.parent = parent;
    group.position = new BABYLON.Vector3(x, y, z);
    group.rotation.z = rotationZ;

    const coreWidth = Math.max(width - height, 0.04);
    const core = BABYLON.MeshBuilder.CreateBox(
      `${name}_core`,
      { width: coreWidth, height, depth: 0.18 },
      state.scene
    );
    core.parent = group;
    core.material = state.materials.molduras;
    registerPart("molduras", core);

    [-1, 1].forEach((side) => {
      const cap = BABYLON.MeshBuilder.CreateCylinder(
        `${name}_cap_${side}`,
        { diameter: height, height: 0.18, tessellation: 44 },
        state.scene
      );
      cap.parent = group;
      cap.rotation.x = Math.PI / 2;
      cap.position.x = side * coreWidth * 0.5;
      cap.material = state.materials.molduras;
      registerPart("molduras", cap);
    });

    return group;
  }

  function createDisc(name, diameter, depth, parent) {
    const disc = BABYLON.MeshBuilder.CreateCylinder(
      name,
      { diameter, height: depth, tessellation: 96 },
      state.scene
    );
    disc.parent = parent;
    disc.rotation.x = Math.PI / 2;
    return disc;
  }

  function createButtonCluster(name, x, y, parent) {
    const group = new BABYLON.TransformNode(name, state.scene);
    group.parent = parent;
    group.position = new BABYLON.Vector3(x, y, 0.36);
    group.rotation.z = x < 0 ? -0.22 : 0.22;

    const base = createRoundedButtonPanel(`${name}_panel`, group);

    const positions = [
      { x: -0.095, y: 0.06 },
      { x: 0.095, y: 0.06 },
      { x: -0.095, y: -0.06 },
      { x: 0.095, y: -0.06 },
    ];

    positions.forEach((offset, index) => {
      const button = BABYLON.MeshBuilder.CreateCylinder(
        `${name}_button_${index}`,
        { diameter: 0.074, height: 0.03, tessellation: 24 },
        state.scene
      );
      button.parent = group;
      button.rotation.x = Math.PI / 2;
      button.position = new BABYLON.Vector3(offset.x, offset.y, 0.06);
      button.material = state.materials.buttonFace;
      registerPart("molduras", button);
    });

    return base;
  }

  function createRoundedButtonPanel(name, parent) {
    const panel = BABYLON.MeshBuilder.CreateBox(
      name,
      { width: 0.42, height: 0.3, depth: 0.09 },
      state.scene
    );
    panel.parent = parent;
    panel.material = state.materials.buttonPanel;
    registerPart("molduras", panel);
    return panel;
  }

  function createThreadSegments(parent) {
    const arcs = [
      [-2.62, -2.26],
      [-1.02, -0.66],
      [0.66, 1.02],
      [2.26, 2.62],
    ];

    arcs.forEach((range, index) => {
      for (let i = 0; i < 7; i += 1) {
        const start = range[0] + i * 0.045;
        const end = start + 0.022;
        const thread = createArcTube(`costuras_${index}_${i}`, 1.5, start, end, 0.36);
        thread.parent = parent;
        registerPart("costuras", thread);
      }
    });
  }

  function createArcTube(name, radius, startAngle, endAngle, z) {
    const points = [];
    const steps = 5;
    for (let i = 0; i <= steps; i += 1) {
      const angle = startAngle + ((endAngle - startAngle) * i) / steps;
      points.push(new BABYLON.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.78, z));
    }

    return BABYLON.MeshBuilder.CreateTube(
      name,
      { path: points, radius: 0.006, tessellation: 8, cap: BABYLON.Mesh.CAP_ALL },
      state.scene
    );
  }

  function createLogo(parent) {
    const logoDisc = createDisc("logo_base", 0.42, 0.032, parent);
    logoDisc.position.z = 0.64;
    logoDisc.material = state.materials.logoBase;
    registerPart("logo", logoDisc);

    const logoPlane = BABYLON.MeshBuilder.CreatePlane(
      "logo_decal",
      { width: 0.37, height: 0.37 },
      state.scene
    );
    logoPlane.parent = parent;
    logoPlane.position = new BABYLON.Vector3(0, 0, 0.682);
    logoPlane.material = state.materials.logo;
    registerPart("logo", logoPlane);
  }

  function createLowerBadge(parent) {
    const badge = BABYLON.MeshBuilder.CreatePlane(
      "molduras_m_badge_lower",
      { width: 0.24, height: 0.075 },
      state.scene
    );
    badge.parent = parent;
    badge.position = new BABYLON.Vector3(0, -1.06, 0.43);
    badge.material = state.materials.mBadge;
    registerPart("molduras", badge);
  }

  function createMarker(parent) {
    const marker = BABYLON.MeshBuilder.CreateBox(
      "marcador_superior",
      { width: 0.34, height: 0.075, depth: 0.045 },
      state.scene
    );
    marker.parent = parent;
    marker.position = new BABYLON.Vector3(0, 1.45, 0.4);
    marker.material = state.materials.marcador;
    registerPart("marcador_superior", marker);
  }

  function createRpmScreen(parent) {
    const screen = BABYLON.MeshBuilder.CreateBox(
      "pantalla_rpm",
      { width: 0.62, height: 0.2, depth: 0.055 },
      state.scene
    );
    screen.parent = parent;
    screen.position = new BABYLON.Vector3(0, 0.7, 0.5);
    screen.material = state.materials.pantalla;
    registerPart("pantalla_rpm", screen);

    for (let i = 0; i < 7; i += 1) {
      const led = BABYLON.MeshBuilder.CreateBox(
        `pantalla_rpm_led_${i}`,
        { width: 0.052, height: 0.018, depth: 0.012 },
        state.scene
      );
      led.parent = parent;
      led.position = new BABYLON.Vector3(-0.21 + i * 0.07, 0.7, 0.54);
      led.material = i < 4 ? state.materials.ledGreen : state.materials.ledRed;
      registerPart("pantalla_rpm", led);
    }
  }

  function createPaddles(parent) {
    [-1, 1].forEach((side) => {
      const paddle = BABYLON.MeshBuilder.CreateBox(
        side < 0 ? "levas_left" : "levas_right",
        { width: 0.18, height: 0.62, depth: 0.07 },
        state.scene
      );
      paddle.parent = parent;
      paddle.position = new BABYLON.Vector3(side * 1.34, 0.12, -0.18);
      paddle.rotation.z = side * 0.18;
      paddle.material = state.materials.levasCarbono;
      registerPart("levas", paddle);
    });
  }

  function createTextureLibrary() {
    state.textures = {
      cuero: createProceduralTexture("cuero"),
      cueroPerforado: createProceduralTexture("cueroPerforado"),
      alcantara: createProceduralTexture("alcantara"),
      carbono: createProceduralTexture("carbono"),
      carbonoForjado: createProceduralTexture("carbonoForjado"),
      tricolor: createStripeTexture(["#1b61ff", "#f5f5f5", "#d62828"]),
      italiano: createStripeTexture(["#119447", "#f5f5f5", "#d62828"]),
      aleman: createStripeTexture(["#111111", "#d62828", "#f2c94c"]),
      frances: createStripeTexture(["#1b61ff", "#f5f5f5", "#d62828"]),
      tricolorVertical: createStripeTexture(["#1b61ff", "#f5f5f5", "#d62828"], true),
    };
  }

  function createProceduralTexture(type) {
    const texture = new BABYLON.DynamicTexture(
      `${type}_texture`,
      { width: 512, height: 512 },
      state.scene,
      false
    );
    const ctx = texture.getContext();

    ctx.fillStyle = type.includes("carbono") ? "#111" : "#171717";
    ctx.fillRect(0, 0, 512, 512);

    if (type === "carbono") {
      for (let y = -512; y < 768; y += 34) {
        for (let x = -512; x < 768; x += 34) {
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(x + y * 0.45, y, 18, 18);
          ctx.fillStyle = "rgba(0,0,0,0.34)";
          ctx.fillRect(x + y * 0.45 + 18, y + 18, 18, 18);
        }
      }
    }

    if (type === "carbonoForjado") {
      for (let i = 0; i < 260; i += 1) {
        ctx.save();
        ctx.translate(Math.random() * 512, Math.random() * 512);
        ctx.rotate(Math.random() * Math.PI);
        ctx.fillStyle = `rgba(220,220,220,${0.05 + Math.random() * 0.18})`;
        ctx.fillRect(-18, -2, 36, 4);
        ctx.restore();
      }
    }

    if (type === "alcantara") {
      for (let i = 0; i < 1800; i += 1) {
        const shade = 35 + Math.random() * 80;
        ctx.fillStyle = `rgba(${shade},${shade},${shade},0.17)`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
      }
    }

    if (type === "cuero" || type === "cueroPerforado") {
      for (let i = 0; i < 850; i += 1) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.075})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.lineTo(Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }
    }

    if (type === "cueroPerforado") {
      for (let y = 24; y < 512; y += 42) {
        for (let x = 24; x < 512; x += 42) {
          ctx.fillStyle = "rgba(0,0,0,0.76)";
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    texture.update(false);
    texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    texture.uScale = 2.4;
    texture.vScale = 2.4;
    return texture;
  }

  function createStripeTexture(colors, vertical = false) {
    const texture = new BABYLON.DynamicTexture(
      `stripe_${colors.join("_")}_${vertical ? "v" : "h"}`,
      { width: 256, height: 256 },
      state.scene,
      false
    );
    const ctx = texture.getContext();
    const size = 256 / colors.length;

    colors.forEach((color, index) => {
      ctx.fillStyle = color;
      if (vertical) ctx.fillRect(0, index * size, 256, size);
      else ctx.fillRect(index * size, 0, size, 256);
    });

    texture.update(false);
    texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    texture.uScale = vertical ? 1 : 2;
    texture.vScale = vertical ? 2 : 1;
    return texture;
  }

  function createMaterialLibrary() {
    state.materials = {
      aro: createPbrMaterial("mat_aro", { texture: state.textures.carbono, metallic: 0.54, roughness: 0.3 }),
      agarres: createPbrMaterial("mat_agarres", { texture: state.textures.alcantara, metallic: 0.03, roughness: 0.88 }),
      center: createPbrMaterial("mat_center", { texture: state.textures.cuero, metallic: 0.08, roughness: 0.62 }),
      molduras: createPbrMaterial("mat_molduras", { color: "#151515", metallic: 0.68, roughness: 0.34 }),
      shadowTrim: createPbrMaterial("mat_shadow_trim", { color: "#060606", metallic: 0.4, roughness: 0.5 }),
      metalTrim: createPbrMaterial("mat_metal_trim", { color: "#2b2b2f", metallic: 0.78, roughness: 0.22 }),
      buttonPanel: createPbrMaterial("mat_button_panel", { color: "#080808", metallic: 0.6, roughness: 0.42 }),
      buttonFace: createPbrMaterial("mat_button_face", { color: "#242424", metallic: 0.46, roughness: 0.36 }),
      costuras: createPbrMaterial("mat_costuras", { color: "#d62828", metallic: 0.02, roughness: 0.58 }),
      marcador: createPbrMaterial("mat_marcador", { color: "#d62828", metallic: 0.16, roughness: 0.32 }),
      pantalla: createPbrMaterial("mat_pantalla", {
        color: "#031018",
        emissive: "#32ffa2",
        emissiveIntensity: 0.22,
        metallic: 0.18,
        roughness: 0.18,
      }),
      ledGreen: createPbrMaterial("mat_led_green", { color: "#2bff9a", emissive: "#2bff9a", emissiveIntensity: 1.4 }),
      ledRed: createPbrMaterial("mat_led_red", { color: "#ff2432", emissive: "#ff2432", emissiveIntensity: 1.4 }),
      levasCarbono: createPbrMaterial("mat_levas_carbono", { texture: state.textures.carbono, metallic: 0.58, roughness: 0.28 }),
      levasAluminio: createPbrMaterial("mat_levas_aluminio", { color: "#bec4ca", metallic: 0.92, roughness: 0.18 }),
      levasMagneticas: createPbrMaterial("mat_levas_magneticas", {
        color: "#101010",
        emissive: "#d62828",
        emissiveIntensity: 0.18,
        metallic: 0.78,
        roughness: 0.26,
      }),
      logoBase: createPbrMaterial("mat_logo_base", { color: "#060606", metallic: 0.48, roughness: 0.34 }),
      logo: createLogoMaterial(config.logo, config.marca),
      mBadge: createMBadgeMaterial(),
    };
  }

  function createPbrMaterial(name, options = {}) {
    const material = new BABYLON.PBRMaterial(name, state.scene);
    material.albedoColor = options.color ? hexToColor3(options.color) : new BABYLON.Color3(1, 1, 1);
    material.metallic = options.metallic ?? 0.12;
    material.roughness = options.roughness ?? 0.45;
    material.clearCoat.isEnabled = options.clearCoat ?? true;
    material.clearCoat.intensity = options.clearCoatIntensity ?? 0.42;
    material.clearCoat.roughness = options.clearCoatRoughness ?? 0.32;

    if (options.texture) {
      material.albedoTexture = options.texture;
      material.useRoughnessFromMetallicTextureAlpha = false;
    }

    if (options.emissive) {
      material.emissiveColor = hexToColor3(options.emissive);
      material.emissiveIntensity = options.emissiveIntensity ?? 0.35;
    }

    return material;
  }

  function createLogoMaterial(text, brand) {
    const texture = createLogoTexture(text, brand);
    const material = new BABYLON.PBRMaterial(`logo_${normalizeName(brand)}_${normalizeName(text)}`, state.scene);
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveIntensity = 0.18;
    material.metallic = 0;
    material.roughness = 0.38;
    material.backFaceCulling = false;
    material.useAlphaFromAlbedoTexture = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    return material;
  }

  function createMBadgeMaterial() {
    const texture = createMBadgeTexture();
    const material = new BABYLON.PBRMaterial("m_badge_lower_material", state.scene);
    material.albedoTexture = texture;
    material.emissiveTexture = texture;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveIntensity = 0.12;
    material.metallic = 0;
    material.roughness = 0.34;
    material.backFaceCulling = false;
    material.useAlphaFromAlbedoTexture = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    return material;
  }

  function createLogoTexture(text, brand) {
    const texture = new BABYLON.DynamicTexture(
      `logo_texture_${normalizeName(brand)}_${normalizeName(text)}`,
      { width: 512, height: 512 },
      state.scene,
      true
    );
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, 512, 512);

    if (brand === "BMW" && text === "M") {
      drawBMWRoundel(ctx);
    } else {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(5,5,5,0.88)";
      roundRect(ctx, 56, 162, 400, 170, 34);
      ctx.fill();
      ctx.strokeStyle = brand === "Audi" || brand === "Mercedes" ? "#d62828" : "#ffffff";
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = text.length > 10 ? "800 44px Arial" : "900 68px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 256, 247);
      ctx.restore();
    }

    texture.hasAlpha = true;
    texture.update(false);
    return texture;
  }

  function drawBMWRoundel(ctx) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#050505";
    ctx.beginPath();
    ctx.arc(256, 256, 154, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(256, 256, 102, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#f6f6f6";
    ctx.fillRect(154, 154, 204, 204);
    ctx.fillStyle = "#1f76ff";
    ctx.fillRect(256, 154, 102, 102);
    ctx.fillRect(154, 256, 102, 102);
    ctx.restore();

    ctx.strokeStyle = "#f5f5f5";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(256, 256, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#080808";
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(256, 256, 142, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BMW", 256, 136);
  }

  function drawMBadge(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    roundRect(ctx, 132, 338, 248, 70, 12);
    ctx.fill();
    ctx.fillStyle = "#2c7dff";
    ctx.fillRect(158, 354, 20, 38);
    ctx.fillStyle = "#5fb0ff";
    ctx.fillRect(183, 354, 20, 38);
    ctx.fillStyle = "#d62828";
    ctx.fillRect(208, 354, 20, 38);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 44px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("M", 248, 374);
  }

  function createMBadgeTexture() {
    const texture = new BABYLON.DynamicTexture(
      "m_badge_lower_texture",
      { width: 256, height: 96 },
      state.scene,
      true
    );
    const ctx = texture.getContext();
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "rgba(5,5,5,0.9)";
    roundRect(ctx, 16, 18, 224, 60, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#2c7dff";
    ctx.fillRect(38, 31, 18, 34);
    ctx.fillStyle = "#5fb0ff";
    ctx.fillRect(60, 31, 18, 34);
    ctx.fillStyle = "#d62828";
    ctx.fillRect(82, 31, 18, 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 38px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("M", 116, 49);
    texture.hasAlpha = true;
    texture.update(false);
    return texture;
  }

  function bindConfiguratorEvents() {
    root.addEventListener("change", (event) => {
      const select = event.target.closest("[data-config-select]");
      if (!select) return;

      config[select.dataset.configSelect] = select.value;
      updateAvailableOptions();
      updateModelAppearance();
      updateSummary();
      updatePrice();
    });

    root.addEventListener("click", (event) => {
      const option = event.target.closest("[data-config-option]");
      if (option && !option.disabled) {
        const key = option.dataset.configOption;
        config[key] = key === "pantallaRpm" ? option.dataset.value === "true" : option.dataset.value;
        updateAvailableOptions();
        updateModelAppearance();
        updateSummary();
        updatePrice();
        return;
      }

      const step = event.target.closest("[data-step-target]");
      if (step) {
        setActiveStep(step.dataset.stepTarget);
      }
    });

    nodes.resetCamera?.addEventListener("click", resetCamera);
  }

  function updateAvailableOptions() {
    const brandKeys = Object.keys(configuratorData);
    if (!configuratorData[config.marca]) config.marca = brandKeys[0];

    const brand = configuratorData[config.marca];
    if (!brand.modelos.some((model) => model.id === config.modelo)) {
      config.modelo = brand.modelos[0].id;
    }
    if (!brand.logos.includes(config.logo)) {
      config.logo = brand.logos[0];
    }

    sanitizeOption("levas");
    populateSelect(nodes.selects.marca, brandKeys.map((brandKey) => ({ id: brandKey, label: brandKey })), config.marca);
    populateSelect(nodes.selects.modelo, brand.modelos, config.modelo);
    populateSelect(nodes.selects.logo, brand.logos.map((logo) => ({ id: logo, label: logo })), config.logo);
    renderOptionGroups();
  }

  function populateSelect(select, options, selectedValue) {
    if (!select) return;
    select.innerHTML = "";
    options.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.label;
      option.selected = String(item.id) === String(selectedValue);
      select.appendChild(option);
    });
  }

  function renderOptionGroups() {
    nodes.optionGroups.forEach((groupNode) => {
      const key = groupNode.dataset.optionGroup;
      groupNode.innerHTML = "";

      (optionData[key] || []).forEach((option) => {
        groupNode.appendChild(createOptionButton(key, option));
      });
    });
  }

  function createOptionButton(key, option) {
    const button = document.createElement("button");
    const active = String(config[key]) === String(option.id);
    const compatible = isOptionCompatible(key, option);

    button.type = "button";
    button.className = `option-btn${active ? " is-active" : ""}`;
    button.dataset.configOption = key;
    button.dataset.value = String(option.id);
    button.disabled = !compatible;
    button.setAttribute("aria-pressed", active ? "true" : "false");

    if (!compatible) {
      button.title = "No compatible con el modelo seleccionado";
    }

    if (option.swatch) {
      const swatch = document.createElement("span");
      swatch.className = "option-swatch";
      swatch.style.background = option.swatch;
      button.appendChild(swatch);
    }

    const label = document.createElement("span");
    label.textContent = option.label;
    button.appendChild(label);

    if (option.price > 0) {
      const price = document.createElement("small");
      price.textContent = `+${formatPrice(option.price)}`;
      button.appendChild(price);
    }

    return button;
  }

  function sanitizeOption(key) {
    const current = getOption(key);
    if (current && isOptionCompatible(key, current)) return;

    const fallback = (optionData[key] || []).find((option) => isOptionCompatible(key, option));
    if (fallback) config[key] = fallback.id;
  }

  function isOptionCompatible(key, option) {
    if (key === "levas" && option.needsMagnetic) return !!getModel().levasMagneticas;
    return true;
  }

  function updateModelAppearance() {
    if (!state.modelRoot) return;

    rebuildProceduralModelIfNeeded();

    const aro = getOption("aro");
    const agarres = getOption("agarres");
    const costuras = getOption("costuras");
    const marcador = getOption("marcador");

    applyTextureToPart("aro", aro.texture, aro.materialProfile);
    applyTextureToPart("agarres_laterales", agarres.texture, agarres.materialProfile);
    applyThreadMaterial(costuras);
    applyMarkerMaterial(marcador);
    applyLogoTexture();
    applyPaddleMaterial();
    togglePart("pantalla_rpm", config.pantallaRpm);
    togglePart("levas", config.levas !== "sin-levas");

    updatePreviewMeta();
  }

  function rebuildProceduralModelIfNeeded() {
    if (state.loadedFromGlb) return;

    const nextStyle = isAudiRSStyle() ? "audi-rs" : "default";
    if (state.placeholderStyle === nextStyle) return;

    disposeCurrentModel();
    createPlaceholderWheel();
  }

  function disposeCurrentModel() {
    if (!state.modelRoot) return;

    state.modelRoot.getChildMeshes(false).forEach((mesh) => {
      mesh.dispose(false, false);
    });
    state.modelRoot.dispose();
    state.modelRoot = null;
    resetParts();
  }

  function isAudiRSStyle() {
    return config.marca === "Audi" && (/rs/i.test(config.modelo) || /rs/i.test(config.logo));
  }

  function applyMaterialToPart(partKey, material) {
    getParts(partKey).forEach((part) => {
      part.material = material;
    });
  }

  function applyTextureToPart(partKey, textureKey, profile = "leather") {
    const profileSettings = {
      carbon: { metallic: 0.56, roughness: 0.28, clearCoatIntensity: 0.72 },
      forgedCarbon: { metallic: 0.62, roughness: 0.24, clearCoatIntensity: 0.82 },
      leather: { metallic: 0.06, roughness: 0.62, clearCoatIntensity: 0.28 },
      fabric: { metallic: 0.02, roughness: 0.92, clearCoat: false },
    };
    const material = createPbrMaterial(
      `mat_${partKey}_${textureKey}`,
      {
        texture: state.textures[textureKey],
        ...(profileSettings[profile] || profileSettings.leather),
      }
    );
    applyMaterialToPart(partKey, material);
  }

  function applyThreadMaterial(option) {
    const material = option.texture
      ? createPbrMaterial("mat_costuras_pattern", {
          texture: state.textures[option.texture],
          metallic: 0.02,
          roughness: 0.58,
          clearCoatIntensity: 0.1,
        })
      : createPbrMaterial(`mat_costuras_${option.id}`, {
          color: option.color,
          metallic: 0.02,
          roughness: 0.58,
          clearCoatIntensity: 0.1,
        });
    applyMaterialToPart("costuras", material);
  }

  function applyMarkerMaterial(option) {
    const material = option.texture
      ? createPbrMaterial("mat_marcador_pattern", {
          texture: state.textures[option.texture],
          metallic: 0.2,
          roughness: 0.32,
        })
      : createPbrMaterial(`mat_marcador_${option.id}`, {
          color: option.color,
          metallic: 0.2,
          roughness: 0.32,
        });
    applyMaterialToPart("marcador_superior", material);
  }

  function applyLogoTexture() {
    if (state.placeholderStyle === "audi-rs") return;

    const material = createLogoMaterial(config.logo, config.marca);
    applyMaterialToPart("logo", material);
  }

  function applyPaddleMaterial() {
    if (config.levas === "aluminio") {
      applyMaterialToPart("levas", state.materials.levasAluminio);
      restoreAudiRSPaddleDetails();
      return;
    }
    if (config.levas === "magneticas") {
      applyMaterialToPart("levas", state.materials.levasMagneticas);
      restoreAudiRSPaddleDetails();
      return;
    }
    applyMaterialToPart("levas", state.materials.levasCarbono);
    restoreAudiRSPaddleDetails();
  }

  function restoreAudiRSPaddleDetails() {
    if (state.placeholderStyle !== "audi-rs") return;

    getParts("levas")
      .filter((part) => part.name.includes("_hole_"))
      .forEach((part) => {
        part.material = state.materials.shadowTrim;
      });
  }

  function togglePart(partKey, visible) {
    getParts(partKey).forEach((part) => {
      part.setEnabled(visible);
    });
  }

  function updateSummary() {
    const values = getSummaryLabels();
    nodes.summary.forEach((summaryNode) => {
      summaryNode.textContent = values[summaryNode.dataset.summary] || "";
    });
  }

  function updatePrice() {
    const model = getModel();
    const extras = [
      ["Aro", getOption("aro")],
      ["Agarres", getOption("agarres")],
      ["Costuras", getOption("costuras")],
      ["Pantalla RPM", getOption("pantallaRpm")],
      ["Levas", getOption("levas")],
      ["Marcador", getOption("marcador")],
    ];

    const extraLines = extras
      .filter(([, option]) => option && option.price > 0)
      .map(([label, option]) => ({
        label,
        option: option.label,
        amount: option.price,
      }));

    state.priceLines = [
      { label: `Base ${config.marca} ${model.label}`, amount: model.basePrice },
      ...extraLines,
    ];
    state.price = state.priceLines.reduce((total, line) => total + line.amount, 0);

    if (nodes.price) nodes.price.textContent = formatPrice(state.price);
    if (nodes.priceBreakdown) {
      nodes.priceBreakdown.innerHTML = state.priceLines
        .map((line, index) => {
          const sign = index === 0 ? "" : "+";
          const label = line.option ? `${line.label}: ${line.option}` : line.label;
          return `<div><span>${label}</span><strong>${sign}${formatPrice(line.amount)}</strong></div>`;
        })
        .join("");
    }

    updateBackendPayload();
  }

  function updateBackendPayload() {
    const payload = buildBackendPayload();
    const json = JSON.stringify(payload);
    if (nodes.jsonOutput) nodes.jsonOutput.value = json;
    if (nodes.requestLink) {
      nodes.requestLink.href = `contacto.html?configuracion=${encodeURIComponent(json)}`;
    }
  }

  function buildBackendPayload() {
    return {
      producto: "volante-personalizado-cdp-customs",
      configuracion: { ...config },
      resumen: getSummaryLabels(),
      precio: {
        moneda: "EUR",
        lineas: state.priceLines.map((line) => ({ ...line })),
        total: state.price,
      },
      visual: {
        motor: "Babylon.js",
        modelo: state.loadedFromGlb ? MODEL_URL : "placeholder-procedural",
        formatoEsperado: "glb/gltf",
        piezasEsperadas: Object.keys(partAliases),
      },
    };
  }

  function updatePreviewMeta() {
    const brand = configuratorData[config.marca];
    const model = getModel();

    if (nodes.brandLogo) {
      nodes.brandLogo.src = brand.brandLogo;
      nodes.brandLogo.alt = config.marca;
    }
    if (nodes.brandBadge) nodes.brandBadge.textContent = `${config.marca} ${model.label}`;
    if (nodes.previewBase) nodes.previewBase.textContent = `${config.marca} ${model.label}`;
    if (nodes.previewBackend) {
      nodes.previewBackend.textContent = state.loadedFromGlb
        ? "GLB por piezas cargado"
        : "Demo 3D procedural lista para GLB";
    }
    if (nodes.compatibilityStatus) {
      nodes.compatibilityStatus.textContent = model.levasMagneticas
        ? "Compatible con levas magneticas"
        : "Sin levas magneticas";
    }
  }

  function setActiveStep(stepKey) {
    nodes.stepButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.stepTarget === stepKey);
    });
    nodes.stepPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.stepPanel === stepKey);
    });
  }

  function registerPart(partKey, mesh) {
    if (!state.parts[partKey]) state.parts[partKey] = [];
    state.parts[partKey].push(mesh);
    mesh.isPickable = false;
  }

  function resetParts() {
    state.parts = Object.keys(partAliases).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {});
  }

  function getParts(partKey) {
    return state.parts[partKey] || [];
  }

  function getModel() {
    const brand = configuratorData[config.marca];
    return brand.modelos.find((model) => model.id === config.modelo) || brand.modelos[0];
  }

  function getOption(key) {
    return (optionData[key] || []).find((option) => String(option.id) === String(config[key]));
  }

  function getSummaryLabels() {
    return {
      marca: config.marca,
      modelo: getModel().label,
      aro: getOption("aro").label,
      agarres: getOption("agarres").label,
      costuras: getOption("costuras").label,
      logo: config.logo,
      pantallaRpm: config.pantallaRpm ? "Si" : "No",
      levas: getOption("levas").label,
      marcador: getOption("marcador").label,
      precioFinal: formatPrice(state.price),
    };
  }

  function resetCamera() {
    if (!state.camera) return;
    BABYLON.Animation.CreateAndStartAnimation(
      "reset_camera_alpha",
      state.camera,
      "alpha",
      60,
      18,
      state.camera.alpha,
      Math.PI / 2,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    BABYLON.Animation.CreateAndStartAnimation(
      "reset_camera_beta",
      state.camera,
      "beta",
      60,
      18,
      state.camera.beta,
      Math.PI / 2,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    BABYLON.Animation.CreateAndStartAnimation(
      "reset_camera_radius",
      state.camera,
      "radius",
      60,
      18,
      state.camera.radius,
      4.6,
      BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    state.camera.setTarget(new BABYLON.Vector3(0, 0.02, 0));
  }

  function resizeRenderer() {
    if (!state.engine || !nodes.stage) return;
    state.engine.resize();

    if (state.camera?.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
      const { width, height } = nodes.stage.getBoundingClientRect();
      const halfHeight = 1.95;
      const halfWidth = halfHeight * (width / Math.max(height, 1));
      state.camera.orthoLeft = -halfWidth;
      state.camera.orthoRight = halfWidth;
      state.camera.orthoTop = halfHeight;
      state.camera.orthoBottom = -halfHeight;
    }
  }

  function hideLoader() {
    nodes.loader?.classList.add("is-hidden");
  }

  function showViewerMessage(message) {
    if (!nodes.loader) return;
    nodes.loader.innerHTML = `<strong>${message}</strong>`;
    nodes.loader.classList.remove("is-hidden");
  }

  function formatPrice(value) {
    return `${value.toLocaleString("es-ES")} EUR`;
  }

  function normalizeName(value) {
    return String(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function hexToColor3(hex) {
    const rgb = hexToRgb(hex);
    return new BABYLON.Color3(rgb.r / 255, rgb.g / 255, rgb.b / 255);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  initConfigurator();

  window.CDPConfigurator = {
    getConfig: () => ({ ...config }),
    getPayload: buildBackendPayload,
    setConfig: (partialConfig) => {
      Object.assign(config, partialConfig || {});
      updateAvailableOptions();
      updateModelAppearance();
      updateSummary();
      updatePrice();
    },
    data: configuratorData,
    options: optionData,
  };

  window.CDPConfigurator3D = window.CDPConfigurator;
})();
