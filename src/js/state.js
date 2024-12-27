/** 
 * Saves the current state of the canvas to the undo stack.
 * Clears the redo stack as new actions are being taken.
 * @param {Object} state - The state object containing the canvas and undo/redo stacks.
 */
export const saveState = (state) => {
  state.undoStack.push(state.canvas.toDataURL());
  state.redoStack.length = 0;
};

/** 
 * Resets the current drawing and selection state.
 * @param {Object} state - The state object to reset.
 */
export const resetState = (state) => {
  state.drawing = false;
  state.isSelecting = false;
  state.isDragging = false;
  state.selectedArea = null;
};

/**
 * Undoes the last drawing action by restoring the previous canvas state from the undo stack.
 * The current canvas state is pushed to the redo stack before undoing.
 * @param {object} state - The current state object containing the canvas, context, and undo/redo stacks.
 * @param {HTMLCanvasElement} state.canvas - The canvas element.
 * @param {CanvasRenderingContext2D} state.ctx - The drawing context of the canvas.
 * @param {Array} state.undoStack - The stack holding previous canvas states for undo.
 * @param {Array} state.redoStack - The stack holding undone canvas states for redo.
 */
export const undo = (state) => {
  if (state.undoStack.length > 0) {
    state.redoStack.push(state.canvas.toDataURL());
    const imgData = state.undoStack.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
      state.ctx.drawImage(img, 0, 0);
    };
  }
};

/**
 * Redoes the last undone drawing action by restoring the canvas state from the redo stack.
 * The current canvas state is pushed to the undo stack before redoing.
 * @param {object} state - The current state object containing the canvas, context, and undo/redo stacks.
 * @param {HTMLCanvasElement} state.canvas - The canvas element.
 * @param {CanvasRenderingContext2D} state.ctx - The drawing context of the canvas.
 * @param {Array} state.undoStack - The stack holding previous canvas states for undo.
 * @param {Array} state.redoStack - The stack holding undone canvas states for redo.
 */
export const redo = (state) => {
  if (state.redoStack.length > 0) {
    state.undoStack.push(state.canvas.toDataURL());
    const imgData = state.redoStack.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
      state.ctx.drawImage(img, 0, 0);
    };
  }
};
