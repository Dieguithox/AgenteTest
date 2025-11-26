export const extractBetweenTags = (string, tag) => {
  const startTag = `<${tag}>`;
  const endTag = `</${tag}>`;

  const rawStart = string.indexOf(startTag);
  if (rawStart === -1) return "";

  const startIndex = rawStart + startTag.length;
  const endIndex = string.indexOf(endTag, startIndex);
  if (endIndex === -1) return "";

  return string.slice(startIndex, endIndex);
};

export const removeCharFromStartAndEnd = (str, charToRemove) => {
  // Check if the string starts with the character
  while (str.startsWith(charToRemove)) {
    str = str.substring(1);
  }
  // Check if the string ends with the character
  while (str.endsWith(charToRemove)) {
    str = str.substring(0, str.length - 1);
  }
  return str;
};

// ----------------------------
// Función de formato MXN (segura)
// ----------------------------
const currencyFormatterMx = (val) => {
  // Si viene null/undefined, regresamos cadena vacía
  if (val === null || val === undefined) return "";

  // Si viene un objeto tipo { y: 123 } (algunos formatos de Apex)
  if (typeof val === "object" && val !== null) {
    if ("y" in val) {
      val = val.y;
    } else {
      // No sabemos qué es, lo convertimos a string sin formatear
      return String(val);
    }
  }

  // Si viene como texto, intentamos convertir a número
  if (typeof val !== "number") {
    const num = Number(val);
    if (!Number.isFinite(num)) {
      // No es numérico → lo regresamos tal cual, sin $
      return String(val);
    }
    val = num;
  }

  // Aquí ya es un número válido
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(val);
};

// ----------------------------
// Conversor seguro de formatter
// ----------------------------
export const handleFormatter = (config) => {
  if (!config || typeof config !== "object") return config;

  const visit = (node) => {
    if (!node || typeof node !== "object") return;

    Object.keys(node).forEach((key) => {
      const value = node[key];

      // Recursivo en objetos anidados
      if (value && typeof value === "object") {
        visit(value);
        return;
      }

      // Solo trabajamos con strings
      if (typeof value !== "string") return;

      const trimmed = value.trim();

      // 1) Token "currency_mxn" -> usar formateador local
      if (trimmed === "currency_mxn") {
        node[key] = currencyFormatterMx;
        return;
      }

      // 2) "function (val) { ... }"
      if (trimmed.startsWith("function")) {
        try {
          // eslint-disable-next-line no-eval
          node[key] = eval(`(${trimmed})`);
        } catch (err) {
          console.error("Error al convertir formatter (function):", trimmed, err);
          node[key] = value;
        }
      }

      // 3) Arrow functions "val => val.toFixed(2)"
      else if (trimmed.includes("=>")) {
        try {
          // eslint-disable-next-line no-eval
          node[key] = eval(`(${trimmed})`);
        } catch (err) {
          console.error("Error al convertir formatter (arrow):", trimmed, err);
          node[key] = value;
        }
      }

      // 4) Si la clave es formatter y SIGUE siendo string, la quitamos
      if (key === "formatter" && typeof node[key] === "string") {
        console.warn("Eliminando formatter inválido:", node[key]);
        // Mejor sin formatter que reventar el chart
        delete node[key];
      }
    });
  };

  visit(config);
  return config;
};