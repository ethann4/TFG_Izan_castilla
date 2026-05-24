(function () {
  const backend = window.CDPBackend;
  const nodosContadorCesta = () => Array.from(document.querySelectorAll(".cdp-cart-count"));
  const enlacesUsuario = () => Array.from(document.querySelectorAll('.cdp-header-icon[aria-label="Usuario"], .cdp-header-icon[data-customer-link]'));
  let menuCuentaActivo = null;

  const cerrarMenusCuenta = () => {
    document.querySelectorAll(".cdp-account-menu-shell.is-open").forEach((envoltorio) => {
      envoltorio.classList.remove("is-open");
      const menu = envoltorio.querySelector(".cdp-account-menu");
      if (menu) menu.hidden = true;
    });
    menuCuentaActivo = null;
  };

  const aplicarIconosFeather = () => {
    if (window.feather?.replace) {
      window.feather.replace();
    }
  };

  const asegurarMenuCuenta = (enlace) => {
    let envoltorio = enlace.closest(".cdp-account-menu-shell");

    if (!envoltorio) {
      envoltorio = document.createElement("div");
      envoltorio.className = "cdp-account-menu-shell";
      enlace.parentNode.insertBefore(envoltorio, enlace);
      envoltorio.appendChild(enlace);
    }

    let menu = envoltorio.querySelector(".cdp-account-menu");

    if (!menu) {
      menu = document.createElement("div");
      menu.className = "cdp-account-menu";
      menu.hidden = true;
      menu.innerHTML = `
        <div class="cdp-account-email" data-account-menu-email></div>
        <a class="cdp-account-menu-item" href="cuenta.html">
          <span data-feather="user"></span>
          <span>Mis datos</span>
        </a>
        <a class="cdp-account-menu-item" href="carrito.html">
          <span data-feather="package"></span>
          <span>Mis pedidos</span>
        </a>
        <a class="cdp-account-menu-item" href="Creacionvirtual.html">
          <span data-feather="image"></span>
          <span>Volantes generados</span>
        </a>
        <button class="cdp-account-menu-item cdp-account-menu-item--logout" type="button" data-account-menu-logout>
          <span data-feather="log-out"></span>
          <span>Cerrar sesión</span>
        </button>
      `;

      menu.addEventListener("click", (evento) => {
        evento.stopPropagation();
      });

      menu.querySelector("[data-account-menu-logout]")?.addEventListener("click", async () => {
        await backend?.logoutCustomer?.();
        cerrarMenusCuenta();
        await refrescarContadorCesta();

        if (window.location.pathname.toLowerCase().endsWith("/cuenta.html")) {
          window.location.href = "cuenta.html";
        }
      });

      envoltorio.appendChild(menu);
    }

    return { shell: envoltorio, menu };
  };

  const renderizarContadorCesta = (cantidad = 0) => {
    nodosContadorCesta().forEach((nodo) => {
      nodo.textContent = Number(cantidad || 0).toString();
    });
  };

  const renderizarEstadoCliente = (sesion) => {
    enlacesUsuario().forEach((enlace) => {
      const { shell, menu } = asegurarMenuCuenta(enlace);
      const autenticado = Boolean(sesion?.authenticated);
      const etiquetaUsuario = sesion?.user?.email || sesion?.user?.nombre || "";
      const nodoEmail = menu.querySelector("[data-account-menu-email]");

      enlace.href = "cuenta.html";
      enlace.dataset.customerLink = "true";
      enlace.title = autenticado ? `Cliente: ${sesion.user?.nombre || sesion.user?.email}` : "Acceder o registrarse";
      enlace.classList.toggle("is-authenticated", autenticado);
      shell.classList.toggle("is-authenticated", autenticado);

      if (nodoEmail) {
        nodoEmail.textContent = etiquetaUsuario;
      }

      if (enlace.dataset.accountMenuReady !== "true") {
        enlace.addEventListener("click", (evento) => {
          const envoltorioActual = enlace.closest(".cdp-account-menu-shell");

          if (!envoltorioActual?.classList.contains("is-authenticated")) {
            return;
          }

          evento.preventDefault();
          evento.stopPropagation();

          const menuActual = envoltorioActual.querySelector(".cdp-account-menu");
          const estaAbierto = envoltorioActual.classList.contains("is-open");
          cerrarMenusCuenta();

          if (!estaAbierto && menuActual) {
            envoltorioActual.classList.add("is-open");
            menuActual.hidden = false;
            menuCuentaActivo = menuActual;
          }
        });
        enlace.dataset.accountMenuReady = "true";
      }

      if (!autenticado) {
        menu.hidden = true;
        shell.classList.remove("is-open");
      }
    });

    aplicarIconosFeather();
  };

  const refrescarContadorCesta = async () => {
    if (!backend?.isConfigured?.()) {
      renderizarContadorCesta(0);
      renderizarEstadoCliente({ authenticated: false, user: null });
      return { authenticated: false, user: null };
    }

    const sesion = await backend.getCustomerSession();
    renderizarEstadoCliente(sesion);

    if (!sesion.authenticated) {
      renderizarContadorCesta(0);
      return sesion;
    }

    try {
      const cesta = await backend.getCart();
      renderizarContadorCesta(cesta.total_quantity || 0);
    } catch (error) {
      renderizarContadorCesta(0);
    }

    return sesion;
  };

  window.CDPShop = {
    refreshCartCount: refrescarContadorCesta,
    renderCartCount: renderizarContadorCesta,
    renderCustomerState: renderizarEstadoCliente,
  };

  refrescarContadorCesta();

  document.addEventListener("click", (evento) => {
    if (menuCuentaActivo && !evento.target.closest(".cdp-account-menu-shell")) {
      cerrarMenusCuenta();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarMenusCuenta();
    }
  });
})();
