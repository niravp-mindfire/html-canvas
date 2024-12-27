import { saveState, resetState, undo, redo } from "./state.js";
import { setTool, updateCursor, drawShape } from "./drawing.js";
import { updateBrushPreview, setupUI } from "./ui.js";

const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");

// State variables
export const state = {
  canvas,
  ctx,
  undoStack: [],
  redoStack: [],
  currentTool: "pencil",
  brushSize: 5,
  color: "#000000",
  drawing: false,
  startX: 0,
  startY: 0,
  isSelecting: false,
  selectedArea: null,
  isDragging: false,
  dragOffsetX: 0,
  dragOffsetY: 0,
};

/**
 * Initializes the UI elements.
 * @param {object} state - The current state object.
 */
// Initialize UI
setupUI(state);

/**
 * Handles the mousedown event on the canvas.
 * This event starts the drawing process or starts a selection process.
 * @param {MouseEvent} e - The mouse event triggered on the canvas.
 */
// Canvas event listeners
canvas.addEventListener("mousedown", (e) => {
  const { offsetX: x, offsetY: y } = e;
  if (state.currentTool === "select") {
    if (
      state.selectedArea &&
      x >= state.selectedArea.x &&
      x <= state.selectedArea.x + state.selectedArea.width &&
      y >= state.selectedArea.y &&
      y <= state.selectedArea.y + state.selectedArea.height
    ) {
      state.isDragging = true;
      state.dragOffsetX = x - state.selectedArea.x;
      state.dragOffsetY = y - state.selectedArea.y;
    } else {
      state.isSelecting = true;
      state.startX = x;
      state.startY = y;
      saveState(state);
    }
  } else {
    state.startX = x;
    state.startY = y;
    state.drawing = true;
    saveState(state);
  }
});

/**
 * Handles the mousemove event on the canvas.
 * This event updates the drawing or selection process based on the current tool.
 * @param {MouseEvent} e - The mouse event triggered on the canvas.
 */
canvas.addEventListener("mousemove", (e) => {
  const { offsetX: x, offsetY: y } = e;
  if (state.drawing) {
    drawShape(x, y, state);
  }
  if (state.isSelecting) {
    drawShape(x, y, state, "selection");
  }
  if (state.isDragging) {
    drawShape(x, y, state, "drag");
  }
  updateCursor(x, y, state);
  updateBrushPreview(e, state);
});

/**
 * Handles the mouseup event on the canvas.
 * This event stops the drawing, selecting, or dragging process.
 */
canvas.addEventListener("mouseup", () => {
  if (state.isSelecting) {
    state.isSelecting = false;
    state.selectedArea = {
      x: state.startX,
      y: state.startY,
      width: state.selectionWidth,
      height: state.selectionHeight,
      imageData: state.ctx.getImageData(
        state.startX,
        state.startY,
        state.selectionWidth,
        state.selectionHeight
      ),
    };
  }
  state.drawing = false; // Stop drawing when the mouse is released
  state.isDragging = false; // Stop dragging if any
  state.ctx.beginPath(); // Reset the path to prevent continued drawing
  state.ctx.globalCompositeOperation = "source-over"; // Reset to default drawing mode
});

/**
 * Event listener for image upload.
 * Validates the uploaded image and displays it on the canvas.
 * @param {Event} e - The file input change event.
 */
// Add the event listener for image upload with validation
document.getElementById("imageLoader").addEventListener("change", (e) => {
  const file = e.target.files[0];

  // Validate if the uploaded file is an image
  const isValidImage = (file) => file && file.type.startsWith("image/");

  if (file && isValidImage(file)) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      img.onload = function () {
        // Clear the canvas before drawing the image (optional)
        state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
        // Draw the image to the canvas
        state.ctx.drawImage(img, 0, 0, state.canvas.width, state.canvas.height);
      };
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please upload a valid image file.");
  }
});
