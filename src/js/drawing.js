import { resetState } from "./state.js";

/** 
 * Sets the current drawing tool and resets the state. 
 * @param {string} tool - The tool to set as the current tool (e.g., "pencil", "brush", etc.).
 * @param {Object} state - The state object that holds the current tool and other properties.
 */
export const setTool = (tool, state) => {
  resetState(state);
  state.currentTool = tool;
};

/** 
 * Updates the cursor style based on the selected tool and current position.
 * @param {number} x - The x-coordinate of the cursor.
 * @param {number} y - The y-coordinate of the cursor.
 * @param {Object} state - The state object holding the current tool and canvas.
 */
export const updateCursor = (x, y, state) => {
  const { currentTool } = state;
  if (currentTool === "select" && state.selectedArea && x && y) {
    const { x: areaX, y: areaY, width, height } = state.selectedArea;
    if (x >= areaX && x <= areaX + width && y >= areaY && y <= areaY + height) {
      state.canvas.style.cursor = "move";
      return;
    }
  }
  const cursors = {
    pencil: "url('assets/pencil.png') 0 16, auto",
    brush: "url('assets/brush.png') 0 16, auto",
    eraser: "url('assets/eraser.png') 0 16, auto",
    line: "crosshair",
    rectangle: "crosshair",
    ellipse: "crosshair",
    select: "crosshair",
  };
  state.canvas.style.cursor = cursors[currentTool] || "default";
};

/**
 * Draws a shape based on the current tool selected.
 * Handles different tools like pencil, brush, eraser, rectangle, ellipse, line, and selection.
 * @param {number} x - The x-coordinate where drawing should happen.
 * @param {number} y - The y-coordinate where drawing should happen.
 * @param {object} state - The current state object containing canvas context and tool settings.
 * @param {string} [type] - The type of tool being used for drawing (default is the current tool).
 */
export const drawShape = (x, y, state, type = state.currentTool) => {
  let { ctx, startX, startY, brushSize, color, undoStack } = state;

  // Pencil and Brush tool drawing
  if (type === "pencil" || type === "brush") {
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.lineCap = "round"; // Optional: Make strokes look smoother
    ctx.lineJoin = "round"; // Optional: Make strokes look smoother

    if (state.drawing) {
      ctx.lineTo(x, y); // Draw line to the current position
      ctx.stroke();
      ctx.beginPath(); // Reset the path to avoid continuing from the last point
      ctx.moveTo(x, y); // Start a new path from the current position
    }
    return; // Exit early for pencil or brush tool to avoid reloading image
  }

  // Eraser tool logic
  if (type === "eraser") {
    ctx.globalCompositeOperation = "destination-out"; // Set to erase mode
    ctx.lineWidth = brushSize * 2; // Optional: Increase the eraser size
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (state.drawing) {
      ctx.lineTo(x, y); // Erase line to the current position
      ctx.stroke();
      ctx.beginPath(); // Reset the path
      ctx.moveTo(x, y); // Start new path from the current position
    }
    return; // Exit early for eraser tool to prevent reloading image
  }

  // Handle shape drawing for other tools like rectangle, line, etc.
  const img = new Image();
  img.src = undoStack[undoStack.length - 1];
  img.onload = () => {
    ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    switch (type) {
      case "rectangle":
        ctx.strokeRect(startX, startY, x - startX, y - startY);
        break;
      case "ellipse":
        ctx.beginPath();
        ctx.ellipse(
          (startX + x) / 2,
          (startY + y) / 2,
          Math.abs(x - startX) / 2,
          Math.abs(y - startY) / 2,
          0,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        break;
      case "line":
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
      case "selection":
        ctx.setLineDash([6]);
        ctx.strokeStyle = "blue";
        ctx.strokeRect(
          state.startX,
          state.startY,
          x - state.startX,
          y - state.startY
        );
        ctx.setLineDash([]); // Reset dash pattern after selection
        break;
      case "drag":
        ctx.putImageData(state.selectedArea.imageData, x, y);
        break;
      default:
        break;
    }
  };
};
