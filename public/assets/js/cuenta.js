(function () {
  const backend = window.CDPBackend;
  const formularioLogin = document.querySelector("[data-customer-login]");
  const formularioRegistro = document.querySelector("[data-customer-register]");
  const panelLogin = document.querySelector("[data-login-panel]");
  const panelRegistro = document.querySelector("[data-register-panel]");
  const botonMostrarRegistro = document.querySelector("[data-show-register]");
  const botonMostrarLogin = document.querySelector("[data-show-login]");
  const botonSalir = document.querySelector("[data-customer-logout]");
  const panelInvitado = document.querySelector("[data-customer-guest]");
  const panelSesion = document.querySelector("[data-customer-session]");
  const nombreSesion = document.querySelector("[data-customer-name]");
  const emailSesion = document.querySelector("[data-customer-email]");
  const primerNombreCliente = document.querySelector("[data-customer-firstname]");
  const inicialesCliente = document.querySelector("[data-customer-initials]");
  const accesoAdmin = document.querySelector("[data-admin-access]");
  const chipAdmin = document.querySelector("[data-admin-badge]");
  const textoAccesoAdmin = document.querySelector("[data-admin-access-copy]");
  const panelVolantes = document.querySelector("[data-volantes-panel]");
  const listaVolantes = document.querySelector("[data-volantes-list]");
  const vacioVolantes = document.querySelector("[data-volantes-empty]");
  const estadoVolantes = document.querySelector("[data-volantes-status]");
  const infoNombre = document.querySelector("[data-info-name]");
  const infoEmailNodo = document.querySelector("[data-info-email]");
  const infoTelefono = document.querySelector("[data-info-phone]");
  const statVolantes = document.querySelector("[data-stat-volantes]");
  const statPedidos = document.querySelector("[data-stat-pedidos]");
  const statCesta = document.querySelector("[data-stat-cart]");
  const contadorVolantesNav = document.querySelector("[data-volantes-count-nav]");
  const CLAVE_VOLANTE_PENDIENTE = "cdp.volante.pendiente";

  const obtenerIniciales = (nombre) => {
    const partes = (nombre || "").trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return "CL";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  const obtenerPrimerNombre = (nombre) => {
    const partes = (nombre || "").trim().split(/\s+/).filter(Boolean);
    return partes[0] || "Cliente";
  };

  const activarPestanaCuenta = (nombrePestana) => {
    document.querySelectorAll("[data-account-tab]").forEach((boton) => {
      boton.classList.toggle("is-active", boton.dataset.accountTab === nombrePestana);
    });
    document.querySelectorAll("[data-account-panel]").forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.accountPanel === nombrePestana);
    });
  };

  document.querySelectorAll("[data-account-tab]").forEach((boton) => {
    boton.addEventListener("click", () => activarPestanaCuenta(boton.dataset.accountTab));
  });

  let procesandoPendiente = false;

  const mostrarEstado = (selector, mensaje, tipo = "success") => {
    const nodo = document.querySelector(selector);
    if (!nodo) return;
    nodo.hidden = false;
    nodo.textContent = mensaje;
    nodo.className = `shop-status is-${tipo}`;
  };

  const ocultarEstado = (selector) => {
    const nodo = document.querySelector(selector);
    if (nodo) nodo.hidden = true;
  };

  const mostrarEstadoVolantes = (mensaje, tipo = "info") => {
    if (!estadoVolantes) return;
    estadoVolantes.hidden = false;
    estadoVolantes.textContent = mensaje;
    estadoVolantes.className = `shop-status is-${tipo}`;
  };

  const escaparHtml = (valor) => backend?.escapeHtml(valor) || "";

  const formatearPrecio = (valor) => {
    const numero = Number.parseFloat(valor);
    if (!Number.isFinite(numero)) return "";
    return `${new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numero)} EUR`;
  };

  const formatearFecha = (valor) => {
    if (!valor) return "";
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleDateString("es-ES");
  };

  const formatearEstado = (valor) => {
    const estado = (valor || "guardado").toString().replace(/_/g, " ");
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  const leerVolantePendiente = () => {
    try {
      const pendiente = JSON.parse(localStorage.getItem(CLAVE_VOLANTE_PENDIENTE) || "null");
      return pendiente?.diseno ? pendiente : null;
    } catch (error) {
      localStorage.removeItem(CLAVE_VOLANTE_PENDIENTE);
      return null;
    }
  };

  const mostrarPanelAuth = (panel) => {
    const mostrarRegistro = panel === "register";
    if (panelLogin) panelLogin.hidden = mostrarRegistro;
    if (panelRegistro) panelRegistro.hidden = !mostrarRegistro;

    const panelActivo = mostrarRegistro ? panelRegistro : panelLogin;
    panelActivo?.querySelector("input")?.focus();
  };

  const renderizarMensajeOauth = () => {
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get("oauth");
    if (!oauth) return;

    if (oauth === "ok") {
      mostrarEstado("[data-login-status]", "Sesion iniciada correctamente con proveedor externo.", "success");
      return;
    }

    const mensajes = {
      error_config_google: "Faltan las credenciales OAuth de Google en public/config/oauth.php.",
      error_config_apple: "Faltan las credenciales OAuth de Apple en public/config/oauth.php.",
      error_cancelado: "Inicio de sesion cancelado por el proveedor.",
      error_email: "El proveedor no devolvio un email verificado.",
      error_estado: "No se pudo validar la seguridad de la peticion.",
      error_codigo: "El proveedor no devolvio codigo de autorizacion.",
      error_token: "No se pudo validar el token del proveedor.",
      error_conexion: "No se pudo conectar con el proveedor de inicio de sesion.",
      error_firma_apple: "No se pudo firmar la peticion de Apple. Revisa la clave privada.",
      error_proveedor: "Proveedor de inicio de sesion no valido.",
    };

    mostrarEstado("[data-login-status]", mensajes[oauth] || "No se pudo completar el inicio de sesion externo.", "error");
  };

  const renderizarSesion = async () => {
    const sesion = await backend.getCustomerSession();
    const logueado = Boolean(sesion.authenticated);

    if (panelInvitado) panelInvitado.hidden = logueado;
    if (panelSesion) panelSesion.hidden = !logueado;

    const nombre = sesion.user?.nombre || "Cliente";
    const email = sesion.user?.email || "";
    const telefono = sesion.user?.telefono || "";

    if (nombreSesion) nombreSesion.textContent = nombre;
    if (emailSesion) emailSesion.textContent = email;
    if (inicialesCliente) inicialesCliente.textContent = obtenerIniciales(nombre);
    if (primerNombreCliente) primerNombreCliente.textContent = obtenerPrimerNombre(nombre);
    if (infoNombre) infoNombre.textContent = nombre;
    if (infoEmailNodo) infoEmailNodo.textContent = email;
    if (infoTelefono) infoTelefono.textContent = telefono || "No registrado";

    let tieneAccesoAdmin = false;
    if (logueado && backend.getCustomerAdminAccess) {
      const acceso = await backend.getCustomerAdminAccess();
      tieneAccesoAdmin = Boolean(acceso.has_admin_access);
      if (accesoAdmin) accesoAdmin.hidden = !tieneAccesoAdmin;
      if (chipAdmin) chipAdmin.hidden = !tieneAccesoAdmin;
      if (textoAccesoAdmin) {
        textoAccesoAdmin.textContent = acceso.admin_authenticated
          ? "Tu sesion de administrador ya esta activa."
          : "Este usuario tambien tiene permisos de administracion.";
      }
    } else {
      if (accesoAdmin) accesoAdmin.hidden = true;
      if (chipAdmin) chipAdmin.hidden = true;
    }

    if (logueado) {
      await procesarVolantePendiente();
      await renderizarVolantes();
    }

    window.CDPShop?.renderCustomerState?.(sesion);
    await window.CDPShop?.refreshCartCount?.();
    if (statCesta) {
      const nodoContadorCesta = document.querySelector(".cdp-cart-count");
      const numeroCesta = Number.parseInt(nodoContadorCesta?.textContent || "0", 10) || 0;
      statCesta.textContent = numeroCesta;
    }

    if (logueado && window.feather) feather.replace();
  };

  const procesarVolantePendiente = async () => {
    const pendiente = leerVolantePendiente();
    if (!pendiente || procesandoPendiente || !backend?.guardarVolanteGenerado) return;

    procesandoPendiente = true;
    const crearSolicitud = pendiente.modo === "comprar" || Boolean(pendiente.diseno?.crear_solicitud);
    mostrarEstadoVolantes(crearSolicitud ? "Enviando la solicitud guardada..." : "Guardando el diseno pendiente...", "info");

    try {
      await backend.guardarVolanteGenerado({
        ...pendiente.diseno,
        crear_solicitud: crearSolicitud,
      });
      localStorage.removeItem(CLAVE_VOLANTE_PENDIENTE);
      mostrarEstadoVolantes(crearSolicitud
        ? "Solicitud enviada. Ya aparece en tu cuenta y en el panel de administrador."
        : "Diseno guardado en Volantes generados.", "success");
    } catch (error) {
      mostrarEstadoVolantes(error.message || "No se pudo guardar el volante pendiente.", "error");
    } finally {
      procesandoPendiente = false;
    }
  };

  const renderizarVolantes = async () => {
    if (!listaVolantes || !backend?.listarVolantesGenerados) return;

    try {
      const volantes = await backend.listarVolantesGenerados();
      if (vacioVolantes) vacioVolantes.hidden = volantes.length > 0;
      listaVolantes.innerHTML = volantes.map(renderizarVolante).join("");
      if (statVolantes) statVolantes.textContent = volantes.length;
      if (contadorVolantesNav) contadorVolantesNav.textContent = volantes.length;
      if (window.feather) feather.replace();
    } catch (error) {
      if (vacioVolantes) vacioVolantes.hidden = true;
      listaVolantes.innerHTML = "";
      mostrarEstadoVolantes(error.message || "No se pudieron cargar los volantes generados.", "error");
    }
  };

  const renderizarVolante = (volante) => {
    const resumen = volante.resumen_json || {};
    const imagen = volante.boceto_3d || "assets/img/logo_cdp_transparente.png";
    const detalles = [
      resumen.aro ? `Aro ${resumen.aro}` : "",
      resumen.agarres ? `Agarres ${resumen.agarres}` : "",
      resumen.costuras ? `Costuras ${resumen.costuras}` : "",
    ].filter(Boolean);

    return `
      <article class="volante-generado">
        <div class="volante-generado__imagen">
          <img src="${escaparHtml(imagen)}" alt="${escaparHtml(volante.titulo || "Volante generado")}">
        </div>
        <div class="volante-generado__datos">
          <h3>${escaparHtml(volante.titulo || "Volante generado")}</h3>
          <p>${escaparHtml(detalles.join(" · ") || `${volante.marca || ""} ${volante.modelo || ""}`)}</p>
          <div class="volante-generado__meta">
            <span>${escaparHtml(formatearPrecio(volante.precio_total))}</span>
            <span>${escaparHtml(formatearFecha(volante.creado_en))}</span>
            <span class="volante-generado__estado">${escaparHtml(formatearEstado(volante.estado))}</span>
          </div>
        </div>
      </article>
    `;
  };

  botonMostrarRegistro?.addEventListener("click", () => {
    mostrarPanelAuth("register");
    history.replaceState(null, "", "#registro");
  });

  botonMostrarLogin?.addEventListener("click", () => {
    mostrarPanelAuth("login");
    history.replaceState(null, "", window.location.pathname);
  });

  const alternarVisibilidadContrasena = (boton) => {
    const input = boton.closest(".customer-input")?.querySelector("input");
    if (!input) return;
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    boton.setAttribute("aria-label", visible ? "Mostrar contrasena" : "Ocultar contrasena");
    boton.classList.toggle("is-visible", !visible);
    const icono = boton.querySelector("[data-feather]");
    if (icono) {
      icono.setAttribute("data-feather", visible ? "eye" : "eye-off");
      if (window.feather) window.feather.replace();
    }
  };

  document.querySelectorAll("[data-password-toggle]").forEach((boton) => {
    boton.addEventListener("click", () => alternarVisibilidadContrasena(boton));
  });

  const reglasContrasena = {
    length: (valor) => valor.length >= 8,
    upper: (valor) => /[A-Z]/.test(valor),
    number: (valor) => /\d/.test(valor),
  };

  const actualizarReglasContrasena = (valor, raiz = document) => {
    const lista = raiz.querySelector("[data-password-rules]");
    if (!lista) return;
    lista.querySelectorAll("[data-rule]").forEach((nodo) => {
      const regla = nodo.dataset.rule;
      const valido = reglasContrasena[regla] ? reglasContrasena[regla](valor) : false;
      nodo.classList.toggle("is-valid", valido);
      const icono = nodo.querySelector("[data-feather]");
      if (icono) {
        icono.setAttribute("data-feather", valido ? "check-circle" : "circle");
      }
    });
    if (window.feather) window.feather.replace();
  };

  const inputContrasena = document.getElementById("register-password");
  inputContrasena?.addEventListener("input", (evento) =>
    actualizarReglasContrasena(evento.currentTarget.value, formularioRegistro || document));

  // Cambio de contraseña inline
  const formularioPassword = document.querySelector("[data-password-form]");
  const tarjetaPassword = document.querySelector("[data-password-card]");
  const botonAbrirPassword = document.querySelector("[data-password-toggle-card]");
  const botonCancelarPassword = document.querySelector("[data-password-cancel]");
  const inputPasswordNueva = document.getElementById("account-password-nueva");

  const cerrarFormularioPassword = () => {
    if (!formularioPassword) return;
    formularioPassword.hidden = true;
    formularioPassword.reset();
    ocultarEstado("[data-password-status]");
    actualizarReglasContrasena("", formularioPassword);
    if (tarjetaPassword) tarjetaPassword.style.borderRadius = "";
  };

  botonAbrirPassword?.addEventListener("click", () => {
    if (!formularioPassword) return;
    const yaAbierto = !formularioPassword.hidden;
    if (yaAbierto) {
      cerrarFormularioPassword();
      return;
    }
    formularioPassword.hidden = false;
    if (tarjetaPassword) tarjetaPassword.style.borderRadius = "10px 10px 0 0";
    formularioPassword.querySelector("input")?.focus();
    if (window.feather) window.feather.replace();
  });

  botonCancelarPassword?.addEventListener("click", cerrarFormularioPassword);

  inputPasswordNueva?.addEventListener("input", (evento) =>
    actualizarReglasContrasena(evento.currentTarget.value, formularioPassword));

  formularioPassword?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    ocultarEstado("[data-password-status]");

    const datos = new FormData(formularioPassword);
    const actual = (datos.get("password_actual") || "").toString();
    const nueva = (datos.get("password_nueva") || "").toString();
    const confirmar = (datos.get("password_confirm") || "").toString();

    if (!Object.values(reglasContrasena).every((comprobar) => comprobar(nueva))) {
      mostrarEstado("[data-password-status]", "La nueva contrasena debe tener al menos 8 caracteres, una mayuscula y un numero.", "error");
      return;
    }

    if (nueva !== confirmar) {
      mostrarEstado("[data-password-status]", "Las contrasenas no coinciden. Revisa la confirmacion.", "error");
      return;
    }

    if (actual === nueva) {
      mostrarEstado("[data-password-status]", "La nueva contrasena debe ser distinta de la actual.", "error");
      return;
    }

    if (!backend?.changeCustomerPassword) {
      mostrarEstado("[data-password-status]", "Funcion no disponible. Abre la web desde XAMPP.", "error");
      return;
    }

    try {
      await backend.changeCustomerPassword(actual, nueva);
      mostrarEstado("[data-password-status]", "Contrasena actualizada correctamente.", "success");
      setTimeout(cerrarFormularioPassword, 1400);
    } catch (error) {
      mostrarEstado("[data-password-status]", error.message || "No se pudo cambiar la contrasena.", "error");
    }
  });

  const combinarNombre = (nombre, apellidos) => [nombre, apellidos]
    .map((valor) => (valor || "").trim())
    .filter(Boolean)
    .join(" ");

  const combinarTelefono = (prefijo, numero) => {
    const limpio = (numero || "").replace(/\s+/g, "").trim();
    if (!limpio) return "";
    const pref = (prefijo || "").trim();
    return pref ? `${pref} ${limpio}` : limpio;
  };

  formularioRegistro?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioRegistro);
    ocultarEstado("[data-register-status]");

    const contrasena = (datos.get("password") || "").toString();
    const contrasenaConfirm = (datos.get("password_confirm") || "").toString();
    const aceptaTerminos = datos.get("acepta_terminos");

    if (!Object.values(reglasContrasena).every((comprobar) => comprobar(contrasena))) {
      mostrarEstado("[data-register-status]", "La contrasena debe tener al menos 8 caracteres, una mayuscula y un numero.", "error");
      return;
    }

    if (contrasena !== contrasenaConfirm) {
      mostrarEstado("[data-register-status]", "Las contrasenas no coinciden. Revisa la confirmacion.", "error");
      return;
    }

    if (!aceptaTerminos) {
      mostrarEstado("[data-register-status]", "Debes aceptar los Terminos y la Politica de privacidad para crear la cuenta.", "error");
      return;
    }

    const nombre = combinarNombre(datos.get("nombre"), datos.get("apellidos"));
    const telefono = combinarTelefono(datos.get("prefijo"), datos.get("telefono"));

    try {
      await backend.registerCustomer({
        nombre,
        email: datos.get("email"),
        telefono,
        password: contrasena,
      });
      formularioRegistro.reset();
      actualizarReglasContrasena("");
      mostrarEstado("[data-register-status]", "Cuenta creada correctamente. Ya puedes anadir productos a la cesta.", "success");
      await renderizarSesion();
    } catch (error) {
      mostrarEstado("[data-register-status]", error.message || "No se pudo crear la cuenta.", "error");
    }
  });

  formularioLogin?.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const datos = new FormData(formularioLogin);
    ocultarEstado("[data-login-status]");

    try {
      await backend.loginCustomer(datos.get("email"), datos.get("password"));
      formularioLogin.reset();
      mostrarEstado("[data-login-status]", "Sesion iniciada correctamente.", "success");
      await renderizarSesion();
    } catch (error) {
      mostrarEstado("[data-login-status]", error.message || "No se pudo iniciar sesion.", "error");
    }
  });

  botonSalir?.addEventListener("click", async () => {
    await backend.logoutCustomer();
    await renderizarSesion();
  });

  if (window.location.hash === "#registro") {
    mostrarPanelAuth("register");
  }

  renderizarMensajeOauth();
  renderizarSesion();
})();
