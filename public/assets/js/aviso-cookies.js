(function () {
  const claveAlmacenamiento = "cdp.aviso-cookies.v1";

  function leerConsentimiento() {
    try {
      return localStorage.getItem(claveAlmacenamiento);
    } catch (error) {
      return null;
    }
  }

  function guardarConsentimiento(tipo, preferencias) {
    const datos = {
      tipo,
      preferencias,
      guardadoEn: new Date().toISOString(),
    };

    try {
      localStorage.setItem(claveAlmacenamiento, JSON.stringify(datos));
    } catch (error) {
      return;
    }
  }

  function crearAviso() {
    const capa = document.createElement("div");
    capa.className = "cdp-aviso-cookies-capa";
    capa.dataset.cdpAvisoCookies = "";
    capa.innerHTML = `
      <section class="cdp-aviso-cookies-tarjeta" role="dialog" aria-labelledby="cdpAvisoCookiesTitulo" aria-describedby="cdpAvisoCookiesTexto">
        <img class="cdp-aviso-cookies-logo" src="assets/img/logo_cdp_transparente.png" alt="CDP Customs">
        <div class="cdp-aviso-cookies-titulo" id="cdpAvisoCookiesTitulo">&iexcl;Te damos la bienvenida a CDP Customs!</div>
        <div id="cdpAvisoCookiesTexto">
          <p>Usamos cookies para que la tienda funcione correctamente y para mejorar tu experiencia al buscar volantes personalizados.</p>
          <p>Algunas cookies son necesarias para navegar, iniciar sesi&oacute;n y usar el carrito. Otras, incluidas cookies de terceros, nos ayudan con el an&aacute;lisis estad&iacute;stico, la personalizaci&oacute;n de la experiencia y el contenido relacionado con acabados premium, compatibilidad por modelo y pedidos a medida.</p>
          <p>Puedes aceptar estas cookies seleccionando &ldquo;Aceptar todas&rdquo;, rechazarlas seleccionando &ldquo;Rechazar todas&rdquo; o elegir qu&eacute; cookies prefieres haciendo clic en &ldquo;Personalizar configuraci&oacute;n&rdquo;.</p>
          <p>Puedes cambiar tus preferencias desde la configuraci&oacute;n de tu navegador. Lee nuestros <a href="contacto.html">T&eacute;rminos y condiciones generales</a> de uso y nuestra <a href="contacto.html">Pol&iacute;tica de privacidad</a>.</p>
        </div>
        <div class="cdp-aviso-cookies-opciones" id="cdpAvisoCookiesOpciones" hidden>
          <label class="cdp-aviso-cookies-opcion">
            <input type="checkbox" checked disabled>
            <span><strong>Cookies necesarias</strong>Permiten que la tienda, la cuenta y el carrito funcionen correctamente.</span>
          </label>
          <label class="cdp-aviso-cookies-opcion">
            <input type="checkbox" data-opcion-cookies="analitica">
            <span><strong>Anal&iacute;tica</strong>Nos ayudan a entender qu&eacute; productos y configuraciones interesan m&aacute;s.</span>
          </label>
          <label class="cdp-aviso-cookies-opcion">
            <input type="checkbox" data-opcion-cookies="personalizacion">
            <span><strong>Personalizaci&oacute;n</strong>Guardan preferencias de navegaci&oacute;n para adaptar la experiencia.</span>
          </label>
          <label class="cdp-aviso-cookies-opcion">
            <input type="checkbox" data-opcion-cookies="contenidoComercial">
            <span><strong>Contenido comercial</strong>Permiten mostrar contenido relacionado con volantes, acabados y pedidos a medida.</span>
          </label>
          <div class="cdp-aviso-cookies-guardar">
            <button class="cdp-aviso-cookies-boton cdp-aviso-cookies-boton--guardar" type="button" data-accion-cookies="guardar">Guardar selecci&oacute;n</button>
          </div>
        </div>
        <div class="cdp-aviso-cookies-acciones">
          <button class="cdp-aviso-cookies-boton cdp-aviso-cookies-boton--personalizar" type="button" data-accion-cookies="personalizar">Personalizar configuraci&oacute;n</button>
          <button class="cdp-aviso-cookies-boton cdp-aviso-cookies-boton--rechazar" type="button" data-accion-cookies="rechazar">Rechazar todas</button>
          <button class="cdp-aviso-cookies-boton cdp-aviso-cookies-boton--aceptar" type="button" data-accion-cookies="aceptar">Aceptar todas</button>
        </div>
      </section>
    `;

    return capa;
  }

  function cerrarAviso(capa) {
    capa.classList.add("is-hidden");
    window.setTimeout(() => capa.remove(), 220);
  }

  function leerPreferencias(capa) {
    const preferencias = {
      necesarias: true,
      analitica: false,
      personalizacion: false,
      contenidoComercial: false,
    };

    capa.querySelectorAll("[data-opcion-cookies]").forEach((campo) => {
      preferencias[campo.dataset.opcionCookies] = campo.checked;
    });

    return preferencias;
  }

  function enlazarAviso(capa) {
    const opciones = capa.querySelector("#cdpAvisoCookiesOpciones");

    capa.addEventListener("click", (evento) => {
      const accion = evento.target.closest("[data-accion-cookies]")?.dataset.accionCookies;
      if (!accion) return;

      if (accion === "personalizar") {
        opciones.hidden = !opciones.hidden;
        return;
      }

      if (accion === "rechazar") {
        guardarConsentimiento("rechazado", {
          necesarias: true,
          analitica: false,
          personalizacion: false,
          contenidoComercial: false,
        });
        cerrarAviso(capa);
        return;
      }

      if (accion === "aceptar") {
        guardarConsentimiento("aceptado", {
          necesarias: true,
          analitica: true,
          personalizacion: true,
          contenidoComercial: true,
        });
        cerrarAviso(capa);
        return;
      }

      if (accion === "guardar") {
        guardarConsentimiento("personalizado", leerPreferencias(capa));
        cerrarAviso(capa);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (leerConsentimiento() || document.querySelector("[data-cdp-aviso-cookies]")) return;

    const capa = crearAviso();
    document.body.appendChild(capa);
    enlazarAviso(capa);
  });
})();
