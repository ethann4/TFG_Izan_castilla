(function () {
  const formulario = document.querySelector("form[data-backend-table='pedidos_personalizados']");
  if (!formulario) return;

  const mostrarEstado = (mensaje, tipo = "info") => {
    let estado = formulario.querySelector("[data-form-status]");
    if (!estado) {
      estado = document.createElement("div");
      estado.dataset.formStatus = "";
      estado.className = "form-status";
      formulario.querySelector(".contact-form-grid")?.appendChild(estado);
    }
    estado.className = `form-status is-${tipo}`;
    estado.textContent = mensaje;
  };

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    if (!window.CDPBackend?.isConfigured()) {
      mostrarEstado("Abre la web desde XAMPP para guardar solicitudes en MySQL.", "error");
      return;
    }

    const datos = new FormData(formulario);
    const payload = {
      nombre: datos.get("nombre")?.toString().trim(),
      email: datos.get("email")?.toString().trim(),
      telefono: datos.get("telefono")?.toString().trim() || null,
      modelo_coche: datos.get("modelo")?.toString().trim() || null,
      material: datos.get("material") || null,
      presupuesto: datos.get("presupuesto") || null,
      mensaje: datos.get("mensaje")?.toString().trim(),
      estado: "pendiente",
      origen: "formulario_contacto",
    };

    try {
      mostrarEstado("Enviando solicitud...", "info");
      await window.CDPBackend.createSolicitud(payload);
      formulario.reset();
      mostrarEstado("Solicitud guardada correctamente en MySQL.", "success");
    } catch (error) {
      console.warn("Error guardando solicitud en MySQL.", error);
      mostrarEstado("No se pudo guardar la solicitud. Revisa XAMPP, la tabla solicitudes y la conexion.", "error");
    }
  });
})();
