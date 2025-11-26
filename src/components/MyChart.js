import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import MarkdownRenderer from "./MarkdownRenderer.js";

// 🔍 Recorre el objeto y elimina cualquier callback inválido
const sanitizeCallbacks = (obj, path = "root") => {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    const value = obj[key];

    // Si es subobjeto, seguir recorriendo
    if (value && typeof value === "object") {
      sanitizeCallbacks(value, `${path}.${key}`);
      return;
    }

    // Keys típicas de funciones en Apex
    const isCallbackKey =
      key === "formatter" || key === "custom" || key.startsWith("on");

    if (isCallbackKey && typeof value !== "function" && value !== undefined) {
      console.warn(
        "[MyChart] Eliminando callback inválido",
        key,
        "en",
        path,
        "valor:",
        value
      );
      delete obj[key];
    }
  });
};

const MyChart = ({ caption, options, series, type }) => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [chartSeries, setChartSeries] = useState([]);
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    // Animaciones de entrada
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const seriesTimer = setTimeout(() => {
      setChartSeries(Array.isArray(series) ? series : []);
    }, 300);

    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(seriesTimer);
    };
  }, [series]);

  useEffect(() => {
    // Proteger por si options viene undefined/null
    const baseOptions =
      options && typeof options === "object" ? { ...options } : {};

    // Apply additional chart configurations
    const enhancedOptions = { ...baseOptions };

    if (!enhancedOptions.chart) {
      enhancedOptions.chart = {};
    }
    enhancedOptions.chart.zoom = { enabled: false };
    enhancedOptions.chart.animations = { enabled: true };
    if (
      enhancedOptions.chart.type === "bar" &&
      (!enhancedOptions.chart.stacked ||
        enhancedOptions.chart.stacked === false)
    ) {
      enhancedOptions.dataLabels = {
        ...(enhancedOptions.dataLabels || {}),
        enabled: false,
      };
    }
    if (enhancedOptions.title) {
      enhancedOptions.title = {
        ...enhancedOptions.title,
        align: "center",
      };
    }
    if (enhancedOptions.subtitle) {
      enhancedOptions.subtitle = {
        ...enhancedOptions.subtitle,
        align: "center",
      };
    }

    // 🧼 Paso clave: limpiar callbacks inválidos
    sanitizeCallbacks(enhancedOptions);

    setChartOptions(enhancedOptions);
  }, [options]);

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "rgba(248, 255, 252, 0.2)",
          p: 2,
          pb: 0,
          m: 0,
          mb: 0,
          borderRadius: 4,
          overflow: "hidden",
          transition: "opacity 0.8s ease-in, transform 0.8s ease-out",
          boxShadow: "rgba(0, 0, 0, 0.05) 0px 4px 12px",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <ErrorBoundary
          fallback={
            <Alert severity="error">
              No se ha podido generar el gráfico. Comprueba la configuración del gráfico.
            </Alert>
          }
        >
          <Chart
            options={chartOptions}
            series={chartSeries}
            type={type}
            height="420px"
            width="100%"
          />
        </ErrorBoundary>
        <Divider sx={{ mt: 2, mb: 2, opacity: 0.5 }} />
        <Typography component="div" variant="body1">
          <MarkdownRenderer content={caption} />
        </Typography>
      </Box>
    </Box>
  );
};

// Error Boundary component to catch render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default MyChart;