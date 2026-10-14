/* Aparición vertical suave: una vez, sin animar el footer. */
(() => {
  if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const selectors = [
    ".hero-content > *",
    ".history-heading",
    ".history-image",
    ".history-description",
    ".history-manifesto",
    ".purpose-title",
    ".purpose-card:first-child",
    ".purpose-card:last-child",
    ".together-title",
    ".together-content",
    ".services-heading",
    ".services-intro",
    ".services-image",
    ".service-item",
    ".formats-title",
    ".formats-carousel",
    ".faq-label",
    ".faq-title",
    ".faq-section details",
    ".contact-intro",
    ".contact-form-panel",
  ];
  const targets = [...new Set(selectors.flatMap(selector =>
    [...document.querySelectorAll(selector)]
  ))];
  if (!targets.length) return;

  let observer;
  try {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -32px 0px" });

    targets.forEach(element => observer.observe(element));
    targets.forEach(element => element.classList.add("scroll-reveal"));
    document.documentElement.classList.add("motion-ready");
  } catch (error) {
    observer?.disconnect();
    document.documentElement.classList.remove("motion-ready");
    console.warn("Animación de entrada no disponible", error);
  }
})();
