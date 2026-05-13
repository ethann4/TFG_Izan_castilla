(function () {
  const form = document.querySelector("form[data-backend-table='pedidos_personalizados']");
  if (!form) return;

  const setStatus = (message, type = "info") => {
    let status = form.querySelector("[data-form-status]");
    if (!status) {
      status = document.createElement("div");
      status.dataset.formStatus = "";
      status.className = "form-status";
      form.querySelector(".contact-form-grid")?.appendChild(status);
    }
    status.className = `form-status is-${type}`;
    status.textContent = message;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!window.CDPBackend?.isConfigured()) {
      setStatus("Abre la web desde XAMPP para guardar solicitudes en MySQL.", "error");
      return;
    }

    const data = new FormData(form);
    const payload = {
      nombre: data.get("nombre")?.toString().trim(),
      email: data.get("email")?.toString().trim(),
      telefono: data.get("telefono")?.toString().trim() || null,
      modelo_coche: data.get("modelo")?.toString().trim() || null,
      material: data.get("material") || null,
      presupuesto: data.get("presupuesto") || null,
      mensaje: data.get("mensaje")?.toString().trim(),
      estado: "pendiente",
      origen: "formulario_contacto",
    };

    try {
      setStatus("Enviando solicitud...", "info");
      await window.CDPBackend.createSolicitud(payload);
      form.reset();
      setStatus("Solicitud guardada correctamente en MySQL.", "success");
    } catch (error) {
      console.warn("Error guardando solicitud en MySQL.", error);
      setStatus("No se pudo guardar la solicitud. Revisa XAMPP, la tabla solicitudes y la conexion.", "error");
    }
  });
})();
