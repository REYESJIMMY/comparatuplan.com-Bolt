// Banco de cápsulas de conocimiento — voz de Nexi (mascota guía)
// Cada cápsula se dispara sobre una condición que GameFlow.tsx ya calcula.
// El campo `puente` es la frase que conecta el concepto con la recomendación
// cuando la cápsula vive en la cara trasera de la tarjeta de plan (ver el
// patrón de tarjeta volteable que ya definimos).

export type Capsula = {
  id: string;
  trigger: string;       // condición real en GameFlow.tsx que la dispara
  categoria: "velocidad" | "tecnologia" | "red" | "movilidad" | "confianza";
  icono: string;
  titulo: string;
  texto: string;         // voz de Nexi: observación breve + dato útil, máx 2 líneas
  puente: string;        // frase que conecta el concepto con el producto/plan
  xp: number;
};

export const CAPSULAS: Capsula[] = [
  {
    id: "gamer-latencia",
    trigger: 'avatar.id === "gamer"',
    categoria: "velocidad",
    icono: "🎮",
    titulo: "Latencia vs velocidad",
    texto: "Latencia baja, entendido. Para jugar online el ping importa más que los Mbps — es el tiempo de reacción de tu red.",
    puente: "Por eso priorizamos planes de fibra con baja latencia sobre coaxial para tu perfil.",
    xp: 15,
  },
  {
    id: "nomada-roaming",
    trigger: 'avatar.id === "nomada"',
    categoria: "movilidad",
    icono: "📱",
    titulo: "Roaming vs eSIM",
    texto: "Datos sin límite, va. Cuando viajas, el roaming de tu operador suele salir caro — una eSIM local casi siempre cuesta menos.",
    puente: "Te vamos a mostrar opciones de datos pensadas para moverte, no solo para quedarte en casa.",
    xp: 15,
  },
  {
    id: "familia-ancho-banda",
    trigger: 'avatar.id === "familia"',
    categoria: "red",
    icono: "👨‍👩‍👧‍👦",
    titulo: "Ancho de banda compartido",
    texto: "Varios dispositivos, entendido. El internet se reparte entre todos los que están conectados — 10 dispositivos no es lo mismo que 1.",
    puente: "Por eso el cálculo de tu casa suma cada dispositivo, no solo el más exigente.",
    xp: 15,
  },
  {
    id: "teletrabajo-estabilidad",
    trigger: 'avatar.id === "teletrabajo"',
    categoria: "confianza",
    icono: "💼",
    titulo: "Qué es un SLA",
    texto: "Estabilidad máxima, va. Un SLA es la garantía de tiempo de actividad que da el operador — no todos los planes lo ofrecen igual.",
    puente: "Priorizamos operadores con mejor historial de estabilidad para tu tipo de uso.",
    xp: 15,
  },
  {
    id: "casa-dos-pisos",
    trigger: "floor2 === true",
    categoria: "red",
    icono: "🏢",
    titulo: "Una casa, dos pisos, una señal débil",
    texto: "Dos pisos — ahí el WiFi de un solo router ya no alcanza parejo. La señal pierde fuerza al subir.",
    puente: "Por eso en casas de 2 plantas solemos sugerir un sistema mesh en vez de un router solo.",
    xp: 15,
  },
  {
    id: "red-saturada",
    trigger: "devices.length >= 4",
    categoria: "red",
    icono: "⚡",
    titulo: "Tu red está al límite",
    texto: "Tu casa pide bastante. Nada raro con varios dispositivos exigentes conectados a la vez.",
    puente: "Vale la pena ver un plan con más Mbps de los que crees que necesitas — el margen evita cortes.",
    xp: 15,
  },
  {
    id: "qos-gaming",
    trigger: 'nuevoDispositivo.id === "console" || nuevoDispositivo.id === "pc"',
    categoria: "tecnologia",
    icono: "🕹️",
    titulo: "Qué es el QoS",
    texto: "QoS es la capacidad del router de priorizar tráfico — le dice a tu red \"esto va primero\" cuando estás jugando.",
    puente: "Un router con QoS aprovecha mejor el mismo plan, sin necesidad de pagar más Mbps.",
    xp: 15,
  },
  {
    id: "fibra-vs-coaxial",
    trigger: 'nuevoDispositivo.id === "decoder" || (nuevoDispositivo.id === "tv" && countTV >= 2)',
    categoria: "tecnologia",
    icono: "📡",
    titulo: "Fibra vs coaxial",
    texto: "Streaming en varias pantallas, va. La fibra mantiene la velocidad estable aunque uses varios equipos; el coaxial se satura más rápido.",
    puente: "Por eso para consumo alto de streaming preferimos planes de fibra sobre coaxial.",
    xp: 15,
  },
  {
    id: "margen-20",
    trigger: "resumen.mbpsRecomendado > 300",
    categoria: "confianza",
    icono: "📊",
    titulo: "Por qué el margen del 20%",
    texto: "No te recomendamos justo lo que sumaste — le agregamos un 20% de colchón, porque el consumo real varía hora a hora.",
    puente: "Así el plan aguanta tus picos de uso, no solo el promedio.",
    xp: 15,
  },
  {
    id: "que-trae-paquete",
    trigger: 'planSeleccionado.tipo === "paquete"',
    categoria: "confianza",
    icono: "📦",
    titulo: "Qué trae realmente un paquete",
    texto: "Un paquete junta internet, TV y móvil en una sola factura — casi siempre sale más barato que contratarlos por separado.",
    puente: "Revisa el detalle: no todos los paquetes incluyen los mismos canales o los mismos GB móviles.",
    xp: 15,
  },
];

// Mensajes de Nexi que no son cápsulas (eventos de progreso, no de conocimiento)
export const NEXI_EVENTOS = {
  misionCompletada: "Listo. Sabes más de redes que la mayoría que solo compara precio.",
  invitadoPrimeraCapsula: "Esto que acabas de aprender se pierde si no creas cuenta. Tu decisión.",
};
