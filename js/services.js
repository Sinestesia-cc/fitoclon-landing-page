/* Servicios: acordeón exclusivo con una opción siempre abierta. */
const servicesSection = document.querySelector(".services-section");

if (servicesSection) {
  const items = [...servicesSection.querySelectorAll(".service-item")];
  const images = [...servicesSection.querySelectorAll(".services-image")];

  function updateImage(serviceId) {
    images.forEach((image) => {
      image.classList.toggle(
        "is-active",
        image.dataset.serviceImage === serviceId
      );
    });
  }

  // Estado inicial predecible: siempre comienza abierto el primer servicio.
  items.forEach((item, index) => {
    item.open = index === 0;
  });
  if (items[0]) updateImage(items[0].dataset.service);

  items.forEach((item) => {
    const summary = item.querySelector("summary");

    // Si ya está abierto, no permitir que un segundo clic lo cierre.
    // También funciona con Enter o Espacio porque activan el summary.
    summary?.addEventListener("click", (event) => {
      if (item.open) event.preventDefault();
    });

    item.addEventListener("toggle", () => {
      if (item.open) {
        // name="fitoclon-servicios" cierra los otros automáticamente.
        updateImage(item.dataset.service);
      } else if (!items.some((other) => other.open)) {
        // Respaldo para cierres que no provienen de un clic.
        item.open = true;
      }
    });
  });
}
