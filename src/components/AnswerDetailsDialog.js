import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { alpha } from "@mui/material/styles";
import OrchestrationRationaleTraceViewer from "./OrchestrationRationaleTraceViewer.js";
import MarkdownRenderer from "./MarkdownRenderer.js";
import {
  extractFirstMarkdownTable,
  markdownTableToHtml,
  copyHtmlToClipboard,
} from "../utils/Utils.js";

const AnswerDetailsDialog = ({ answer, question, handleClose, open }) => {
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState("xxl");

const tableMd =
  answer && typeof answer.text === "string"
    ? extractFirstMarkdownTable(answer.text)
    : null;

const handleCopyTableHtml = async () => {
  if (!tableMd) return;
  const html = markdownTableToHtml(tableMd);
  await copyHtmlToClipboard(html);
};

  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Detalles de la respuesta</DialogTitle>
      <DialogContent>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid size={{ sm: 12, md: 12, xs: 6, md: 6 }}>
            <Box key="question_value" sx={{ pt: 2, pb: 2 }}>
              <Typography
                color="primary"
                variant="subtitle1"
                sx={{ fontWeight: "bold" }}
                gutterBottom
              >
                Pregunta
              </Typography>
              {question}
            </Box>
            <Box key="answer_value">
              <Typography
                color="primary"
                variant="subtitle1"
                sx={{ fontWeight: "bold" }}
                gutterBottom
              >
                Respuesta
              </Typography>

              {/* 🔘 Botón para copiar tabla como HTML (solo si hay tabla) */}
              {tableMd && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 1,
                  }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleCopyTableHtml}
                  >
                    Copiar tabla como HTML
                  </Button>
                </Box>
              )}

              <Typography component="div" variant="body1">
                <MarkdownRenderer content={answer.text} />
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ sm: 12, md: 12, xs: 6, md: 6 }}>
            <Box
              sx={(theme) => ({
                borderRadius: 2,
                p: 2,
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              })}
            >
              <OrchestrationRationaleTraceViewer
                traces={answer.runningTraces}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cerrra</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnswerDetailsDialog;
