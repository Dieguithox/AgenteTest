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
// Función de formato MXN
// ----------------------------
const currencyFormatterMx = (val) => {
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

      // 1) Token "currency_mxn"
      if (trimmed === "currency_mxn") {
        node[key] = currencyFormatterMx;
        return;
      }

      // 2) Only eval if it is a real JS function string
      if (trimmed.startsWith("function")) {
        try {
          // eslint-disable-next-line no-eval
          node[key] = eval(`(${trimmed})`);
        } catch (err) {
          console.error("Error al convertir formatter:", trimmed, err);
          node[key] = value; // Leave safe fallback
        }
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