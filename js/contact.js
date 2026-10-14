const form = document.querySelector("#contact-form");
const button = form.querySelector('button[type="submit"]');
const status = document.querySelector("#contact-integration-note");

button.disabled = false;
status.textContent = "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (button.disabled) return;

  const datos = Object.fromEntries(new FormData(form));
  button.disabled = true;
  status.textContent = "Enviando…";

  try {
    const respuesta = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo enviar el mensaje");
    }

    status.textContent = "Tu solicitud fue enviada correctamente.";
    form.reset();
  } catch (error) {
    status.textContent =
      error instanceof TypeError || error instanceof SyntaxError
        ? "No pudimos confirmar el envío. Intenta nuevamente."
        : error.message;
  } finally {
    // Habilita el botón tanto si funciona como si falla.
    button.disabled = false;
  }
});
