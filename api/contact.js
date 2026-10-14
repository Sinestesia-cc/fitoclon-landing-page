const servicios = {
  "micropropagacion-clonal": "Micropropagación Clonal Masiva a Pedido",
  "saneamiento-fitosanitario": "Saneamiento Fitosanitario Meristemático",
  "genoteca-germoplasma": "Genoteca & Banco de Custodia de Germoplasma",
};
const formatos = {
  "ex-vitro": "Ex Vitro Endurecido",
  "in-vitro": "In Vitro Aséptico",
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  let datos;

  try {
    datos = req.body;
  } catch {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const { nombre, correo, detalles } = datos || {};

  if (
    typeof nombre !== "string" ||
    typeof correo !== "string" ||
    typeof detalles !== "string" ||
    !nombre.trim() ||
    !detalles.trim() ||
    nombre.length > 150 ||
    detalles.length > 5000 ||
    correo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) // verifica si hay un @ en cualquier parte del string
  ) {
    return res.status(400).json({
      error: "Revisa el nombre, correo y mensaje",
    });
  }

  const adicionales = {};
  const limites = {
    segundo_nombre: 150,
    empresa: 200,
    servicio: 80,
    formato: 30,
    volumen: 200,
    fecha_objetivo: 10,
  };
  for (const [campo, limite] of Object.entries(limites)) {
    const valor = datos[campo] ?? "";
    if (typeof valor !== "string" || valor.length > limite) {
      return res
        .status(400)
        .json({ error: "Revisa los datos del formulario." });
    }
    adicionales[campo] = valor.trim();
  }
  const {
    segundo_nombre,
    empresa,
    servicio,
    formato,
    volumen,
    fecha_objetivo,
  } = adicionales;
  if (
    !empresa ||
    !Object.hasOwn(servicios, servicio) ||
    !Object.hasOwn(formatos, formato) ||
    (fecha_objetivo &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_objetivo) ||
        Number.isNaN(Date.parse(fecha_objetivo)) ||
        new Date(fecha_objetivo).toISOString().slice(0, 10) !== fecha_objetivo))
  ) {
    return res
      .status(400)
      .json({
        error: "Revisa la empresa, el servicio, el formato y la fecha.",
      });
  }

  const { BREVO_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

  if (!BREVO_API_KEY || !CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
    return res.status(503).json({
      error: "El servicio de correo todavía no está configurado",
    });
  }

  try {
    const respuesta = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: "FitoClon",
          email: CONTACT_FROM_EMAIL,
        },
        subject: "Nueva consulta desde la página",
        textContent: "Notificación del formulario de contacto.",
        // Brevo envía dos mensajes separados, cada uno con su destinatario.
        messageVersions: [
          {
            to: [{ email: CONTACT_TO_EMAIL }],
            replyTo: { email: correo },
            subject: "Nueva consulta desde la página",
            textContent: [
              `Nombre: ${nombre}`,
              `Cargo / Rol en la empresa: ${segundo_nombre || "No indicado"}`,
              `Nombre del Vivero o Razón Social: ${empresa}`,
              `Correo: ${correo}`,
              `Servicio requerido: ${servicios[servicio]}`,
              `Formato de entrega preferido: ${formatos[formato]}`,
              `Volumen estimado requerido: ${volumen || "No indicado"}`,
              `Fecha objetivo de recepción en vivero: ${fecha_objetivo || "No indicada"}`,
              `Detalles del proyecto o estado del material madre: ${detalles}`,
            ].join("\n\n"),
          },
          {
            to: [{ email: correo }],
            replyTo: { email: CONTACT_TO_EMAIL },
            subject: "Recibimos tu formulario correctamente",
            textContent: [
              "Hola,",
              "Recibimos tu formulario correctamente. Gracias por contactarnos.",
              "Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo.",
              "Si necesitas agregar información, puedes responder a este correo.",
            ].join("\n\n"),
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!respuesta.ok) {
      return res.status(502).json({
        error: "No se pudo enviar el correo",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(502).json({
      error: "No pudimos confirmar el envío",
    });
  }
};
