(function () {
  const backend = window.CDPBackend;
  const cartCountNodes = () => Array.from(document.querySelectorAll(".cdp-cart-count"));
  const userLinks = () => Array.from(document.querySelectorAll('.cdp-header-icon[aria-label="Usuario"], .cdp-header-icon[data-customer-link]'));
  let activeAccountMenu = null;

  const closeAccountMenus = () => {
    document.querySelectorAll(".cdp-account-menu-shell.is-open").forEach((shell) => {
      shell.classList.remove("is-open");
      const menu = shell.querySelector(".cdp-account-menu");
      if (menu) menu.hidden = true;
    });
    activeAccountMenu = null;
  };

  const applyFeatherIcons = () => {
    if (window.feather?.replace) {
      window.feather.replace();
    }
  };

  const ensureAccountMenu = (link) => {
    let shell = link.closest(".cdp-account-menu-shell");

    if (!shell) {
      shell = document.createElement("div");
      shell.className = "cdp-account-menu-shell";
      link.parentNode.insertBefore(shell, link);
      shell.appendChild(link);
    }

    let menu = shell.querySelector(".cdp-account-menu");

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

      menu.addEventListener("click", (event) => {
        event.stopPropagation();
      });

      menu.querySelector("[data-account-menu-logout]")?.addEventListener("click", async () => {
        await backend?.logoutCustomer?.();
        closeAccountMenus();
        await refreshCartCount();

        if (window.location.pathname.toLowerCase().endsWith("/cuenta.html")) {
          window.location.href = "cuenta.html";
        }
      });

      shell.appendChild(menu);
    }

    return { shell, menu };
  };

  const renderCartCount = (quantity = 0) => {
    cartCountNodes().forEach((node) => {
      node.textContent = Number(quantity || 0).toString();
    });
  };

  const renderCustomerState = (session) => {
    userLinks().forEach((link) => {
      const { shell, menu } = ensureAccountMenu(link);
      const authenticated = Boolean(session?.authenticated);
      const userLabel = session?.user?.email || session?.user?.nombre || "";
      const emailNode = menu.querySelector("[data-account-menu-email]");

      link.href = "cuenta.html";
      link.dataset.customerLink = "true";
      link.title = authenticated ? `Cliente: ${session.user?.nombre || session.user?.email}` : "Acceder o registrarse";
      link.classList.toggle("is-authenticated", authenticated);
      shell.classList.toggle("is-authenticated", authenticated);

      if (emailNode) {
        emailNode.textContent = userLabel;
      }

      if (link.dataset.accountMenuReady !== "true") {
        link.addEventListener("click", (event) => {
          const currentShell = link.closest(".cdp-account-menu-shell");

          if (!currentShell?.classList.contains("is-authenticated")) {
            return;
          }

          event.preventDefault();
          event.stopPropagation();

          const currentMenu = currentShell.querySelector(".cdp-account-menu");
          const isOpen = currentShell.classList.contains("is-open");
          closeAccountMenus();

          if (!isOpen && currentMenu) {
            currentShell.classList.add("is-open");
            currentMenu.hidden = false;
            activeAccountMenu = currentMenu;
          }
        });
        link.dataset.accountMenuReady = "true";
      }

      if (!authenticated) {
        menu.hidden = true;
        shell.classList.remove("is-open");
      }
    });

    applyFeatherIcons();
  };

  const refreshCartCount = async () => {
    if (!backend?.isConfigured?.()) {
      renderCartCount(0);
      renderCustomerState({ authenticated: false, user: null });
      return { authenticated: false, user: null };
    }

    const session = await backend.getCustomerSession();
    renderCustomerState(session);

    if (!session.authenticated) {
      renderCartCount(0);
      return session;
    }

    try {
      const cart = await backend.getCart();
      renderCartCount(cart.total_quantity || 0);
    } catch (error) {
      renderCartCount(0);
    }

    return session;
  };

  window.CDPShop = {
    refreshCartCount,
    renderCartCount,
    renderCustomerState,
  };

  refreshCartCount();

  document.addEventListener("click", (event) => {
    if (activeAccountMenu && !event.target.closest(".cdp-account-menu-shell")) {
      closeAccountMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAccountMenus();
    }
  });
})();
