(function () {
  const backend = window.CDPBackend;
  const loginForm = document.querySelector("[data-customer-login]");
  const registerForm = document.querySelector("[data-customer-register]");
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
            ? "Tu sesion admin ya esta activa."
            : "Este usuario tambien tiene permisos de administracion.";
        }
      }
    }

    window.CDPShop?.renderCustomerState?.(session);
    await window.CDPShop?.refreshCartCount?.();
  };

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

  renderSession();
})();
