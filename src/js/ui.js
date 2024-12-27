import { setTool } from './drawing.js';
import { undo, redo } from './state.js';

/**
 * Updates the brush preview display based on the current drawing tool, brush size, and color.
 * The preview position follows the mouse cursor, and the style changes depending on the selected tool.
 * @param {MouseEvent} e - The mouse event containing the current cursor position.
 * @param {object} state - The current state object containing the selected tool, brush size, and color.
 * @param {string} state.currentTool - The current selected drawing tool (e.g., "brush", "pencil", "eraser").
 * @param {number} state.brushSize - The current size of the brush or pencil.
 * @param {string} state.color - The current color selected for drawing.
 */
export const updateBrushPreview = (e, state) => {
  const brushPreview = document.getElementById("brushPreview");
  const { currentTool, brushSize, color } = state;
  if (["brush", "pencil", "eraser"].includes(currentTool)) {
    brushPreview.style.display = "block";
    brushPreview.style.left = `${e.clientX}px`;
    brushPreview.style.top = `${e.clientY}px`;
    brushPreview.style.width = `${brushSize}px`;
    brushPreview.style.height = `${brushSize}px`;
    brushPreview.style.backgroundColor =
      currentTool === "eraser" ? "#FFFFFF" : color;
    brushPreview.style.border =
      currentTool === "eraser" ? "1px solid #ccc" : "1px solid #000";
  } else {
    brushPreview.style.display = "none";
  }
};

/**
 * Sets up the event listeners for UI elements to handle tool selection, undo/redo actions,
 * brush size, and color changes.
 * @param {object} state - The current state object containing the drawing settings.
 * @param {string} state.currentTool - The current selected drawing tool (e.g., "brush", "pencil", "eraser").
 * @param {number} state.brushSize - The current size of the brush or pencil.
 * @param {string} state.color - The current color selected for drawing.
 */
export const setupUI = (state) => {
  document.getElementById("pencilTool").onclick = () => setTool("pencil", state);
  document.getElementById("brushTool").onclick = () => setTool("brush", state);
  document.getElementById("eraserTool").onclick = () => setTool("eraser", state);
  document.getElementById("lineTool").onclick = () => setTool("line", state);
  document.getElementById("rectangleTool").onclick = () => setTool("rectangle", state);
  document.getElementById("ellipseTool").onclick = () => setTool("ellipse", state);
  document.getElementById("selectTool").onclick = () => setTool("select", state);

  document.getElementById("undoButton").onclick = () => undo(state);
  document.getElementById("redoButton").onclick = () => redo(state);

  document.getElementById("brushSize").oninput = (e) => {
    state.brushSize = parseInt(e.target.value);
  };

  document.getElementById("colorPicker").onchange = (e) => {
    state.color = e.target.value;
  };
};
