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

  // Si viene un objeto tipo { y: 123 } (a veces Apex lo manda así)
  if (typeof val === "object" && val !== null) {
    if ("y" in val) {
      val = val.y;
    } else {
      // No sabemos qué es, mejor lo dejamos como está
      return String(val);
    }
  }

  // Si viene como texto (por ejemplo "Cliente X"), NO lo formateamos a moneda
  if (typeof val !== "number") {
    const num = Number(val);
    if (!Number.isFinite(num)) {
      // No es un número válido → devolvemos el texto tal cual
      return String(val);
    }
    val = num;
  }

  // Aquí ya estamos seguros de que es un número finito
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

      // Recurse nested objects
      if (value && typeof value === "object") {
        visit(value);
        return;
      }

      // Only operate on string values
      if (typeof value !== "string") return;

      const trimmed = value.trim();

      // 1) Token "currency_mxn" -> función local
      if (trimmed === "currency_mxn") {
        node[key] = currencyFormatterMx;
        return;
      }

      // 2) Intentar convertir funciones normales "function (val) { ... }"
      if (trimmed.startsWith("function")) {
        try {
          // eslint-disable-next-line no-eval
          node[key] = eval(`(${trimmed})`);
        } catch (err) {
          console.error("Error al convertir formatter (function):", trimmed, err);
          node[key] = value; // dejamos el string, lo manejamos abajo si es formatter inválido
        }
      }

      // 3) Intentar convertir arrow functions "val => val.toFixed(2)"
      else if (trimmed.includes("=>")) {
        try {
          // eslint-disable-next-line no-eval
          node[key] = eval(`(${trimmed})`);
        } catch (err) {
          console.error("Error al convertir formatter (arrow):", trimmed, err);
          node[key] = value;
        }
      }

      // 4) Si sigue siendo string y es un formatter, lo quitamos para que Apex no truene
      if (key === "formatter" && typeof node[key] === "string") {
        console.warn("Eliminando formatter inválido:", node[key]);
        // Puedes elegir entre borrar la key o poner undefined
        // delete node[key];
        node[key] = undefined;
      }
    });
  };

  visit(config);
  return config;
};

export const applyDefaultToolbar = (config) => {
  if (!config || typeof config !== "object") return config;

  if (!config.options) config.options = {};
  if (!config.options.chart) config.options.chart = {};

  // Asegurar toolbar
  if (!config.options.chart.toolbar) {
    config.options.chart.toolbar = {};
  }

  config.options.chart.toolbar.show = true;

  // Asegurar herramientas básicas
  if (!config.options.chart.toolbar.tools) {
    config.options.chart.toolbar.tools = {};
  }

  config.options.chart.toolbar.tools = {
    ...config.options.chart.toolbar.tools,
    download: true,
    selection: true,
    zoom: true,
    zoomin: true,
    zoomout: true,
    pan: true,
    reset: true,
  };

  // Asegurar export (PNG / SVG / CSV)
  if (!config.options.chart.toolbar.export) {
    config.options.chart.toolbar.export = {};
  }

  config.options.chart.toolbar.export = {
    csv: {
      filename: "mtcenter-ventas",
    },
    svg: {
      filename: "mtcenter-ventas",
    },
    png: {
      filename: "mtcenter-ventas",
    },
    ...config.options.chart.toolbar.export,
  };

  return config;
};

// Extrae la primera tabla Markdown simple del texto
export const extractFirstMarkdownTable = (markdown) => {
  if (!markdown || typeof markdown !== "string") return null;

  const regex =
    /(^\s*\|.*\|\s*\n\s*\|[ \-:\|]+\|\s*\n(?:\s*\|.*\|\s*\n?)+)/m;

  const match = markdown.match(regex);
  return match ? match[1].trim() : null;
};

// Convierte una tabla markdown simple a HTML <table>
export const markdownTableToHtml = (markdownTable) => {
  const lines = markdownTable.trim().split("\n");
  if (lines.length < 2) return markdownTable;

  const [headerLine, separatorLine, ...dataLines] = lines;

  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h);

  const rows = dataLines
    .map((line) =>
      line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c)
    )
    .filter((cols) => cols.length);

  let html = "<table><thead><tr>";
  headers.forEach((h) => {
    html += `<th>${h}</th>`;
  });
  html += "</tr></thead><tbody>";

  rows.forEach((cols) => {
    html += "<tr>";
    cols.forEach((c) => {
      html += `<td>${c}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
};

// Copiar HTML al portapapeles
export const copyHtmlToClipboard = async (html) => {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const blob = new Blob([html], { type: "text/html" });
      const data = [new ClipboardItem({ "text/html": blob })];
      await navigator.clipboard.write(data);
    } else {
      // Fallback: copia como texto plano
      await navigator.clipboard.writeText(html);
    }
  } catch (err) {
    console.error("Error al copiar HTML:", err);
  }
};