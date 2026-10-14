/* Carrusel de formatos. Las tarjetas no activas permanecen visibles parcialmente,
   pero su contenido no se expone al foco ni al lector de pantalla. */
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".formats-carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".formats-track");
  const cards = [...carousel.querySelectorAll(".format-card")];
  const prev = carousel.querySelector(".formats-nav--prev");
  const next = carousel.querySelector(".formats-nav--next");
  const status = carousel.querySelector("#formats-status");
  if (!track || cards.length < 2 || !prev || !next) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let touchStartX = null;

  function update(index, announce = true) {
    activeIndex = Math.max(0, Math.min(index, cards.length - 1));
    const selected = cards[activeIndex];
    const peek = parseFloat(getComputedStyle(carousel).getPropertyValue("--format-peek")) || 110;
    const offset = activeIndex === 0 ? 0 : selected.offsetLeft - peek;

    track.style.transitionDuration = reducedMotion.matches ? "0ms" : "550ms";
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;

    cards.forEach((card, i) => {
      const isActive = i === activeIndex;
      card.classList.toggle("is-active", isActive);
      card.toggleAttribute("inert", !isActive);
      if (isActive) card.removeAttribute("aria-hidden");
      else card.setAttribute("aria-hidden", "true");
    });
    prev.hidden = activeIndex === 0;
    next.hidden = activeIndex === cards.length - 1;
    carousel.dataset.active = String(activeIndex);
    if (announce && status) {
      const title = selected.querySelector(".format-card__title")?.textContent.trim() || "";
      status.textContent = `Formato ${activeIndex + 1} de ${cards.length}: ${title}`;
    }
  }

  prev.addEventListener("click", () => update(activeIndex - 1));
  next.addEventListener("click", () => update(activeIndex + 1));
  carousel.addEventListener("keydown", (event) => {
    if (!event.target.closest(".formats-nav")) return;
    if (event.key === "ArrowRight") { event.preventDefault(); update(activeIndex + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); update(activeIndex - 1); }
  });
  carousel.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0]?.screenX ?? null;
  }, { passive: true });
  carousel.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const delta = touchStartX - event.changedTouches[0].screenX;
    touchStartX = null;
    if (Math.abs(delta) >= 50) update(activeIndex + (delta > 0 ? 1 : -1));
  }, { passive: true });
  window.addEventListener("resize", () => update(activeIndex, false));
  update(0, false);
});
