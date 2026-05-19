(function () {
  const storageKeys = {
    region: "cdp.region",
    language: "cdp.language",
  };

  const languageLabels = {
    es: "Espa\u00f1ol",
    en: "English",
    fr: "Fran\u00e7ais",
  };

  const regionLabels = {
    es: "Espa\u00f1a | EUR \u20ac",
    pt: "Portugal | EUR \u20ac",
    fr: "Francia | EUR \u20ac",
  };

  const translations = {
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
      "La estructura separa marca, modelo, material, color y precio para filtrar productos cargados desde SQL.": "The structure separates brand, model, material, color and price to filter products loaded from SQL.",
      "Personalizacion y venta de volantes premium para proyectos de automocion con identidad propia.": "Customization and sale of premium steering wheels for automotive projects with their own identity.",
      "Menu": "Menu",
      "Proyecto DAW": "DAW project",
      "Interfaz HTML, CSS y JS": "HTML, CSS and JS interface",
      "Servidor PHP/MySQL": "PHP/MySQL server",
      "CRUD de productos y pedidos": "Product and order CRUD",
      "Vizcaya, Espana": "Biscay, Spain",
      "CDP Customs - Proyecto final DAW": "CDP Customs - Final DAW project",
      "Bootstrap adaptado y profesionalizado": "Adapted and professionalized Bootstrap",
      "Volantes personalizados con acabados en cuero, alcantara, carbono, levas y pantalla RPM.": "Custom steering wheels with leather, alcantara, carbon fiber, paddles and RPM screen finishes.",
      "Volantes premium": "Premium steering wheels",
      "Catalogo conectado a PHP/MySQL con filtros normalizados.": "Catalog connected to PHP/MySQL with normalized filters.",
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
      "Iniciar sesi\u00f3n": "Sign in",
      "Accede a tu cuenta para continuar": "Access your account to continue",
      "Correo electr\u00f3nico": "Email",
      "Contrase\u00f1a": "Password",
      "\u00bfOlvidaste tu contrase\u00f1a?": "Forgot your password?",
      "O contin\u00faa con": "Or continue with",
      "\u00bfNo tienes cuenta? Reg\u00edstrate": "No account? Register",
      "Crear cuenta": "Create account",
      "Reg\u00edstrate para guardar tus pedidos y usar la cesta": "Register to save your orders and use the basket",
      "Nombre": "Name",
      "Tel\u00e9fono": "Phone",
      "Ya tienes cuenta": "Already have an account",
      "Inicia sesi\u00f3n": "Sign in",
      "Sesi\u00f3n iniciada": "Session started",
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
      "Cerrar sesi\u00f3n": "Log out",
    },
    fr: {
      "INICIO": "ACCUEIL",
      "TIENDA": "BOUTIQUE",
      "MARCAS": "MARQUES",
      "NOSOTROS": "\u00c0 PROPOS",
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
      "La estructura separa marca, modelo, material, color y precio para filtrar productos cargados desde SQL.": "La structure separe marque, modele, materiau, couleur et prix pour filtrer les produits charges depuis SQL.",
      "Personalizacion y venta de volantes premium para proyectos de automocion con identidad propia.": "Personnalisation et vente de volants premium pour des projets automobiles avec identite propre.",
      "Menu": "Menu",
      "Proyecto DAW": "Projet DAW",
      "Interfaz HTML, CSS y JS": "Interface HTML, CSS et JS",
      "Servidor PHP/MySQL": "Serveur PHP/MySQL",
      "CRUD de productos y pedidos": "CRUD de produits et commandes",
      "Vizcaya, Espana": "Biscaye, Espagne",
      "CDP Customs - Proyecto final DAW": "CDP Customs - Projet final DAW",
      "Bootstrap adaptado y profesionalizado": "Bootstrap adapte et professionnalise",
      "Volantes personalizados con acabados en cuero, alcantara, carbono, levas y pantalla RPM.": "Volants personnalises avec finitions cuir, alcantara, carbone, palettes et ecran RPM.",
      "Volantes premium": "Volants premium",
      "Catalogo conectado a PHP/MySQL con filtros normalizados.": "Catalogue connecte a PHP/MySQL avec filtres normalises.",
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
      "Iniciar sesi\u00f3n": "Connexion",
      "Accede a tu cuenta para continuar": "Accedez a votre compte pour continuer",
      "Correo electr\u00f3nico": "E-mail",
      "Contrase\u00f1a": "Mot de passe",
      "\u00bfOlvidaste tu contrase\u00f1a?": "Mot de passe oublie ?",
      "O contin\u00faa con": "Ou continuer avec",
      "\u00bfNo tienes cuenta? Reg\u00edstrate": "Pas de compte ? Inscrivez-vous",
      "Crear cuenta": "Creer un compte",
      "Reg\u00edstrate para guardar tus pedidos y usar la cesta": "Inscrivez-vous pour sauvegarder vos commandes et utiliser le panier",
      "Nombre": "Nom",
      "Tel\u00e9fono": "Telephone",
      "Ya tienes cuenta": "Vous avez deja un compte",
      "Inicia sesi\u00f3n": "Connexion",
      "Sesi\u00f3n iniciada": "Session ouverte",
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
      "Cerrar sesi\u00f3n": "Se deconnecter",
    },
  };

  const keyedTranslations = {
    "home-hero-title": {
      es: 'Disena tu volante<br class="d-none d-xxl-block">a medida',
      en: 'Design your custom<br class="d-none d-xxl-block">steering wheel',
      fr: 'Concevez votre volant<br class="d-none d-xxl-block">sur mesure',
    },
  };

  const reverseTranslations = {};

  Object.entries(translations).forEach(([, dictionary]) => {
    Object.entries(dictionary).forEach(([spanishText, translatedText]) => {
      reverseTranslations[translatedText] = spanishText;
    });
  });

  function normalizeText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  function withOriginalSpacing(original, replacement) {
    const start = original.match(/^\s*/)?.[0] || "";
    const end = original.match(/\s*$/)?.[0] || "";
    return `${start}${replacement}${end}`;
  }

  function normalizeLanguage(value) {
    const text = normalizeText(value).toLowerCase();

    if (["en", "english"].includes(text)) return "en";
    if (text === "fr" || text.includes("fran") || text.includes("france")) return "fr";
    return "es";
  }

  function normalizeRegion(value) {
    const text = normalizeText(value).toLowerCase();

    if (text.includes("portugal")) return "pt";
    if (text.includes("francia") || text.includes("france")) return "fr";
    return "es";
  }

  function getStoredPreference(kind) {
    try {
      return localStorage.getItem(storageKeys[kind]);
    } catch (error) {
      return null;
    }
  }

  function savePreference(kind, value) {
    try {
      localStorage.setItem(storageKeys[kind], value);
    } catch (error) {
      // Keep working visually if storage is blocked.
    }
  }

  function translateString(value, language) {
    const cleanValue = normalizeText(value);
    const spanishValue = reverseTranslations[cleanValue] || cleanValue;

    if (language === "es") {
      return spanishValue;
    }

    return translations[language]?.[spanishValue] || value;
  }

  function translateTextNode(node, language) {
    const original = node.nodeValue || "";
    const trimmed = normalizeText(original);

    if (!trimmed) return;

    const translated = translateString(trimmed, language);

    if (translated !== trimmed) {
      node.nodeValue = withOriginalSpacing(original, translated);
    }
  }

  function translateAttributes(element, language) {
    ["placeholder", "aria-label", "title", "alt"].forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;

      const translated = translateString(value, language);
      if (translated !== value) {
        element.setAttribute(attribute, translated);
      }
    });
  }

  function translateElement(element, language) {
    if (element.closest("script, style, textarea")) return;

    translateAttributes(element, language);

    Array.from(element.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        translateTextNode(child, language);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        translateElement(child, language);
      }
    });
  }

  function applyLanguage(language) {
    const normalizedLanguage = normalizeLanguage(language);
    document.documentElement.lang = normalizedLanguage;
    translateElement(document.body, normalizedLanguage);
    applyKeyTranslations(normalizedLanguage);
    updatePreferenceLabel("language", normalizedLanguage);
  }

  function applyKeyTranslations(language) {
    document.querySelectorAll("[data-cdp-i18n]").forEach((element) => {
      const key = element.dataset.cdpI18n;
      const html = keyedTranslations[key]?.[language] || keyedTranslations[key]?.es;
      if (html) element.innerHTML = html;
    });
  }

  function updatePreferenceLabel(kind, value) {
    const label = kind === "language"
      ? languageLabels[normalizeLanguage(value)]
      : regionLabels[normalizeRegion(value)];

    document.querySelectorAll(`[data-cdp-preference="${kind}"]`).forEach((button) => {
      const node = button.querySelector("[data-cdp-label]");
      if (node) node.textContent = label;
    });
  }

  function updatePreferenceOptions() {
    document.querySelectorAll("[data-cdp-preference-target='region']").forEach((option) => {
      const region = normalizeRegion(option.dataset.cdpOption || option.textContent);
      option.dataset.cdpOption = region;
      option.textContent = regionLabels[region];
    });

    document.querySelectorAll("[data-cdp-preference-target='language']").forEach((option) => {
      const language = normalizeLanguage(option.dataset.cdpOption || option.textContent);
      option.dataset.cdpOption = language;
      option.textContent = languageLabels[language];
    });
  }

  function updatePreference(kind, rawValue) {
    if (kind === "language") {
      const language = normalizeLanguage(rawValue);
      savePreference(kind, language);
      applyLanguage(language);
      return;
    }

    const region = normalizeRegion(rawValue);
    savePreference(kind, region);
    updatePreferenceLabel(kind, region);
  }

  document.addEventListener("DOMContentLoaded", () => {
    updatePreferenceOptions();

    const storedRegion = normalizeRegion(getStoredPreference("region"));
    const storedLanguage = normalizeLanguage(getStoredPreference("language"));

    updatePreferenceLabel("region", storedRegion);
    applyLanguage(storedLanguage);

    document.querySelectorAll("[data-cdp-option]").forEach((option) => {
      option.addEventListener("click", () => {
        updatePreference(option.dataset.cdpPreferenceTarget, option.dataset.cdpOption);
      });
    });

    const observer = new MutationObserver((changes) => {
      const language = normalizeLanguage(getStoredPreference("language"));

      changes.forEach((change) => {
        change.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            translateElement(node, language);
          } else if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node, language);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

  window.CDPHeader = {
    applyLanguage,
    updatePreference,
  };
})();
