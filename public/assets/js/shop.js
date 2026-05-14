(function () {
  const backend = window.CDPBackend;
  const cartCountNodes = () => Array.from(document.querySelectorAll(".cdp-cart-count"));
  const userLinks = () => Array.from(document.querySelectorAll('.cdp-header-icon[aria-label="Usuario"], .cdp-header-icon[data-customer-link]'));

  const renderCartCount = (quantity = 0) => {
    cartCountNodes().forEach((node) => {
      node.textContent = Number(quantity || 0).toString();
    });
  };

  const renderCustomerState = (session) => {
    userLinks().forEach((link) => {
      link.href = "cuenta.html";
      link.dataset.customerLink = "true";
      link.title = session?.authenticated ? `Cliente: ${session.user?.nombre || session.user?.email}` : "Acceder o registrarse";
      link.classList.toggle("is-authenticated", Boolean(session?.authenticated));
    });
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
})();
