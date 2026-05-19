(function () {
  const backend = window.CDPBackend;
  const loginForm = document.querySelector("[data-customer-login]");
  const registerForm = document.querySelector("[data-customer-register]");
  const loginPanel = document.querySelector("[data-login-panel]");
  const registerPanel = document.querySelector("[data-register-panel]");
  const showRegisterButton = document.querySelector("[data-show-register]");
  const showLoginButton = document.querySelector("[data-show-login]");
  const logoutButton = document.querySelector("[data-customer-logout]");
  const guestPanel = document.querySelector("[data-customer-guest]");
  const sessionPanel = document.querySelector("[data-customer-session]");
  const sessionName = document.querySelector("[data-customer-name]");
  const sessionEmail = document.querySelector("[data-customer-email]");
  const adminAccess = document.querySelector("[data-admin-access]");
  const adminAccessCopy = document.querySelector("[data-admin-access-copy]");

  const setStatus = (selector, message, type = "success") => {
    const node = document.querySelector(selector);
    if (!node) return;
    node.hidden = false;
    node.textContent = message;
    node.className = `shop-status is-${type}`;
  };

  const hideStatus = (selector) => {
    const node = document.querySelector(selector);
    if (node) node.hidden = true;
  };

  const showAuthPanel = (panel) => {
    const showRegister = panel === "register";
    if (loginPanel) loginPanel.hidden = showRegister;
    if (registerPanel) registerPanel.hidden = !showRegister;

    const activePanel = showRegister ? registerPanel : loginPanel;
    activePanel?.querySelector("input")?.focus();
  };

  const renderOauthMessage = () => {
    const params = new URLSearchParams(window.location.search);
    const oauth = params.get("oauth");
    if (!oauth) return;

    if (oauth === "ok") {
      setStatus("[data-login-status]", "Sesion iniciada correctamente con proveedor externo.", "success");
      return;
    }

    const messages = {
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

    setStatus("[data-login-status]", messages[oauth] || "No se pudo completar el inicio de sesion externo.", "error");
  };

  const renderSession = async () => {
    const session = await backend.getCustomerSession();
    const logged = Boolean(session.authenticated);

    if (guestPanel) guestPanel.hidden = logged;
    if (sessionPanel) sessionPanel.hidden = !logged;
    if (sessionName) sessionName.textContent = session.user?.nombre || "Cliente";
    if (sessionEmail) sessionEmail.textContent = session.user?.email || "";

    if (adminAccess) {
      adminAccess.hidden = true;
      if (logged && backend.getCustomerAdminAccess) {
        const access = await backend.getCustomerAdminAccess();
        adminAccess.hidden = !access.has_admin_access;
        if (adminAccessCopy) {
          adminAccessCopy.textContent = access.admin_authenticated
            ? "Tu sesion de administrador ya esta activa."
            : "Este usuario tambien tiene permisos de administracion.";
        }
      }
    }

    window.CDPShop?.renderCustomerState?.(session);
    await window.CDPShop?.refreshCartCount?.();
  };

  showRegisterButton?.addEventListener("click", () => {
    showAuthPanel("register");
    history.replaceState(null, "", "#registro");
  });

  showLoginButton?.addEventListener("click", () => {
    showAuthPanel("login");
    history.replaceState(null, "", window.location.pathname);
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(registerForm);
    hideStatus("[data-register-status]");

    try {
      await backend.registerCustomer({
        nombre: data.get("nombre"),
        email: data.get("email"),
        telefono: data.get("telefono"),
        password: data.get("password"),
      });
      registerForm.reset();
      setStatus("[data-register-status]", "Cuenta creada correctamente. Ya puedes anadir productos a la cesta.", "success");
      await renderSession();
    } catch (error) {
      setStatus("[data-register-status]", error.message || "No se pudo crear la cuenta.", "error");
    }
  });

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    hideStatus("[data-login-status]");

    try {
      await backend.loginCustomer(data.get("email"), data.get("password"));
      loginForm.reset();
      setStatus("[data-login-status]", "Sesion iniciada correctamente.", "success");
      await renderSession();
    } catch (error) {
      setStatus("[data-login-status]", error.message || "No se pudo iniciar sesion.", "error");
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await backend.logoutCustomer();
    await renderSession();
  });

  if (window.location.hash === "#registro") {
    showAuthPanel("register");
  }

  renderOauthMessage();
  renderSession();
})();
