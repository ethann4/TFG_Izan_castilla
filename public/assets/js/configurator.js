(function () {
  "use strict";

  const URL_MODELO_POR_DEFECTO = "assets/models/volante.glb";
  const MODELOS_POR_VARIANTE = {
    "BMW|E46":          "assets/models/volante-bmw-e46.glb",
    "BMW|E39":          "assets/models/volante-bmw-e39.glb",
    "BMW|F30":          "assets/models/volante-bmw-f30.glb",
    "BMW|F82":          "assets/models/volante-bmw-f82.glb",
    "Audi|RS3":         "assets/models/volante-audi-rs3.glb",
    "Audi|RS6":         "assets/models/volante-audi-rs6.glb",
    "Audi|RS7":         "assets/models/volante-audi-rs7.glb",
    "Volkswagen|Golf R":   "assets/models/volante-vw-golf-r.glb",
    "Volkswagen|Golf GTI": "assets/models/volante-vw-golf-gti.glb",
    "Volkswagen|Golf GTD": "assets/models/volante-vw-golf-gtd.glb",
    "Mercedes|AMG":     "assets/models/volante-mercedes-amg.glb",
    "Mercedes|CLA45":   "assets/models/volante-mercedes-cla45.glb",
  };
  const CLAVE_VOLANTE_PENDIENTE = "cdp.volante.pendiente";

  function resolverUrlModelo(marca, modelo) {
    return MODELOS_POR_VARIANTE[`${marca}|${modelo}`] || URL_MODELO_POR_DEFECTO;
  }

  const aliasPartes = {
    aro: ["aro", "rim", "ring_outer", "wheel_ring"],
    agarres_laterales: ["agarre", "agarres", "grip", "thumb", "lateral"],
    costuras: ["costura", "costuras", "stitch", "thread", "seam"],
    logo: ["logo", "emblema", "emblem", "badge"],
    levas: ["leva", "levas", "paddle", "shift"],
    marcador_superior: ["marcador", "marker", "stripe", "top_mark"],
    pantalla_rpm: ["pantalla", "rpm", "display", "screen"],
    molduras: ["moldura", "molduras", "trim", "spoke", "centro", "hub", "airbag"],
  };

  const datosConfigurador = {
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

  const datosOpciones = {
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
    molduras: [
      { id: "grafito", label: "Grafito (OEM)", price: 0, color: "#151515", metallic: 0.68, roughness: 0.34, swatch: "linear-gradient(135deg, #0e0e0e, #2d2d33)" },
      { id: "blanco", label: "Blanco perla", price: 25, color: "#f1f1f1", metallic: 0.4, roughness: 0.36, swatch: "linear-gradient(135deg, #f6f6f6, #d8d8d8)" },
      { id: "rojo", label: "Rojo deportivo", price: 30, color: "#d62828", metallic: 0.5, roughness: 0.3, swatch: "#d62828" },
      { id: "azul", label: "Azul racing", price: 30, color: "#1b61ff", metallic: 0.5, roughness: 0.3, swatch: "#1b61ff" },
      { id: "amarillo", label: "Amarillo", price: 30, color: "#f2c94c", metallic: 0.5, roughness: 0.3, swatch: "#f2c94c" },
      { id: "oro", label: "Oro cepillado", price: 55, color: "#caa75d", metallic: 0.85, roughness: 0.22, swatch: "linear-gradient(135deg, #caa75d, #8a6a2c)" },
      { id: "cromo", label: "Cromo espejo", price: 45, color: "#c8ced6", metallic: 0.95, roughness: 0.12, swatch: "linear-gradient(135deg, #f1f4f8, #8c92a0)" },
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
    molduras: "grafito",
  };

  const estado = {
    motor: null,
    escena: null,
    camara: null,
    lienzo: null,
    raizModelo: null,
    partes: {},
    materiales: {},
    texturas: {},
    precio: 0,
    lineasPrecio: [],
    cargadoDesdeGlb: false,
    estiloPlaceholder: "",
    observadorResize: null,
  };

  const raiz = document.querySelector("[data-configurator]");
  const nodos = {
    escenario: raiz?.querySelector("[data-babylon-stage]"),
    lienzo: raiz?.querySelector("[data-babylon-canvas]"),
    cargador: raiz?.querySelector("[data-babylon-loader]"),
    botonReiniciarCamara: raiz?.querySelector("[data-camera-reset]"),
    selectores: {
      marca: raiz?.querySelector('[data-config-select="marca"]'),
      modelo: raiz?.querySelector('[data-config-select="modelo"]'),
      logo: raiz?.querySelector('[data-config-select="logo"]'),
    },
    gruposOpciones: Array.from(raiz?.querySelectorAll("[data-option-group]") || []),
    botonesPaso: Array.from(raiz?.querySelectorAll("[data-step-target]") || []),
    panelesPaso: Array.from(raiz?.querySelectorAll("[data-step-panel]") || []),
    logoMarca: raiz?.querySelector("[data-brand-logo]"),
    chipMarca: raiz?.querySelector("[data-brand-badge]"),
    estadoCompatibilidad: raiz?.querySelector("[data-compatibility-status]"),
    basePreview: raiz?.querySelector("[data-preview-base]"),
    backendPreview: raiz?.querySelector("[data-preview-backend]"),
    resumen: Array.from(raiz?.querySelectorAll("[data-summary]") || []),
    precio: raiz?.querySelector("[data-summary-price]"),
    desglosePrecio: raiz?.querySelector("[data-price-breakdown]"),
    salidaJson: raiz?.querySelector("[data-config-json]"),
    enlaceSolicitud: raiz?.querySelector("[data-config-request]"),
    botonGuardar: raiz?.querySelector("[data-config-save]"),
    botonComprar: raiz?.querySelector("[data-config-buy]"),
    estadoUi: raiz?.querySelector("[data-config-status]"),
  };

  function inicializarConfigurador() {
    if (!raiz || !nodos.lienzo || !nodos.escenario) return;

    if (!window.BABYLON) {
      mostrarMensajeVisor("Babylon.js no se ha podido cargar");
      return;
    }

    inicializarEscenaBabylon();
    enlazarEventosConfigurador();
    actualizarOpcionesDisponibles();
    actualizarResumen();
    actualizarPrecio();

    cargarModeloVolante().then(() => {
      actualizarAparienciaModelo();
      ocultarCargador();
    });
  }

  function inicializarEscenaBabylon() {
    estado.lienzo = nodos.lienzo;
    estado.motor = new BABYLON.Engine(estado.lienzo, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    });

    estado.escena = new BABYLON.Scene(estado.motor);
    estado.escena.clearColor = new BABYLON.Color4(0.006, 0.006, 0.007, 0);
    estado.escena.environmentIntensity = 0.85;
    estado.escena.imageProcessingConfiguration.toneMappingEnabled = true;
    estado.escena.imageProcessingConfiguration.toneMappingType =
      BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    estado.escena.imageProcessingConfiguration.exposure = 1.08;
    estado.escena.imageProcessingConfiguration.contrast = 1.18;

    estado.camara = new BABYLON.ArcRotateCamera(
      "cdp_camera",
      Math.PI / 2,
      Math.PI / 2,
      5.0,
      new BABYLON.Vector3(0, 0.02, 0),
      estado.escena
    );
    estado.camara.attachControl(estado.lienzo, true);
    estado.camara.lowerRadiusLimit = 3.0;
    estado.camara.upperRadiusLimit = 6.6;
    estado.camara.lowerBetaLimit = Math.PI / 2.55;
    estado.camara.upperBetaLimit = Math.PI / 1.55;
    estado.camara.angularSensibilityX = 520;
    estado.camara.angularSensibilityY = 560;
    estado.camara.wheelPrecision = 36;
    estado.camara.panningSensibility = 0;
    estado.camara.inertia = 0.82;
    estado.camara.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

    anadirIluminacionPremium();
    crearLibreriaTexturas();
    crearLibreriaMateriales();
    crearBaseEstudio();

    estado.motor.runRenderLoop(() => {
      estado.escena.render();
    });

    redimensionarRenderizador();
    if ("ResizeObserver" in window) {
      estado.observadorResize = new ResizeObserver(redimensionarRenderizador);
      estado.observadorResize.observe(nodos.escenario);
    }
    window.addEventListener("resize", redimensionarRenderizador);
  }

  function anadirIluminacionPremium() {
    const hemi = new BABYLON.HemisphericLight(
      "cdp_hemi",
      new BABYLON.Vector3(0, 1, 0),
      estado.escena
    );
    hemi.intensity = 0.72;
    hemi.groundColor = new BABYLON.Color3(0.02, 0.02, 0.024);

    const luzPrincipal = new BABYLON.DirectionalLight(
      "cdp_key",
      new BABYLON.Vector3(-0.4, -0.85, -0.34),
      estado.escena
    );
    luzPrincipal.position = new BABYLON.Vector3(4.2, 6.0, 5.2);
    luzPrincipal.intensity = 3.4;

    const bordeRojo = new BABYLON.PointLight(
      "cdp_red_rim",
      new BABYLON.Vector3(-3.3, 1.1, 2.3),
      estado.escena
    );
    bordeRojo.diffuse = new BABYLON.Color3(0.9, 0.12, 0.12);
    bordeRojo.specular = new BABYLON.Color3(1, 0.24, 0.2);
    bordeRojo.intensity = 2.35;
    bordeRojo.range = 7.2;

    const bordeFrio = new BABYLON.PointLight(
      "cdp_cool_rim",
      new BABYLON.Vector3(3.2, -0.5, 2.2),
      estado.escena
    );
    bordeFrio.diffuse = new BABYLON.Color3(0.28, 0.42, 1);
    bordeFrio.specular = new BABYLON.Color3(0.42, 0.54, 1);
    bordeFrio.intensity = 1.1;
    bordeFrio.range = 7;

    const cenital = new BABYLON.SpotLight(
      "cdp_top_spot",
      new BABYLON.Vector3(0, 3.4, 2.6),
      new BABYLON.Vector3(0, -1, -0.45),
      Math.PI / 2.2,
      18,
      estado.escena
    );
    cenital.intensity = 1.8;

    const resplandor = new BABYLON.GlowLayer("cdp_glow", estado.escena, {
      mainTextureSamples: 4,
      blurKernelSize: 28,
    });
    resplandor.intensity = 0.22;
  }

  function crearBaseEstudio() {
    const fondo = BABYLON.MeshBuilder.CreatePlane(
      "studio_fabric_backdrop",
      { width: 5.3, height: 4.05 },
      estado.escena
    );
    fondo.position = new BABYLON.Vector3(0, 0, -0.42);

    const material = new BABYLON.PBRMaterial("studio_fabric_mat", estado.escena);
    material.albedoTexture = crearTexturaFondoTela();
    material.albedoColor = new BABYLON.Color3(0.55, 0.55, 0.55);
    material.metallic = 0;
    material.roughness = 0.96;
    material.backFaceCulling = false;
    fondo.material = material;
    fondo.isPickable = false;

    const sombra = BABYLON.MeshBuilder.CreatePlane(
      "studio_floor_shadow",
      { width: 3.4, height: 0.66 },
      estado.escena
    );
    sombra.position = new BABYLON.Vector3(0, -1.34, -0.2);

    const materialSombra = new BABYLON.StandardMaterial("studio_floor_shadow_mat", estado.escena);
    materialSombra.diffuseTexture = crearTexturaSombra();
    materialSombra.opacityTexture = materialSombra.diffuseTexture;
    materialSombra.emissiveColor = new BABYLON.Color3(0, 0, 0);
    materialSombra.disableLighting = true;
    materialSombra.backFaceCulling = false;
    sombra.material = materialSombra;
    sombra.isPickable = false;
  }

  function crearTexturaFondoTela() {
    const textura = new BABYLON.DynamicTexture(
      "black_fabric_backdrop_texture",
      { width: 1024, height: 1024 },
      estado.escena,
      false
    );
    const ctx = textura.getContext();
    ctx.fillStyle = "#090909";
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 9000; i += 1) {
      const tono = 8 + Math.random() * 42;
      const alfa = 0.06 + Math.random() * 0.12;
      ctx.fillStyle = `rgba(${tono},${tono},${tono},${alfa})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }

    for (let y = 0; y < 1024; y += 8) {
      ctx.strokeStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.02})`;
      ctx.beginPath();
      ctx.moveTo(0, y + Math.random() * 6);
      ctx.lineTo(1024, y + Math.random() * 6);
      ctx.stroke();
    }

    textura.update(false);
    textura.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    textura.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    return textura;
  }

  function crearTexturaSombra() {
    const textura = new BABYLON.DynamicTexture(
      "wheel_floor_shadow_texture",
      { width: 512, height: 192 },
      estado.escena,
      true
    );
    const ctx = textura.getContext();
    const degradado = ctx.createRadialGradient(256, 96, 24, 256, 96, 230);
    degradado.addColorStop(0, "rgba(0,0,0,0.72)");
    degradado.addColorStop(0.58, "rgba(0,0,0,0.34)");
    degradado.addColorStop(1, "rgba(0,0,0,0)");
    ctx.clearRect(0, 0, 512, 192);
    ctx.fillStyle = degradado;
    ctx.fillRect(0, 0, 512, 192);
    textura.hasAlpha = true;
    textura.update(false);
    return textura;
  }

  function cargarModeloVolante() {
    const url = resolverUrlModelo(config.marca, config.modelo);
    estado.urlModeloActual = url;
    const partes = dividirUrlModelo(url);

    return BABYLON.SceneLoader.ImportMeshAsync("", partes.raiz, partes.archivo, estado.escena)
      .then((resultado) => {
        const mallas = resultado.meshes.filter((malla) => malla instanceof BABYLON.Mesh && malla.name !== "__root__");
        if (!mallas.length) throw new Error("Modelo GLB sin meshes utiles");

        reiniciarPiezas();
        const raizImportada = new BABYLON.TransformNode("volante_glb_root", estado.escena);
        mallas.forEach((malla) => {
          malla.parent = raizImportada;
          malla.isPickable = false;
          if (!malla.material) malla.material = estado.materiales.molduras;
        });

        estado.raizModelo = raizImportada;
        estado.cargadoDesdeGlb = true;
        normalizarModeloImportado(raizImportada);
        registrarPartesImportadas(mallas);
      })
      .catch(() => {
        estado.cargadoDesdeGlb = false;
        estado.urlModeloActual = null;
        crearVolantePlaceholder();
      });
  }

  function recargarModeloSiNecesario() {
    const urlSiguiente = resolverUrlModelo(config.marca, config.modelo);
    if (urlSiguiente === estado.urlModeloActual) return Promise.resolve();

    eliminarModeloActual();
    return cargarModeloVolante().then(() => actualizarAparienciaModelo());
  }

  function dividirUrlModelo(url) {
    const ultimaBarra = url.lastIndexOf("/");
    return {
      raiz: ultimaBarra >= 0 ? url.slice(0, ultimaBarra + 1) : "",
      archivo: ultimaBarra >= 0 ? url.slice(ultimaBarra + 1) : url,
    };
  }

  function normalizarModeloImportado(raizModelo) {
    raizModelo.computeWorldMatrix(true);
    const limites = raizModelo.getHierarchyBoundingVectors(true);
    const tamano = limites.max.subtract(limites.min);
    const centro = limites.min.add(tamano.scale(0.5));
    const ejeMax = Math.max(tamano.x, tamano.y, tamano.z);
    const escala = ejeMax > 0 ? 3.1 / ejeMax : 1;

    raizModelo.getChildMeshes().forEach((malla) => {
      malla.position.subtractInPlace(centro);
    });
    raizModelo.scaling = new BABYLON.Vector3(escala, escala, escala);
    raizModelo.position = new BABYLON.Vector3(0, 0, 0.05);
    raizModelo.rotation = new BABYLON.Vector3(0, 0, 0);
  }

  function registrarPartesImportadas(mallas) {
    mallas.forEach((malla) => {
      const clavePieza = obtenerClavePorNombre(malla.name);
      registrarPieza(clavePieza, malla);
    });

    if (!obtenerPiezas("aro").length && mallas[0]) {
      registrarPieza("aro", mallas[0]);
    }
  }

  function obtenerClavePorNombre(nombre) {
    const normalizado = normalizarNombre(nombre);
    const prioridad = [
      "pantalla_rpm",
      "levas",
      "marcador_superior",
      "costuras",
      "agarres_laterales",
      "logo",
      "molduras",
      "aro",
    ];

    for (const clave of prioridad) {
      if (aliasPartes[clave].some((alias) => normalizado.includes(alias))) return clave;
    }
    return "molduras";
  }

  function crearVolantePlaceholder() {
    if (esEstiloAudiRs()) {
      crearVolanteAudiRsPlaceholder();
      return;
    }

    reiniciarPiezas();
    estado.estiloPlaceholder = "default";

    const volante = new BABYLON.TransformNode("volante_placeholder_root", estado.escena);
    volante.position = new BABYLON.Vector3(0, -0.02, 0.06);
    volante.rotation = new BABYLON.Vector3(0, 0, 0);
    volante.scaling = new BABYLON.Vector3(1.04, 1.04, 1.04);
    estado.raizModelo = volante;

    const aro = BABYLON.MeshBuilder.CreateTorus(
      "aro",
      { diameter: 3.05, thickness: 0.34, tessellation: 300 },
      estado.escena
    );
    aro.parent = volante;
    aro.rotation.x = Math.PI / 2;
    aro.scaling = new BABYLON.Vector3(1.07, 0.2, 0.9);
    aro.position.z = 0.0;
    registrarPieza("aro", aro);

    const aroSombraSuave = BABYLON.MeshBuilder.CreateTorus(
      "aro_soft_shadow",
      { diameter: 2.63, thickness: 0.038, tessellation: 260 },
      estado.escena
    );
    aroSombraSuave.parent = volante;
    aroSombraSuave.rotation.x = Math.PI / 2;
    aroSombraSuave.scaling = new BABYLON.Vector3(1.07, 0.2, 0.9);
    aroSombraSuave.position.z = 0.16;
    aroSombraSuave.material = estado.materiales.bordeSombra;

    const agarreIzquierdo = crearArcoAgarre("agarres_laterales_left", 2.36, 3.92, volante);
    const agarreDerecho = crearArcoAgarre("agarres_laterales_right", -0.78, 0.78, volante);
    registrarPieza("agarres_laterales", agarreIzquierdo);
    registrarPieza("agarres_laterales", agarreDerecho);

    crearRadioRedondeado("molduras_left_spoke", -0.72, 0.1, 0.18, 1.08, 0.28, -0.06, volante);
    crearRadioRedondeado("molduras_right_spoke", 0.72, 0.1, 0.18, 1.08, 0.28, 0.06, volante);
    crearRadioRedondeado("molduras_lower_spoke", 0, -0.72, 0.17, 1.02, 0.45, Math.PI / 2, volante);

    const centro = BABYLON.MeshBuilder.CreateSphere(
      "molduras_centro_airbag",
      { diameter: 1.08, segments: 72 },
      estado.escena
    );
    centro.parent = volante;
    centro.position.z = 0.35;
    centro.scaling = new BABYLON.Vector3(1.18, 0.86, 0.24);
    centro.material = estado.materiales.centro;
    registrarPieza("molduras", centro);

    const anilloCentro = BABYLON.MeshBuilder.CreateTorus(
      "molduras_centro_ring",
      { diameter: 0.43, thickness: 0.022, tessellation: 128 },
      estado.escena
    );
    anilloCentro.parent = volante;
    anilloCentro.rotation.x = Math.PI / 2;
    anilloCentro.position.z = 0.61;
    anilloCentro.material = estado.materiales.bordeMetal;
    registrarPieza("molduras", anilloCentro);

    crearClusterBotones("molduras_buttons_left", -1.03, 0.28, volante);
    crearClusterBotones("molduras_buttons_right", 1.03, 0.28, volante);
    crearSegmentosHilo(volante);
    crearLogo(volante);
    crearChipInferior(volante);
    crearMarcador(volante);
    crearPantallaRpm(volante);
    crearLevas(volante);
  }

  function crearVolanteAudiRsPlaceholder() {
    reiniciarPiezas();
    estado.estiloPlaceholder = "audi-rs";

    const volante = new BABYLON.TransformNode("volante_audi_rs_placeholder_root", estado.escena);
    volante.position = new BABYLON.Vector3(0, -0.03, 0.06);
    volante.rotation = new BABYLON.Vector3(0, 0, 0);
    volante.scaling = new BABYLON.Vector3(1.02, 1.02, 1.02);
    estado.raizModelo = volante;

    const aro = BABYLON.MeshBuilder.CreateTube(
      "aro_audi_rs_flat_bottom",
      {
        path: crearTrazadoAroAudiRs(),
        radius: 0.155,
        tessellation: 42,
        cap: BABYLON.Mesh.CAP_ALL,
      },
      estado.escena
    );
    aro.parent = volante;
    aro.material = estado.materiales.aro;
    registrarPieza("aro", aro);

    [
      { name: "agarres_laterales_left", x: -1.33, y: 0.52, rz: -0.36 },
      { name: "agarres_laterales_right", x: 1.33, y: 0.52, rz: 0.36 },
    ].forEach((item) => {
      const agarre = BABYLON.MeshBuilder.CreateSphere(
        item.name,
        { diameter: 0.58, segments: 48 },
        estado.escena
      );
      agarre.parent = volante;
      agarre.position = new BABYLON.Vector3(item.x, item.y, 0.16);
      agarre.scaling = new BABYLON.Vector3(0.44, 0.92, 0.28);
      agarre.rotation.z = item.rz;
      registrarPieza("agarres_laterales", agarre);
    });

    crearRadioAudiRs("molduras_audi_left_spoke", -0.62, -0.08, -0.1, volante);
    crearRadioAudiRs("molduras_audi_right_spoke", 0.62, -0.08, 0.1, volante);
    crearRadioInferiorAudiRs(volante);
    crearPanelBotonesAudiRs("molduras_audi_buttons_left", -0.92, 0.12, -0.08, volante);
    crearPanelBotonesAudiRs("molduras_audi_buttons_right", 0.92, 0.12, 0.08, volante);
    crearLevasAudiRs(volante);
    crearCentroAudiRs(volante);
    crearCosturasAudiRs(volante);
    crearMarcador(volante);
    crearPantallaRpm(volante);
  }

  function crearTrazadoAroAudiRs() {
    const puntos = [];
    const pasos = 128;

    for (let i = 0; i <= pasos; i += 1) {
      const angulo = (Math.PI * 2 * i) / pasos;
      const x = Math.cos(angulo) * 1.58;
      let y = Math.sin(angulo) * 1.35;

      if (y < -0.98) {
        y = -1.08 + Math.pow(Math.abs(x) / 1.58, 3.2) * 0.16;
      }

      const pellizcoSuperior = Math.max(0, 1 - Math.abs(x) / 0.18);
      if (y > 1.18) y -= pellizcoSuperior * 0.05;

      puntos.push(new BABYLON.Vector3(x, y, 0.05));
    }

    return puntos;
  }

  function crearRadioAudiRs(nombre, x, y, rotacionZ, padre) {
    const grupo = new BABYLON.TransformNode(nombre, estado.escena);
    grupo.parent = padre;
    grupo.position = new BABYLON.Vector3(x, y, 0.28);
    grupo.rotation.z = rotacionZ;

    const radio = BABYLON.MeshBuilder.CreateBox(
      `${nombre}_blade`,
      { width: 0.78, height: 0.18, depth: 0.12 },
      estado.escena
    );
    radio.parent = grupo;
    radio.material = estado.materiales.molduras;
    registrarPieza("molduras", radio);

    const reborde = BABYLON.MeshBuilder.CreateBox(
      `${nombre}_upper_lip`,
      { width: 0.76, height: 0.035, depth: 0.04 },
      estado.escena
    );
    reborde.parent = grupo;
    reborde.position = new BABYLON.Vector3(0, 0.105, 0.055);
    reborde.material = estado.materiales.bordeMetal;
    registrarPieza("molduras", reborde);
  }

  function crearRadioInferiorAudiRs(padre) {
    const puente = BABYLON.MeshBuilder.CreateBox(
      "molduras_audi_bottom_y_spoke",
      { width: 0.48, height: 0.68, depth: 0.15 },
      estado.escena
    );
    puente.parent = padre;
    puente.position = new BABYLON.Vector3(0, -0.66, 0.26);
    puente.material = estado.materiales.molduras;
    registrarPieza("molduras", puente);

    const recorte = BABYLON.MeshBuilder.CreateBox(
      "molduras_audi_bottom_cutout_shadow",
      { width: 0.27, height: 0.36, depth: 0.04 },
      estado.escena
    );
    recorte.parent = padre;
    recorte.position = new BABYLON.Vector3(0, -0.66, 0.36);
    recorte.material = estado.materiales.bordeSombra;
    registrarPieza("molduras", recorte);

    const chip = BABYLON.MeshBuilder.CreatePlane(
      "molduras_audi_rs_badge_lower",
      { width: 0.28, height: 0.095 },
      estado.escena
    );
    chip.parent = padre;
    chip.position = new BABYLON.Vector3(0, -1.02, 0.42);
    chip.material = crearMaterialChipAudiRs();
    registrarPieza("molduras", chip);
  }

  function crearPanelBotonesAudiRs(nombre, x, y, rotacionZ, padre) {
    const grupo = new BABYLON.TransformNode(nombre, estado.escena);
    grupo.parent = padre;
    grupo.position = new BABYLON.Vector3(x, y, 0.42);
    grupo.rotation.z = rotacionZ;

    const panel = BABYLON.MeshBuilder.CreateBox(
      `${nombre}_trapezoid_panel`,
      { width: 0.52, height: 0.27, depth: 0.08 },
      estado.escena
    );
    panel.parent = grupo;
    panel.scaling.x = 1.18;
    panel.material = estado.materiales.panelBoton;
    registrarPieza("molduras", panel);

    const botones = [
      [-0.14, 0.045, 0.105, 0.052],
      [0.04, 0.052, 0.112, 0.048],
      [-0.12, -0.07, 0.08, 0.065],
      [0.075, -0.07, 0.115, 0.055],
    ];

    botones.forEach(([bx, by, width, height], indice) => {
      const boton = BABYLON.MeshBuilder.CreateBox(
        `${nombre}_button_${indice}`,
        { width, height, depth: 0.026 },
        estado.escena
      );
      boton.parent = grupo;
      boton.position = new BABYLON.Vector3(bx, by, 0.055);
      boton.material = estado.materiales.caraBoton;
      registrarPieza("molduras", boton);
    });

    const puntoIcono = BABYLON.MeshBuilder.CreateCylinder(
      `${nombre}_small_round_button`,
      { diameter: 0.058, height: 0.026, tessellation: 24 },
      estado.escena
    );
    puntoIcono.parent = grupo;
    puntoIcono.rotation.x = Math.PI / 2;
    puntoIcono.position = new BABYLON.Vector3(0.18, 0.065, 0.06);
    puntoIcono.material = estado.materiales.caraBoton;
    registrarPieza("molduras", puntoIcono);
  }

  function crearLevasAudiRs(padre) {
    [-1, 1].forEach((lado) => {
      const leva = BABYLON.MeshBuilder.CreateBox(
        lado < 0 ? "levas_audi_rs_left" : "levas_audi_rs_right",
        { width: 0.16, height: 0.86, depth: 0.052 },
        estado.escena
      );
      leva.parent = padre;
      leva.position = new BABYLON.Vector3(lado * 1.16, 0.09, -0.18);
      leva.rotation.z = lado * -0.18;
      leva.material = estado.materiales.levasCarbono;
      registrarPieza("levas", leva);

      [-0.25, 0, 0.25].forEach((desplazamiento, indice) => {
        const agujero = BABYLON.MeshBuilder.CreateCylinder(
          `levas_audi_rs_hole_${lado}_${indice}`,
          { diameter: 0.075, height: 0.018, tessellation: 24 },
          estado.escena
        );
        agujero.parent = padre;
        agujero.rotation.x = Math.PI / 2;
        agujero.position = new BABYLON.Vector3(lado * 1.16, 0.09 + desplazamiento, -0.145);
        agujero.material = estado.materiales.bordeSombra;
        registrarPieza("levas", agujero);
      });
    });
  }

  function crearCentroAudiRs(padre) {
    const centro = BABYLON.MeshBuilder.CreateSphere(
      "molduras_audi_round_airbag",
      { diameter: 0.96, segments: 96 },
      estado.escena
    );
    centro.parent = padre;
    centro.position = new BABYLON.Vector3(0, -0.04, 0.42);
    centro.scaling = new BABYLON.Vector3(1, 1, 0.2);
    centro.material = estado.materiales.centro;
    registrarPieza("molduras", centro);

    for (let i = 0; i < 9; i += 1) {
      const costura = BABYLON.MeshBuilder.CreateTorus(
        `costuras_audi_center_ring_${i}`,
        { diameter: 0.72 + i * 0.023, thickness: 0.004, tessellation: 120 },
        estado.escena
      );
      costura.parent = padre;
      costura.rotation.x = Math.PI / 2;
      costura.position = new BABYLON.Vector3(0, -0.04, 0.63 + i * 0.001);
      registrarPieza("costuras", costura);
    }

    crearLogoAudi(padre);
  }

  function crearLogoAudi(padre) {
    for (let i = 0; i < 4; i += 1) {
      const anillo = BABYLON.MeshBuilder.CreateTorus(
        `logo_audi_ring_${i}`,
        { diameter: 0.16, thickness: 0.018, tessellation: 64 },
        estado.escena
      );
      anillo.parent = padre;
      anillo.rotation.x = Math.PI / 2;
      anillo.position = new BABYLON.Vector3(-0.135 + i * 0.09, -0.01, 0.66);
      anillo.material = estado.materiales.baseLogo;
      registrarPieza("logo", anillo);
    }

    const planoRs = BABYLON.MeshBuilder.CreatePlane(
      "logo_audi_rs_text",
      { width: 0.28, height: 0.07 },
      estado.escena
    );
    planoRs.parent = padre;
    planoRs.position = new BABYLON.Vector3(0, -0.2, 0.665);
    planoRs.material = crearMaterialChipAudiRs();
    registrarPieza("logo", planoRs);
  }

  function crearCosturasAudiRs(padre) {
    [
      [-1.48, -1.08, -0.82, 0.1],
      [1.48, -1.08, 0.82, -0.1],
      [-0.03, 1.35, 0, 0],
      [-1.05, 0.94, -0.62, -0.32],
      [1.05, 0.94, 0.62, 0.32],
    ].forEach(([x, y, rx, rz], indiceGrupo) => {
      for (let i = 0; i < 5; i += 1) {
        const costura = BABYLON.MeshBuilder.CreateBox(
          `costuras_audi_rs_${indiceGrupo}_${i}`,
          { width: 0.012, height: 0.11, depth: 0.01 },
          estado.escena
        );
        costura.parent = padre;
        costura.position = new BABYLON.Vector3(x + (i - 2) * 0.018, y, 0.34);
        costura.rotation.z = rx + rz;
        registrarPieza("costuras", costura);
      }
    });
  }

  function crearMaterialChipAudiRs() {
    const textura = new BABYLON.DynamicTexture("audi_rs_badge_texture", { width: 256, height: 96 }, estado.escena, true);
    const ctx = textura.getContext();
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "#d62828";
    ctx.fillRect(24, 28, 42, 40);
    ctx.fillStyle = "#f4f4f4";
    ctx.font = "900 42px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("RS", 78, 50);
    textura.hasAlpha = true;
    textura.update(false);

    const material = new BABYLON.PBRMaterial("audi_rs_badge_material", estado.escena);
    material.albedoTexture = textura;
    material.emissiveTexture = textura;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveIntensity = 0.1;
    material.metallic = 0;
    material.roughness = 0.36;
    material.backFaceCulling = false;
    material.useAlphaFromAlbedoTexture = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    return material;
  }

  function crearArcoAgarre(nombre, anguloInicio, anguloFin, padre) {
    const puntos = [];
    const pasos = 42;

    for (let i = 0; i <= pasos; i += 1) {
      const angulo = anguloInicio + ((anguloFin - anguloInicio) * i) / pasos;
      puntos.push(new BABYLON.Vector3(
        Math.cos(angulo) * 1.62,
        Math.sin(angulo) * 1.28,
        0.24
      ));
    }

    const agarre = BABYLON.MeshBuilder.CreateTube(
      nombre,
      {
        path: puntos,
        radius: 0.12,
        tessellation: 28,
        cap: BABYLON.Mesh.CAP_ALL,
      },
      estado.escena
    );
    agarre.parent = padre;
    return agarre;
  }

  function crearRadioRedondeado(nombre, x, y, z, ancho, alto, rotacionZ, padre) {
    const grupo = new BABYLON.TransformNode(nombre, estado.escena);
    grupo.parent = padre;
    grupo.position = new BABYLON.Vector3(x, y, z);
    grupo.rotation.z = rotacionZ;

    const anchoNucleo = Math.max(ancho - alto, 0.04);
    const nucleo = BABYLON.MeshBuilder.CreateBox(
      `${nombre}_core`,
      { width: anchoNucleo, height: alto, depth: 0.18 },
      estado.escena
    );
    nucleo.parent = grupo;
    nucleo.material = estado.materiales.molduras;
    registrarPieza("molduras", nucleo);

    [-1, 1].forEach((lado) => {
      const tapa = BABYLON.MeshBuilder.CreateCylinder(
        `${nombre}_cap_${lado}`,
        { diameter: alto, height: 0.18, tessellation: 44 },
        estado.escena
      );
      tapa.parent = grupo;
      tapa.rotation.x = Math.PI / 2;
      tapa.position.x = lado * anchoNucleo * 0.5;
      tapa.material = estado.materiales.molduras;
      registrarPieza("molduras", tapa);
    });

    return grupo;
  }

  function crearDisco(nombre, diametro, profundidad, padre) {
    const disco = BABYLON.MeshBuilder.CreateCylinder(
      nombre,
      { diameter: diametro, height: profundidad, tessellation: 96 },
      estado.escena
    );
    disco.parent = padre;
    disco.rotation.x = Math.PI / 2;
    return disco;
  }

  function crearClusterBotones(nombre, x, y, padre) {
    const grupo = new BABYLON.TransformNode(nombre, estado.escena);
    grupo.parent = padre;
    grupo.position = new BABYLON.Vector3(x, y, 0.36);
    grupo.rotation.z = x < 0 ? -0.22 : 0.22;

    const base = crearPanelBotonesRedondeado(`${nombre}_panel`, grupo);

    const posiciones = [
      { x: -0.095, y: 0.06 },
      { x: 0.095, y: 0.06 },
      { x: -0.095, y: -0.06 },
      { x: 0.095, y: -0.06 },
    ];

    posiciones.forEach((desplazamiento, indice) => {
      const boton = BABYLON.MeshBuilder.CreateCylinder(
        `${nombre}_button_${indice}`,
        { diameter: 0.074, height: 0.03, tessellation: 24 },
        estado.escena
      );
      boton.parent = grupo;
      boton.rotation.x = Math.PI / 2;
      boton.position = new BABYLON.Vector3(desplazamiento.x, desplazamiento.y, 0.06);
      boton.material = estado.materiales.caraBoton;
      registrarPieza("molduras", boton);
    });

    return base;
  }

  function crearPanelBotonesRedondeado(nombre, padre) {
    const panel = BABYLON.MeshBuilder.CreateBox(
      nombre,
      { width: 0.42, height: 0.3, depth: 0.09 },
      estado.escena
    );
    panel.parent = padre;
    panel.material = estado.materiales.panelBoton;
    registrarPieza("molduras", panel);
    return panel;
  }

  function crearSegmentosHilo(padre) {
    const arcos = [
      [-2.62, -2.26],
      [-1.02, -0.66],
      [0.66, 1.02],
      [2.26, 2.62],
    ];

    arcos.forEach((rango, indice) => {
      for (let i = 0; i < 7; i += 1) {
        const inicio = rango[0] + i * 0.045;
        const fin = inicio + 0.022;
        const hilo = crearTuboArco(`costuras_${indice}_${i}`, 1.5, inicio, fin, 0.36);
        hilo.parent = padre;
        registrarPieza("costuras", hilo);
      }
    });
  }

  function crearTuboArco(nombre, radio, anguloInicio, anguloFin, z) {
    const puntos = [];
    const pasos = 5;
    for (let i = 0; i <= pasos; i += 1) {
      const angulo = anguloInicio + ((anguloFin - anguloInicio) * i) / pasos;
      puntos.push(new BABYLON.Vector3(Math.cos(angulo) * radio, Math.sin(angulo) * radio * 0.78, z));
    }

    return BABYLON.MeshBuilder.CreateTube(
      nombre,
      { path: puntos, radius: 0.006, tessellation: 8, cap: BABYLON.Mesh.CAP_ALL },
      estado.escena
    );
  }

  function crearLogo(padre) {
    const discoLogo = crearDisco("logo_base", 0.42, 0.032, padre);
    discoLogo.position.z = 0.64;
    discoLogo.material = estado.materiales.baseLogo;
    registrarPieza("logo", discoLogo);

    const planoLogo = BABYLON.MeshBuilder.CreatePlane(
      "logo_decal",
      { width: 0.37, height: 0.37 },
      estado.escena
    );
    planoLogo.parent = padre;
    planoLogo.position = new BABYLON.Vector3(0, 0, 0.682);
    planoLogo.material = estado.materiales.logo;
    registrarPieza("logo", planoLogo);
  }

  function crearChipInferior(padre) {
    const chip = BABYLON.MeshBuilder.CreatePlane(
      "molduras_m_badge_lower",
      { width: 0.24, height: 0.075 },
      estado.escena
    );
    chip.parent = padre;
    chip.position = new BABYLON.Vector3(0, -1.06, 0.43);
    chip.material = estado.materiales.chipM;
    registrarPieza("molduras", chip);
  }

  function crearMarcador(padre) {
    const marcador = BABYLON.MeshBuilder.CreateBox(
      "marcador_superior",
      { width: 0.34, height: 0.075, depth: 0.045 },
      estado.escena
    );
    marcador.parent = padre;
    marcador.position = new BABYLON.Vector3(0, 1.45, 0.4);
    marcador.material = estado.materiales.marcador;
    registrarPieza("marcador_superior", marcador);
  }

  function crearPantallaRpm(padre) {
    const pantalla = BABYLON.MeshBuilder.CreateBox(
      "pantalla_rpm",
      { width: 0.62, height: 0.2, depth: 0.055 },
      estado.escena
    );
    pantalla.parent = padre;
    pantalla.position = new BABYLON.Vector3(0, 0.7, 0.5);
    pantalla.material = estado.materiales.pantalla;
    registrarPieza("pantalla_rpm", pantalla);

    for (let i = 0; i < 7; i += 1) {
      const led = BABYLON.MeshBuilder.CreateBox(
        `pantalla_rpm_led_${i}`,
        { width: 0.052, height: 0.018, depth: 0.012 },
        estado.escena
      );
      led.parent = padre;
      led.position = new BABYLON.Vector3(-0.21 + i * 0.07, 0.7, 0.54);
      led.material = i < 4 ? estado.materiales.ledVerde : estado.materiales.ledRojo;
      registrarPieza("pantalla_rpm", led);
    }
  }

  function crearLevas(padre) {
    [-1, 1].forEach((lado) => {
      const leva = BABYLON.MeshBuilder.CreateBox(
        lado < 0 ? "levas_left" : "levas_right",
        { width: 0.18, height: 0.62, depth: 0.07 },
        estado.escena
      );
      leva.parent = padre;
      leva.position = new BABYLON.Vector3(lado * 1.34, 0.12, -0.18);
      leva.rotation.z = lado * 0.18;
      leva.material = estado.materiales.levasCarbono;
      registrarPieza("levas", leva);
    });
  }

  function crearLibreriaTexturas() {
    estado.texturas = {
      cuero: crearTexturaProcedural("cuero"),
      cueroPerforado: crearTexturaProcedural("cueroPerforado"),
      alcantara: crearTexturaProcedural("alcantara"),
      carbono: crearTexturaProcedural("carbono"),
      carbonoForjado: crearTexturaProcedural("carbonoForjado"),
      tricolor: crearTexturaTira(["#1b61ff", "#f5f5f5", "#d62828"]),
      italiano: crearTexturaTira(["#119447", "#f5f5f5", "#d62828"]),
      aleman: crearTexturaTira(["#111111", "#d62828", "#f2c94c"]),
      frances: crearTexturaTira(["#1b61ff", "#f5f5f5", "#d62828"]),
      tricolorVertical: crearTexturaTira(["#1b61ff", "#f5f5f5", "#d62828"], true),
    };
  }

  function crearTexturaProcedural(tipo) {
    const textura = new BABYLON.DynamicTexture(
      `${tipo}_texture`,
      { width: 512, height: 512 },
      estado.escena,
      false
    );
    const ctx = textura.getContext();

    ctx.fillStyle = tipo.includes("carbono") ? "#111" : "#171717";
    ctx.fillRect(0, 0, 512, 512);

    if (tipo === "carbono") {
      for (let y = -512; y < 768; y += 34) {
        for (let x = -512; x < 768; x += 34) {
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          ctx.fillRect(x + y * 0.45, y, 18, 18);
          ctx.fillStyle = "rgba(0,0,0,0.34)";
          ctx.fillRect(x + y * 0.45 + 18, y + 18, 18, 18);
        }
      }
    }

    if (tipo === "carbonoForjado") {
      for (let i = 0; i < 260; i += 1) {
        ctx.save();
        ctx.translate(Math.random() * 512, Math.random() * 512);
        ctx.rotate(Math.random() * Math.PI);
        ctx.fillStyle = `rgba(220,220,220,${0.05 + Math.random() * 0.18})`;
        ctx.fillRect(-18, -2, 36, 4);
        ctx.restore();
      }
    }

    if (tipo === "alcantara") {
      for (let i = 0; i < 1800; i += 1) {
        const tono = 35 + Math.random() * 80;
        ctx.fillStyle = `rgba(${tono},${tono},${tono},0.17)`;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 1.5, 1.5);
      }
    }

    if (tipo === "cuero" || tipo === "cueroPerforado") {
      for (let i = 0; i < 850; i += 1) {
        ctx.strokeStyle = `rgba(255,255,255,${Math.random() * 0.075})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 512, Math.random() * 512);
        ctx.lineTo(Math.random() * 512, Math.random() * 512);
        ctx.stroke();
      }
    }

    if (tipo === "cueroPerforado") {
      for (let y = 24; y < 512; y += 42) {
        for (let x = 24; x < 512; x += 42) {
          ctx.fillStyle = "rgba(0,0,0,0.76)";
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    textura.update(false);
    textura.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    textura.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    textura.uScale = 2.4;
    textura.vScale = 2.4;
    return textura;
  }

  function crearTexturaTira(colores, vertical = false) {
    const textura = new BABYLON.DynamicTexture(
      `stripe_${colores.join("_")}_${vertical ? "v" : "h"}`,
      { width: 256, height: 256 },
      estado.escena,
      false
    );
    const ctx = textura.getContext();
    const tamano = 256 / colores.length;

    colores.forEach((color, indice) => {
      ctx.fillStyle = color;
      if (vertical) ctx.fillRect(0, indice * tamano, 256, tamano);
      else ctx.fillRect(indice * tamano, 0, tamano, 256);
    });

    textura.update(false);
    textura.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    textura.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    textura.uScale = vertical ? 1 : 2;
    textura.vScale = vertical ? 2 : 1;
    return textura;
  }

  function crearLibreriaMateriales() {
    estado.materiales = {
      aro: crearMaterialPbr("mat_aro", { texture: estado.texturas.carbono, metallic: 0.54, roughness: 0.3 }),
      agarres: crearMaterialPbr("mat_agarres", { texture: estado.texturas.alcantara, metallic: 0.03, roughness: 0.88 }),
      centro: crearMaterialPbr("mat_center", { texture: estado.texturas.cuero, metallic: 0.08, roughness: 0.62 }),
      molduras: crearMaterialPbr("mat_molduras", { color: "#151515", metallic: 0.68, roughness: 0.34 }),
      bordeSombra: crearMaterialPbr("mat_shadow_trim", { color: "#060606", metallic: 0.4, roughness: 0.5 }),
      bordeMetal: crearMaterialPbr("mat_metal_trim", { color: "#2b2b2f", metallic: 0.78, roughness: 0.22 }),
      panelBoton: crearMaterialPbr("mat_button_panel", { color: "#080808", metallic: 0.6, roughness: 0.42 }),
      caraBoton: crearMaterialPbr("mat_button_face", { color: "#242424", metallic: 0.46, roughness: 0.36 }),
      costuras: crearMaterialPbr("mat_costuras", { color: "#d62828", metallic: 0.02, roughness: 0.58 }),
      marcador: crearMaterialPbr("mat_marcador", { color: "#d62828", metallic: 0.16, roughness: 0.32 }),
      pantalla: crearMaterialPbr("mat_pantalla", {
        color: "#031018",
        emissive: "#32ffa2",
        emissiveIntensity: 0.22,
        metallic: 0.18,
        roughness: 0.18,
      }),
      ledVerde: crearMaterialPbr("mat_led_green", { color: "#2bff9a", emissive: "#2bff9a", emissiveIntensity: 1.4 }),
      ledRojo: crearMaterialPbr("mat_led_red", { color: "#ff2432", emissive: "#ff2432", emissiveIntensity: 1.4 }),
      levasCarbono: crearMaterialPbr("mat_levas_carbono", { texture: estado.texturas.carbono, metallic: 0.58, roughness: 0.28 }),
      levasAluminio: crearMaterialPbr("mat_levas_aluminio", { color: "#bec4ca", metallic: 0.92, roughness: 0.18 }),
      levasMagneticas: crearMaterialPbr("mat_levas_magneticas", {
        color: "#101010",
        emissive: "#d62828",
        emissiveIntensity: 0.18,
        metallic: 0.78,
        roughness: 0.26,
      }),
      baseLogo: crearMaterialPbr("mat_logo_base", { color: "#060606", metallic: 0.48, roughness: 0.34 }),
      logo: crearMaterialLogo(config.logo, config.marca),
      chipM: crearMaterialChipM(),
    };
  }

  function crearMaterialPbr(nombre, opciones = {}) {
    const material = new BABYLON.PBRMaterial(nombre, estado.escena);
    material.albedoColor = opciones.color ? hexAColor3(opciones.color) : new BABYLON.Color3(1, 1, 1);
    material.metallic = opciones.metallic ?? 0.12;
    material.roughness = opciones.roughness ?? 0.45;
    material.clearCoat.isEnabled = opciones.clearCoat ?? true;
    material.clearCoat.intensity = opciones.clearCoatIntensity ?? 0.42;
    material.clearCoat.roughness = opciones.clearCoatRoughness ?? 0.32;

    if (opciones.texture) {
      material.albedoTexture = opciones.texture;
      material.useRoughnessFromMetallicTextureAlpha = false;
    }

    if (opciones.emissive) {
      material.emissiveColor = hexAColor3(opciones.emissive);
      material.emissiveIntensity = opciones.emissiveIntensity ?? 0.35;
    }

    return material;
  }

  function crearMaterialLogo(texto, marca) {
    const textura = crearTexturaLogo(texto, marca);
    const material = new BABYLON.PBRMaterial(`logo_${normalizarNombre(marca)}_${normalizarNombre(texto)}`, estado.escena);
    material.albedoTexture = textura;
    material.emissiveTexture = textura;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveIntensity = 0.18;
    material.metallic = 0;
    material.roughness = 0.38;
    material.backFaceCulling = false;
    material.useAlphaFromAlbedoTexture = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    return material;
  }

  function crearMaterialChipM() {
    const textura = crearTexturaChipM();
    const material = new BABYLON.PBRMaterial("m_badge_lower_material", estado.escena);
    material.albedoTexture = textura;
    material.emissiveTexture = textura;
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveIntensity = 0.12;
    material.metallic = 0;
    material.roughness = 0.34;
    material.backFaceCulling = false;
    material.useAlphaFromAlbedoTexture = true;
    material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    return material;
  }

  function crearTexturaLogo(texto, marca) {
    const textura = new BABYLON.DynamicTexture(
      `logo_texture_${normalizarNombre(marca)}_${normalizarNombre(texto)}`,
      { width: 512, height: 512 },
      estado.escena,
      true
    );
    const ctx = textura.getContext();
    ctx.clearRect(0, 0, 512, 512);

    if (marca === "BMW" && texto === "M") {
      dibujarEmblemaBmw(ctx);
    } else {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "rgba(5,5,5,0.88)";
      rectanguloRedondeado(ctx, 56, 162, 400, 170, 34);
      ctx.fill();
      ctx.strokeStyle = marca === "Audi" || marca === "Mercedes" ? "#d62828" : "#ffffff";
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = texto.length > 10 ? "800 44px Arial" : "900 68px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(texto, 256, 247);
      ctx.restore();
    }

    textura.hasAlpha = true;
    textura.update(false);
    return textura;
  }

  function dibujarEmblemaBmw(ctx) {
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

  function dibujarChipM(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    rectanguloRedondeado(ctx, 132, 338, 248, 70, 12);
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

  function crearTexturaChipM() {
    const textura = new BABYLON.DynamicTexture(
      "m_badge_lower_texture",
      { width: 256, height: 96 },
      estado.escena,
      true
    );
    const ctx = textura.getContext();
    ctx.clearRect(0, 0, 256, 96);
    ctx.fillStyle = "rgba(5,5,5,0.9)";
    rectanguloRedondeado(ctx, 16, 18, 224, 60, 10);
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
    textura.hasAlpha = true;
    textura.update(false);
    return textura;
  }

  function enlazarEventosConfigurador() {
    raiz.addEventListener("change", (evento) => {
      const selector = evento.target.closest("[data-config-select]");
      if (!selector) return;

      const clave = selector.dataset.configSelect;
      config[clave] = selector.value;
      actualizarOpcionesDisponibles();

      if (clave === "marca" || clave === "modelo") {
        recargarModeloSiNecesario().then(() => {
          actualizarResumen();
          actualizarPrecio();
        });
      } else {
        actualizarAparienciaModelo();
        actualizarResumen();
        actualizarPrecio();
      }
    });

    raiz.addEventListener("click", (evento) => {
      const opcion = evento.target.closest("[data-config-option]");
      if (opcion && !opcion.disabled) {
        const clave = opcion.dataset.configOption;
        config[clave] = clave === "pantallaRpm" ? opcion.dataset.value === "true" : opcion.dataset.value;
        actualizarOpcionesDisponibles();
        actualizarAparienciaModelo();
        actualizarResumen();
        actualizarPrecio();
        return;
      }

      const paso = evento.target.closest("[data-step-target]");
      if (paso) {
        establecerPasoActivo(paso.dataset.stepTarget);
      }
    });

    nodos.botonReiniciarCamara?.addEventListener("click", reiniciarCamara);
    nodos.botonGuardar?.addEventListener("click", () => guardarDiseno(false));
    nodos.botonComprar?.addEventListener("click", () => irAlPago());
  }

  function irAlPago() {
    const payload = crearPayloadVolante(true);
    try {
      localStorage.setItem("cdp.volante.checkout", JSON.stringify(payload));
    } catch (error) { /* localStorage no disponible */ }
    window.location.href = "pago.html";
  }

  function construirUrlCompartir() {
    const ligero = {
      marca: config.marca,
      modelo: config.modelo,
      logo: config.logo,
      aro: config.aro,
      agarres: config.agarres,
      costuras: config.costuras,
      marcador: config.marcador,
      molduras: config.molduras,
      pantallaRpm: config.pantallaRpm,
      levas: config.levas,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(ligero))));
    const base = window.location.origin + window.location.pathname;
    return `${base}?cfg=${encoded}`;
  }

  window.CDPConfiguratorShare = construirUrlCompartir;

  function actualizarOpcionesDisponibles() {
    const clavesMarca = Object.keys(datosConfigurador);
    if (!datosConfigurador[config.marca]) config.marca = clavesMarca[0];

    const marca = datosConfigurador[config.marca];
    if (!marca.modelos.some((modelo) => modelo.id === config.modelo)) {
      config.modelo = marca.modelos[0].id;
    }
    if (!marca.logos.includes(config.logo)) {
      config.logo = marca.logos[0];
    }

    sanearOpcion("levas");
    rellenarSelect(nodos.selectores.marca, clavesMarca.map((claveMarca) => ({ id: claveMarca, label: claveMarca })), config.marca);
    rellenarSelect(nodos.selectores.modelo, marca.modelos, config.modelo);
    rellenarSelect(nodos.selectores.logo, marca.logos.map((logo) => ({ id: logo, label: logo })), config.logo);
    renderizarGruposOpciones();
  }

  function rellenarSelect(selector, opciones, valorSeleccionado) {
    if (!selector) return;
    selector.innerHTML = "";
    opciones.forEach((item) => {
      const opcion = document.createElement("option");
      opcion.value = item.id;
      opcion.textContent = item.label;
      opcion.selected = String(item.id) === String(valorSeleccionado);
      selector.appendChild(opcion);
    });
  }

  function renderizarGruposOpciones() {
    nodos.gruposOpciones.forEach((nodoGrupo) => {
      const clave = nodoGrupo.dataset.optionGroup;
      nodoGrupo.innerHTML = "";

      (datosOpciones[clave] || []).forEach((opcion) => {
        nodoGrupo.appendChild(crearBotonOpcion(clave, opcion));
      });
    });
  }

  function crearBotonOpcion(clave, opcion) {
    const boton = document.createElement("button");
    const activo = String(config[clave]) === String(opcion.id);
    const compatible = esOpcionCompatible(clave, opcion);

    boton.type = "button";
    boton.className = `option-btn${activo ? " is-active" : ""}`;
    boton.dataset.configOption = clave;
    boton.dataset.value = String(opcion.id);
    boton.disabled = !compatible;
    boton.setAttribute("aria-pressed", activo ? "true" : "false");

    if (!compatible) {
      boton.title = "No compatible con el modelo seleccionado";
    }

    if (opcion.swatch) {
      const muestra = document.createElement("span");
      muestra.className = "option-swatch";
      muestra.style.background = opcion.swatch;
      boton.appendChild(muestra);
    }

    const etiqueta = document.createElement("span");
    etiqueta.textContent = opcion.label;
    boton.appendChild(etiqueta);

    if (opcion.price > 0) {
      const precio = document.createElement("small");
      precio.textContent = `+${formatearPrecio(opcion.price)}`;
      boton.appendChild(precio);
    }

    return boton;
  }

  function sanearOpcion(clave) {
    const actual = obtenerOpcion(clave);
    if (actual && esOpcionCompatible(clave, actual)) return;

    const alternativa = (datosOpciones[clave] || []).find((opcion) => esOpcionCompatible(clave, opcion));
    if (alternativa) config[clave] = alternativa.id;
  }

  function esOpcionCompatible(clave, opcion) {
    if (clave === "levas" && opcion.needsMagnetic) return !!obtenerModelo().levasMagneticas;
    return true;
  }

  function actualizarAparienciaModelo() {
    if (!estado.raizModelo) return;

    reconstruirModeloProceduralSiNecesario();

    const aro = obtenerOpcion("aro");
    const agarres = obtenerOpcion("agarres");
    const costuras = obtenerOpcion("costuras");
    const marcador = obtenerOpcion("marcador");
    const molduras = obtenerOpcion("molduras");

    aplicarTexturaAPieza("aro", aro.texture, aro.materialProfile);
    aplicarTexturaAPieza("agarres_laterales", agarres.texture, agarres.materialProfile);
    aplicarMaterialCosturas(costuras);
    aplicarMaterialMarcador(marcador);
    aplicarMaterialMolduras(molduras);
    aplicarTexturaLogo();
    aplicarMaterialLevas();
    alternarPieza("pantalla_rpm", config.pantallaRpm);
    alternarPieza("levas", config.levas !== "sin-levas");

    actualizarMetaPreview();
  }

  function reconstruirModeloProceduralSiNecesario() {
    if (estado.cargadoDesdeGlb) return;

    const estiloSiguiente = esEstiloAudiRs() ? "audi-rs" : "default";
    if (estado.estiloPlaceholder === estiloSiguiente) return;

    eliminarModeloActual();
    crearVolantePlaceholder();
  }

  function eliminarModeloActual() {
    if (!estado.raizModelo) return;

    estado.raizModelo.getChildMeshes(false).forEach((malla) => {
      malla.dispose(false, false);
    });
    estado.raizModelo.dispose();
    estado.raizModelo = null;
    reiniciarPiezas();
  }

  function esEstiloAudiRs() {
    return config.marca === "Audi" && (/rs/i.test(config.modelo) || /rs/i.test(config.logo));
  }

  function aplicarMaterialAPieza(clavePieza, material) {
    obtenerPiezas(clavePieza).forEach((pieza) => {
      pieza.material = material;
    });
  }

  function aplicarTexturaAPieza(clavePieza, claveTextura, perfil = "leather") {
    const ajustesPerfil = {
      carbon: { metallic: 0.56, roughness: 0.28, clearCoatIntensity: 0.72 },
      forgedCarbon: { metallic: 0.62, roughness: 0.24, clearCoatIntensity: 0.82 },
      leather: { metallic: 0.06, roughness: 0.62, clearCoatIntensity: 0.28 },
      fabric: { metallic: 0.02, roughness: 0.92, clearCoat: false },
    };
    const material = crearMaterialPbr(
      `mat_${clavePieza}_${claveTextura}`,
      {
        texture: estado.texturas[claveTextura],
        ...(ajustesPerfil[perfil] || ajustesPerfil.leather),
      }
    );
    aplicarMaterialAPieza(clavePieza, material);
  }

  function aplicarMaterialCosturas(opcion) {
    const material = opcion.texture
      ? crearMaterialPbr("mat_costuras_pattern", {
          texture: estado.texturas[opcion.texture],
          metallic: 0.02,
          roughness: 0.58,
          clearCoatIntensity: 0.1,
        })
      : crearMaterialPbr(`mat_costuras_${opcion.id}`, {
          color: opcion.color,
          metallic: 0.02,
          roughness: 0.58,
          clearCoatIntensity: 0.1,
        });
    aplicarMaterialAPieza("costuras", material);
  }

  function aplicarMaterialMarcador(opcion) {
    const material = opcion.texture
      ? crearMaterialPbr("mat_marcador_pattern", {
          texture: estado.texturas[opcion.texture],
          metallic: 0.2,
          roughness: 0.32,
        })
      : crearMaterialPbr(`mat_marcador_${opcion.id}`, {
          color: opcion.color,
          metallic: 0.2,
          roughness: 0.32,
        });
    aplicarMaterialAPieza("marcador_superior", material);
  }

  function aplicarMaterialMolduras(opcion) {
    const material = crearMaterialPbr(`mat_molduras_${opcion.id}`, {
      color: opcion.color,
      metallic: opcion.metallic ?? 0.68,
      roughness: opcion.roughness ?? 0.34,
    });
    aplicarMaterialAPieza("molduras", material);
    estado.materiales.molduras = material;
  }

  function aplicarTexturaLogo() {
    if (estado.estiloPlaceholder === "audi-rs") return;

    const material = crearMaterialLogo(config.logo, config.marca);
    aplicarMaterialAPieza("logo", material);
  }

  function aplicarMaterialLevas() {
    if (config.levas === "aluminio") {
      aplicarMaterialAPieza("levas", estado.materiales.levasAluminio);
      restaurarDetallesLevasAudiRs();
      return;
    }
    if (config.levas === "magneticas") {
      aplicarMaterialAPieza("levas", estado.materiales.levasMagneticas);
      restaurarDetallesLevasAudiRs();
      return;
    }
    aplicarMaterialAPieza("levas", estado.materiales.levasCarbono);
    restaurarDetallesLevasAudiRs();
  }

  function restaurarDetallesLevasAudiRs() {
    if (estado.estiloPlaceholder !== "audi-rs") return;

    obtenerPiezas("levas")
      .filter((pieza) => pieza.name.includes("_hole_"))
      .forEach((pieza) => {
        pieza.material = estado.materiales.bordeSombra;
      });
  }

  function alternarPieza(clavePieza, visible) {
    obtenerPiezas(clavePieza).forEach((pieza) => {
      pieza.setEnabled(visible);
    });
  }

  function actualizarResumen() {
    const valores = obtenerEtiquetasResumen();
    nodos.resumen.forEach((nodoResumen) => {
      nodoResumen.textContent = valores[nodoResumen.dataset.summary] || "";
    });
  }

  function actualizarPrecio() {
    const modelo = obtenerModelo();
    const extras = [
      ["Aro", obtenerOpcion("aro")],
      ["Agarres", obtenerOpcion("agarres")],
      ["Costuras", obtenerOpcion("costuras")],
      ["Pantalla RPM", obtenerOpcion("pantallaRpm")],
      ["Levas", obtenerOpcion("levas")],
      ["Marcador", obtenerOpcion("marcador")],
      ["Molduras", obtenerOpcion("molduras")],
    ];

    const lineasExtras = extras
      .filter(([, opcion]) => opcion && opcion.price > 0)
      .map(([etiqueta, opcion]) => ({
        label: etiqueta,
        option: opcion.label,
        amount: opcion.price,
      }));

    estado.lineasPrecio = [
      { label: `Base ${config.marca} ${modelo.label}`, amount: modelo.basePrice },
      ...lineasExtras,
    ];
    estado.precio = estado.lineasPrecio.reduce((total, linea) => total + linea.amount, 0);

    if (nodos.precio) nodos.precio.textContent = formatearPrecio(estado.precio);
    if (nodos.desglosePrecio) {
      nodos.desglosePrecio.innerHTML = estado.lineasPrecio
        .map((linea, indice) => {
          const signo = indice === 0 ? "" : "+";
          const etiqueta = linea.option ? `${linea.label}: ${linea.option}` : linea.label;
          return `<div><span>${etiqueta}</span><strong>${signo}${formatearPrecio(linea.amount)}</strong></div>`;
        })
        .join("");
    }

    actualizarPayloadBackend();
  }

  function actualizarPayloadBackend() {
    const payload = construirPayloadBackend();
    const json = JSON.stringify(payload);
    if (nodos.salidaJson) nodos.salidaJson.value = json;
    if (nodos.enlaceSolicitud) {
      nodos.enlaceSolicitud.href = `contacto.html?configuracion=${encodeURIComponent(json)}`;
    }
  }

  async function guardarDiseno(crearSolicitud) {
    const backend = window.CDPBackend;
    const payload = crearPayloadVolante(crearSolicitud);
    const modo = crearSolicitud ? "comprar" : "guardar";

    cambiarEstadoBotones(true);
    mostrarEstado(crearSolicitud ? "Preparando solicitud de compra..." : "Guardando boceto 3D...", "info");

    try {
      if (!backend?.isConfigured?.()) {
        const guardado = guardarVolantePendiente(payload, modo);
        mostrarEstado(guardado
          ? "Boceto guardado en este navegador. Abre la web desde XAMPP e inicia sesion para verlo en Cuenta > Volantes generados."
          : "No se pudo guardar el boceto en este navegador. Prueba a iniciar sesion antes de guardar.", guardado ? "info" : "error");
        return;
      }

      const session = await backend.getCustomerSession();
      if (session?.authenticated) {
        const respuesta = await backend.guardarVolanteGenerado(payload);
        mostrarEstado(respuesta?.mensaje || (crearSolicitud
          ? "Solicitud enviada. El diseno queda guardado en Cuenta > Volantes generados y en el panel de administrador."
          : "Diseno guardado. Lo podras ver desde Cuenta > Volantes generados."), "success");
        localStorage.removeItem(CLAVE_VOLANTE_PENDIENTE);
        return;
      }

      const guardado = guardarVolantePendiente(payload, modo);
      mostrarEstado(guardado
        ? (crearSolicitud
          ? "Para completar la compra inicia sesion. Hemos guardado este boceto en el navegador y se enviara al entrar en tu cuenta."
          : "Boceto guardado temporalmente. Podras volver a verlo desde esta misma pagina; si inicias sesion se guardara en Cuenta > Volantes generados.")
        : "No se pudo guardar el boceto en este navegador. Inicia sesion para guardarlo directamente en tu cuenta.", guardado ? "info" : "error");
    } catch (error) {
      const guardado = guardarVolantePendiente(payload, modo);
      mostrarEstado(guardado
        ? (error?.message || "No se pudo guardar ahora. Hemos dejado el boceto preparado para recuperarlo al iniciar sesion.")
        : (error?.message || "No se pudo guardar ahora. Inicia sesion y vuelve a intentarlo."), "error");
    } finally {
      cambiarEstadoBotones(false);
    }
  }

  function crearPayloadVolante(crearSolicitud) {
    const payload = construirPayloadBackend();
    const resumen = payload.resumen || {};

    return {
      ...payload,
      titulo: `Volante ${resumen.marca || config.marca} ${resumen.modelo || config.modelo}`,
      boceto_3d: capturarBoceto(),
      crear_solicitud: crearSolicitud,
    };
  }

  function capturarBoceto() {
    if (!estado.escena || !estado.lienzo) return "";

    try {
      estado.escena.render();
      return estado.lienzo.toDataURL("image/jpeg", 0.86);
    } catch (error) {
      return "";
    }
  }

  function guardarVolantePendiente(payload, modo) {
    try {
      localStorage.setItem(CLAVE_VOLANTE_PENDIENTE, JSON.stringify({
        modo,
        diseno: payload,
        guardado_en: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      return false;
    }
  }

  function mostrarEstado(mensaje, tipo = "info") {
    if (!nodos.estadoUi) return;
    nodos.estadoUi.hidden = false;
    nodos.estadoUi.className = `configurator-status is-${tipo}`;
    nodos.estadoUi.textContent = mensaje;
  }

  function cambiarEstadoBotones(bloqueado) {
    [nodos.botonGuardar, nodos.botonComprar].forEach((boton) => {
      if (boton) boton.disabled = bloqueado;
    });
  }

  function construirPayloadBackend() {
    return {
      producto: "volante-personalizado-cdp-customs",
      configuracion: { ...config },
      resumen: obtenerEtiquetasResumen(),
      precio: {
        moneda: "EUR",
        lineas: estado.lineasPrecio.map((linea) => ({ ...linea })),
        total: estado.precio,
      },
      visual: {
        motor: "Babylon.js",
        modelo: estado.cargadoDesdeGlb ? (estado.urlModeloActual || URL_MODELO_POR_DEFECTO) : "placeholder-procedural",
        formatoEsperado: "glb/gltf",
        piezasEsperadas: Object.keys(aliasPartes),
      },
    };
  }

  function actualizarMetaPreview() {
    const marca = datosConfigurador[config.marca];
    const modelo = obtenerModelo();

    if (nodos.logoMarca) {
      nodos.logoMarca.src = marca.brandLogo;
      nodos.logoMarca.alt = config.marca;
    }
    if (nodos.chipMarca) nodos.chipMarca.textContent = `${config.marca} ${modelo.label}`;
    if (nodos.basePreview) nodos.basePreview.textContent = `${config.marca} ${modelo.label}`;
    if (nodos.backendPreview) {
      nodos.backendPreview.textContent = estado.cargadoDesdeGlb
        ? "GLB por piezas cargado"
        : "Vista 3D generada lista para GLB";
    }
    if (nodos.estadoCompatibilidad) {
      nodos.estadoCompatibilidad.textContent = modelo.levasMagneticas
        ? "Compatible con levas magneticas"
        : "Sin levas magneticas";
    }
  }

  function establecerPasoActivo(clavePaso) {
    nodos.botonesPaso.forEach((boton) => {
      boton.classList.toggle("is-active", boton.dataset.stepTarget === clavePaso);
    });
    nodos.panelesPaso.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.stepPanel === clavePaso);
    });
  }

  function registrarPieza(clavePieza, malla) {
    if (!estado.partes[clavePieza]) estado.partes[clavePieza] = [];
    estado.partes[clavePieza].push(malla);
    malla.isPickable = false;
  }

  function reiniciarPiezas() {
    estado.partes = Object.keys(aliasPartes).reduce((acc, clave) => {
      acc[clave] = [];
      return acc;
    }, {});
  }

  function obtenerPiezas(clavePieza) {
    return estado.partes[clavePieza] || [];
  }

  function obtenerModelo() {
    const marca = datosConfigurador[config.marca];
    return marca.modelos.find((modelo) => modelo.id === config.modelo) || marca.modelos[0];
  }

  function obtenerOpcion(clave) {
    return (datosOpciones[clave] || []).find((opcion) => String(opcion.id) === String(config[clave]));
  }

  function obtenerEtiquetasResumen() {
    return {
      marca: config.marca,
      modelo: obtenerModelo().label,
      aro: obtenerOpcion("aro").label,
      agarres: obtenerOpcion("agarres").label,
      costuras: obtenerOpcion("costuras").label,
      logo: config.logo,
      pantallaRpm: config.pantallaRpm ? "Si" : "No",
      levas: obtenerOpcion("levas").label,
      marcador: obtenerOpcion("marcador").label,
      molduras: obtenerOpcion("molduras").label,
      precioFinal: formatearPrecio(estado.precio),
    };
  }

  function animarCamaraA(alfa, beta, radio, fotogramas = 24) {
    if (!estado.camara) return;
    BABYLON.Animation.CreateAndStartAnimation("cam_a", estado.camara, "alpha", 60, fotogramas, estado.camara.alpha, alfa, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    BABYLON.Animation.CreateAndStartAnimation("cam_b", estado.camara, "beta",  60, fotogramas, estado.camara.beta,  beta,  BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    BABYLON.Animation.CreateAndStartAnimation("cam_r", estado.camara, "radius",60, fotogramas, estado.camara.radius,radio,BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    estado.camara.setTarget(new BABYLON.Vector3(0, 0.02, 0));
  }

  function reiniciarCamara() {
    animarCamaraA(Math.PI / 2, Math.PI / 2, 4.6);
  }

  window.CDPCameraView = {
    frontal: () => animarCamaraA(Math.PI / 2,    Math.PI / 2,    4.6),
    tresCuartos: () => animarCamaraA(Math.PI / 2.6, Math.PI / 2.2, 4.9),
    trasera: () => animarCamaraA(-Math.PI / 2,   Math.PI / 2,    4.8),
  };

  function redimensionarRenderizador() {
    if (!estado.motor || !nodos.escenario) return;
    estado.motor.resize();

    if (estado.camara?.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
      const { width, height } = nodos.escenario.getBoundingClientRect();
      const mediaAltura = 1.95;
      const mediaAnchura = mediaAltura * (width / Math.max(height, 1));
      estado.camara.orthoLeft = -mediaAnchura;
      estado.camara.orthoRight = mediaAnchura;
      estado.camara.orthoTop = mediaAltura;
      estado.camara.orthoBottom = -mediaAltura;
    }
  }

  function ocultarCargador() {
    nodos.cargador?.classList.add("is-hidden");
  }

  function mostrarMensajeVisor(mensaje) {
    if (!nodos.cargador) return;
    nodos.cargador.innerHTML = `<strong>${mensaje}</strong>`;
    nodos.cargador.classList.remove("is-hidden");
  }

  function formatearPrecio(valor) {
    return `${valor.toLocaleString("es-ES")} EUR`;
  }

  function normalizarNombre(valor) {
    return String(valor)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function hexAColor3(hex) {
    const rgb = hexARgb(hex);
    return new BABYLON.Color3(rgb.r / 255, rgb.g / 255, rgb.b / 255);
  }

  function hexARgb(hex) {
    const resultado = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return resultado
      ? {
          r: parseInt(resultado[1], 16),
          g: parseInt(resultado[2], 16),
          b: parseInt(resultado[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  function rectanguloRedondeado(ctx, x, y, ancho, alto, radio) {
    ctx.beginPath();
    ctx.moveTo(x + radio, y);
    ctx.arcTo(x + ancho, y, x + ancho, y + alto, radio);
    ctx.arcTo(x + ancho, y + alto, x, y + alto, radio);
    ctx.arcTo(x, y + alto, x, y, radio);
    ctx.arcTo(x, y, x + ancho, y, radio);
    ctx.closePath();
  }

  function aplicarConfiguracionInicial() {
    const params = new URLSearchParams(window.location.search);
    const cfg = params.get("cfg");
    const raw = params.get("configuracion");
    let entrada = null;

    if (cfg) {
      try {
        const json = decodeURIComponent(escape(atob(cfg)));
        const data = JSON.parse(json);
        entrada = data?.configuracion && typeof data.configuracion === "object" ? data.configuracion : data;
      } catch (error) { /* fallback al siguiente formato */ }
    }

    if (!entrada && raw) {
      try {
        const data = JSON.parse(raw);
        entrada = data?.configuracion && typeof data.configuracion === "object" ? data.configuracion : data;
      } catch (error) { return; }
    }

    if (!entrada) return;

    Object.keys(config).forEach((clave) => {
      if (!Object.prototype.hasOwnProperty.call(entrada, clave)) return;
      config[clave] = clave === "pantallaRpm"
        ? entrada[clave] === true || entrada[clave] === "true"
        : entrada[clave];
    });
  }

  aplicarConfiguracionInicial();
  inicializarConfigurador();

  window.CDPConfigurator = {
    getConfig: () => ({ ...config }),
    getPayload: construirPayloadBackend,
    getBoceto: capturarBoceto,
    setConfig: (partialConfig) => {
      Object.assign(config, partialConfig || {});
      actualizarOpcionesDisponibles();
      actualizarAparienciaModelo();
      actualizarResumen();
      actualizarPrecio();
    },
    data: datosConfigurador,
    options: datosOpciones,
    irAlPago,
  };

  window.CDPConfigurator3D = window.CDPConfigurator;
})();
