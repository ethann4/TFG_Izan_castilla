(function () {
  const clavesAlmacenamiento = {
    region: "cdp.region",
    language: "cdp.language",
  };

  const opcionesIdioma = {
    es: { code: "ES", name: "Español" },
    nb: { code: "NB", name: "Norsk Bokmål" },
    en: { code: "EN", name: "English" },
    de: { code: "DE", name: "Deutsch" },
    fr: { code: "FR", name: "Français" },
  };

  const etiquetasRegion = {
    es: "España | EUR €",
    pt: "Portugal | EUR €",
    fr: "Francia | EUR €",
  };

  const traducciones = {
    en: {
      "INICIO": "HOME",
      "TIENDA": "SHOP",
      "MARCAS": "BRANDS",
      "NOSOTROS": "ABOUT",
      "CONTACTO": "CONTACT",
      "Catalogo completo": "Full catalog",
      "Volantes y acabados personalizados": "Steering wheels and custom finishes",
      "Volantes, acabados y piezas a medida": "Steering wheels, finishes and custom parts",
      "Configurador visual": "Visual configurator",
      "Base para pedidos a medida": "Base for custom orders",
      "Base funcional para pedidos a medida": "Functional base for custom orders",
      "Disena tu volante a medida": "Design your custom steering wheel",
      "Personalizacion premium para interiores deportivos: cuero, alcantara, carbono, costuras, levas y pantallas RPM.": "Premium customization for sport interiors: leather, alcantara, carbon fiber, stitching, paddles and RPM screens.",
      "Ver catalogo": "View catalog",
      "Crear volante": "Create steering wheel",
      "Taller y venta especializada": "Workshop and specialized sales",
      "Volantes con identidad propia": "Steering wheels with their own identity",
      "CDP Customs nace en Vizcaya con una idea clara: transformar el punto de contacto mas importante del conductor en una pieza unica, comoda y coherente con el coche.": "CDP Customs was born in Biscay with a clear idea: turning the driver's most important touch point into a unique, comfortable piece that matches the car.",
      "Tapizado artesanal": "Handcrafted upholstery",
      "Compatibilidad por modelo": "Model compatibility",
      "Pedido personalizado": "Custom order",
      "Catalogo destacado": "Featured catalog",
      "Novedades CDP": "CDP new arrivals",
      "Abrir catalogo completo": "Open full catalog",
      "Compatibilidad": "Compatibility",
      "Marcas preparadas": "Supported brands",
      "Personalizacion y venta de volantes premium para proyectos de automocion con identidad propia.": "Customization and sale of premium steering wheels for automotive projects with their own identity.",
      "Menu": "Menu",
      "Vizcaya, Espana": "Biscay, Spain",
      "Volantes personalizados con acabados en cuero, alcantara, carbono, levas y pantalla RPM.": "Custom steering wheels with leather, alcantara, carbon fiber, paddles and RPM screen finishes.",
      "Volantes premium": "Premium steering wheels",
      "FILTROS": "FILTERS",
      "MARCA": "BRAND",
      "MODELO": "MODEL",
      "MATERIAL": "MATERIAL",
      "COLOR": "COLOR",
      "Todos": "All",
      "Todas": "All",
      "Cuero": "Leather",
      "Alcantara": "Alcantara",
      "Carbono": "Carbon fiber",
      "Negro": "Black",
      "Azul": "Blue",
      "Rojo": "Red",
      "Amarillo": "Yellow",
      "Blanco": "White",
      "PRECIO": "PRICE",
      "Volver": "Back",
      "Iniciar sesión": "Sign in",
      "Accede a tu cuenta para continuar": "Access your account to continue",
      "Correo electrónico": "Email",
      "Contraseña": "Password",
      "¿Olvidaste tu contraseña?": "Forgot your password?",
      "O continúa con": "Or continue with",
      "¿No tienes cuenta? Regístrate": "No account? Register",
      "Crear cuenta": "Create account",
      "Regístrate para guardar tus pedidos y usar la cesta": "Register to save your orders and use the basket",
      "Nombre": "Name",
      "Teléfono": "Phone",
      "Ya tienes cuenta": "Already have an account",
      "Inicia sesión": "Sign in",
      "Sesión iniciada": "Session started",
      "Acceso administrador": "Administrator access",
      "Panel administrador": "Administrator panel",
      "Tu sesion de administrador ya esta activa.": "Your administrator session is already active.",
      "Entrar al panel": "Open panel",
      "Seguir comprando": "Keep shopping",
      "Ir a la cesta": "Go to basket",
      "Cerrar sesion": "Log out",
      "Mis datos": "My details",
      "Mis pedidos": "My orders",
      "Volantes generados": "Generated steering wheels",
      "Cerrar sesión": "Log out",
    },
    fr: {
      "INICIO": "ACCUEIL",
      "TIENDA": "BOUTIQUE",
      "MARCAS": "MARQUES",
      "NOSOTROS": "À PROPOS",
      "CONTACTO": "CONTACT",
      "Catalogo completo": "Catalogue complet",
      "Volantes y acabados personalizados": "Volants et finitions sur mesure",
      "Volantes, acabados y piezas a medida": "Volants, finitions et pieces sur mesure",
      "Configurador visual": "Configurateur visuel",
      "Base para pedidos a medida": "Base pour commandes sur mesure",
      "Base funcional para pedidos a medida": "Base fonctionnelle pour commandes sur mesure",
      "Disena tu volante a medida": "Concevez votre volant sur mesure",
      "Personalizacion premium para interiores deportivos: cuero, alcantara, carbono, costuras, levas y pantallas RPM.": "Personnalisation premium pour interieurs sportifs : cuir, alcantara, carbone, coutures, palettes et ecrans RPM.",
      "Ver catalogo": "Voir le catalogue",
      "Crear volante": "Creer un volant",
      "Taller y venta especializada": "Atelier et vente specialisee",
      "Volantes con identidad propia": "Volants avec leur propre identite",
      "CDP Customs nace en Vizcaya con una idea clara: transformar el punto de contacto mas importante del conductor en una pieza unica, comoda y coherente con el coche.": "CDP Customs nait en Biscaye avec une idee claire : transformer le point de contact principal du conducteur en une piece unique, confortable et coherente avec la voiture.",
      "Tapizado artesanal": "Sellerie artisanale",
      "Compatibilidad por modelo": "Compatibilite par modele",
      "Pedido personalizado": "Commande personnalisee",
      "Catalogo destacado": "Catalogue mis en avant",
      "Novedades CDP": "Nouveautes CDP",
      "Abrir catalogo completo": "Ouvrir le catalogue complet",
      "Compatibilidad": "Compatibilite",
      "Marcas preparadas": "Marques preparees",
      "Personalizacion y venta de volantes premium para proyectos de automocion con identidad propia.": "Personnalisation et vente de volants premium pour des projets automobiles avec identite propre.",
      "Menu": "Menu",
      "Vizcaya, Espana": "Biscaye, Espagne",
      "Volantes personalizados con acabados en cuero, alcantara, carbono, levas y pantalla RPM.": "Volants personnalises avec finitions cuir, alcantara, carbone, palettes et ecran RPM.",
      "Volantes premium": "Volants premium",
      "FILTROS": "FILTRES",
      "MARCA": "MARQUE",
      "MODELO": "MODELE",
      "MATERIAL": "MATERIAU",
      "COLOR": "COULEUR",
      "Todos": "Tous",
      "Todas": "Toutes",
      "Cuero": "Cuir",
      "Alcantara": "Alcantara",
      "Carbono": "Carbone",
      "Negro": "Noir",
      "Azul": "Bleu",
      "Rojo": "Rouge",
      "Amarillo": "Jaune",
      "Blanco": "Blanc",
      "PRECIO": "PRIX",
      "Volver": "Retour",
      "Iniciar sesión": "Connexion",
      "Accede a tu cuenta para continuar": "Accedez a votre compte pour continuer",
      "Correo electrónico": "E-mail",
      "Contraseña": "Mot de passe",
      "¿Olvidaste tu contraseña?": "Mot de passe oublie ?",
      "O continúa con": "Ou continuer avec",
      "¿No tienes cuenta? Regístrate": "Pas de compte ? Inscrivez-vous",
      "Crear cuenta": "Creer un compte",
      "Regístrate para guardar tus pedidos y usar la cesta": "Inscrivez-vous pour sauvegarder vos commandes et utiliser le panier",
      "Nombre": "Nom",
      "Teléfono": "Telephone",
      "Ya tienes cuenta": "Vous avez deja un compte",
      "Inicia sesión": "Connexion",
      "Sesión iniciada": "Session ouverte",
      "Acceso administrador": "Acces administrateur",
      "Panel administrador": "Panneau administrateur",
      "Tu sesion de administrador ya esta activa.": "Votre session administrateur est deja active.",
      "Entrar al panel": "Ouvrir le panneau",
      "Seguir comprando": "Continuer les achats",
      "Ir a la cesta": "Aller au panier",
      "Cerrar sesion": "Se deconnecter",
      "Mis datos": "Mes donnees",
      "Mis pedidos": "Mes commandes",
      "Volantes generados": "Volants generes",
      "Cerrar sesión": "Se deconnecter",
    },
  };

  const traduccionesPorClave = {
    "home-hero-title": {
      es: 'Disena tu volante<br class="d-none d-xxl-block">a medida',
      en: 'Design your custom<br class="d-none d-xxl-block">steering wheel',
      fr: 'Concevez votre volant<br class="d-none d-xxl-block">sur mesure',
    },
  };

  const traduccionesInversas = {};

  Object.entries(traducciones).forEach(([, diccionario]) => {
    Object.entries(diccionario).forEach(([textoEspanol, textoTraducido]) => {
      traduccionesInversas[textoTraducido] = textoEspanol;
    });
  });

  function normalizarTexto(valor) {
    return (valor || "").replace(/\s+/g, " ").trim();
  }

  function conEspaciadoOriginal(original, reemplazo) {
    const inicio = original.match(/^\s*/)?.[0] || "";
    const fin = original.match(/\s*$/)?.[0] || "";
    return `${inicio}${reemplazo}${fin}`;
  }

  function normalizarIdioma(valor) {
    const texto = normalizarTexto(valor).toLowerCase();

    if (["en", "english"].includes(texto)) return "en";
    if (["nb", "no"].includes(texto) || texto.includes("norsk") || texto.includes("noruego") || texto.includes("bokm")) return "nb";
    if (["de", "deutsch"].includes(texto) || texto.includes("aleman") || texto.includes("alemán") || texto.includes("german")) return "de";
    if (texto === "fr" || texto.includes("fran") || texto.includes("france")) return "fr";
    return "es";
  }

  function normalizarRegion(valor) {
    const texto = normalizarTexto(valor).toLowerCase();

    if (texto.includes("portugal")) return "pt";
    if (texto.includes("francia") || texto.includes("france")) return "fr";
    return "es";
  }

  function obtenerPreferenciaGuardada(tipo) {
    try {
      return localStorage.getItem(clavesAlmacenamiento[tipo]);
    } catch (error) {
      return null;
    }
  }

  function guardarPreferencia(tipo, valor) {
    try {
      localStorage.setItem(clavesAlmacenamiento[tipo], valor);
    } catch (error) {
      return;
    }
  }

  function traducirCadena(valor, idioma) {
    const valorLimpio = normalizarTexto(valor);
    const valorEspanol = traduccionesInversas[valorLimpio] || valorLimpio;

    if (idioma === "es" || !traducciones[idioma]) {
      return valorEspanol;
    }

    return traducciones[idioma]?.[valorEspanol] || valor;
  }

  function renderizarSeleccionIdioma(destino, idioma) {
    const idiomaNormalizado = normalizarIdioma(idioma);
    const opcion = opcionesIdioma[idiomaNormalizado] || opcionesIdioma.es;
    const seleccion = document.createElement("span");
    const bandera = document.createElement("span");
    const codigo = document.createElement("span");

    destino.textContent = "";
    seleccion.className = "cdp-language-choice";
    bandera.className = `cdp-language-flag cdp-language-flag--${idiomaNormalizado}`;
    bandera.setAttribute("aria-hidden", "true");
    codigo.className = "cdp-language-code";
    codigo.textContent = opcion.code;

    seleccion.append(bandera, codigo);
    destino.appendChild(seleccion);
  }

  function traducirNodoTexto(nodo, idioma) {
    const original = nodo.nodeValue || "";
    const recortado = normalizarTexto(original);

    if (!recortado) return;

    const traducido = traducirCadena(recortado, idioma);

    if (traducido !== recortado) {
      nodo.nodeValue = conEspaciadoOriginal(original, traducido);
    }
  }

  function traducirAtributos(elemento, idioma) {
    ["placeholder", "aria-label", "title", "alt"].forEach((atributo) => {
      const valor = elemento.getAttribute(atributo);
      if (!valor) return;

      const traducido = traducirCadena(valor, idioma);
      if (traducido !== valor) {
        elemento.setAttribute(atributo, traducido);
      }
    });
  }

  function traducirElemento(elemento, idioma) {
    if (elemento.closest("script, style, textarea")) return;

    traducirAtributos(elemento, idioma);

    Array.from(elemento.childNodes).forEach((hijo) => {
      if (hijo.nodeType === Node.TEXT_NODE) {
        traducirNodoTexto(hijo, idioma);
      } else if (hijo.nodeType === Node.ELEMENT_NODE) {
        traducirElemento(hijo, idioma);
      }
    });
  }

  function aplicarIdioma(idioma) {
    const idiomaNormalizado = normalizarIdioma(idioma);
    document.documentElement.lang = idiomaNormalizado;
    traducirElemento(document.body, idiomaNormalizado);
    aplicarTraduccionesPorClave(idiomaNormalizado);
    actualizarEtiquetaPreferencia("language", idiomaNormalizado);
  }

  function aplicarTraduccionesPorClave(idioma) {
    document.querySelectorAll("[data-cdp-i18n]").forEach((elemento) => {
      const clave = elemento.dataset.cdpI18n;
      const html = traduccionesPorClave[clave]?.[idioma] || traduccionesPorClave[clave]?.es;
      if (html) elemento.innerHTML = html;
    });
  }

  function actualizarEtiquetaPreferencia(tipo, valor) {
    document.querySelectorAll(`[data-cdp-preference="${tipo}"]`).forEach((boton) => {
      const nodo = boton.querySelector("[data-cdp-label]");
      if (!nodo) return;

      if (tipo === "language") {
        const idioma = normalizarIdioma(valor);
        renderizarSeleccionIdioma(nodo, idioma);
        boton.setAttribute("aria-label", `Idioma: ${opcionesIdioma[idioma].name}`);
        return;
      }

      nodo.textContent = etiquetasRegion[normalizarRegion(valor)];
    });
  }

  function actualizarOpcionesPreferencia() {
    document.querySelectorAll("[data-cdp-preference-target='region']").forEach((opcion) => {
      const region = normalizarRegion(opcion.dataset.cdpOption || opcion.textContent);
      opcion.dataset.cdpOption = region;
      opcion.textContent = etiquetasRegion[region];
    });

    document.querySelectorAll(".cdp-tools-menu[aria-labelledby='cdpLanguageDropdown']").forEach((menu) => {
      menu.textContent = "";

      Object.keys(opcionesIdioma).forEach((idioma) => {
        const item = document.createElement("li");
        const opcion = document.createElement("button");

        opcion.className = "dropdown-item";
        opcion.type = "button";
        opcion.dataset.cdpPreferenceTarget = "language";
        opcion.dataset.cdpOption = idioma;
        opcion.setAttribute("aria-label", opcionesIdioma[idioma].name);
        opcion.title = opcionesIdioma[idioma].name;
        renderizarSeleccionIdioma(opcion, idioma);

        item.appendChild(opcion);
        menu.appendChild(item);
      });
    });
  }

  function actualizarPreferencia(tipo, valorCrudo) {
    if (tipo === "language") {
      const idioma = normalizarIdioma(valorCrudo);
      guardarPreferencia(tipo, idioma);
      aplicarIdioma(idioma);
      return;
    }

    const region = normalizarRegion(valorCrudo);
    guardarPreferencia(tipo, region);
    actualizarEtiquetaPreferencia(tipo, region);
  }

  document.addEventListener("DOMContentLoaded", () => {
    actualizarOpcionesPreferencia();

    const regionGuardada = normalizarRegion(obtenerPreferenciaGuardada("region"));
    const idiomaGuardado = normalizarIdioma(obtenerPreferenciaGuardada("language"));

    actualizarEtiquetaPreferencia("region", regionGuardada);
    aplicarIdioma(idiomaGuardado);

    document.querySelectorAll("[data-cdp-option]").forEach((opcion) => {
      opcion.addEventListener("click", () => {
        actualizarPreferencia(opcion.dataset.cdpPreferenceTarget, opcion.dataset.cdpOption);
      });
    });

    const observador = new MutationObserver((cambios) => {
      const idioma = normalizarIdioma(obtenerPreferenciaGuardada("language"));

      cambios.forEach((cambio) => {
        cambio.addedNodes.forEach((nodo) => {
          if (nodo.nodeType === Node.ELEMENT_NODE) {
            traducirElemento(nodo, idioma);
          } else if (nodo.nodeType === Node.TEXT_NODE) {
            traducirNodoTexto(nodo, idioma);
          }
        });
      });
    });

    observador.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

  window.CDPHeader = {
    applyLanguage: aplicarIdioma,
    updatePreference: actualizarPreferencia,
  };
})();
