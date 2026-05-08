(function () {
  const storageKeys = {
    region: "cdp.region",
    language: "cdp.language",
  };

  function updatePreference(kind, value) {
    document.querySelectorAll(`[data-cdp-preference="${kind}"]`).forEach((button) => {
      const label = button.querySelector("[data-cdp-label]");
      if (label) label.textContent = value;
    });

    try {
      localStorage.setItem(storageKeys[kind], value);
    } catch (error) {
      // Some browsers block storage in private mode; the visual update still works.
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    Object.keys(storageKeys).forEach((kind) => {
      try {
        const storedValue = localStorage.getItem(storageKeys[kind]);
        if (storedValue) updatePreference(kind, storedValue);
      } catch (error) {
        // Keep the static defaults if storage is unavailable.
      }
    });

    document.querySelectorAll("[data-cdp-option]").forEach((option) => {
      option.addEventListener("click", () => {
        updatePreference(option.dataset.cdpPreferenceTarget, option.dataset.cdpOption);
      });
    });
  });
})();
