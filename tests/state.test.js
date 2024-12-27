import { undo, redo } from "../src/js/state"; // Import the undo and redo functions

describe("Undo/Redo functionality", () => {
  let state;

  beforeEach(() => {
    state = {
      canvas: document.createElement("canvas"),
      ctx: null, // Initialize ctx as null
      undoStack: [],
      redoStack: [],
    };
    state.ctx = state.canvas.getContext("2d");
  });

  it("should add image data to undo stack when drawing", () => {
    // Simulate drawing action
    state.undoStack.push(state.canvas.toDataURL());

    // Check if undoStack is updated
    expect(state.undoStack.length).toBe(1);
    expect(state.undoStack[0]).toBe("mocked-image-data-url");
  });

  it("should move the last item from undoStack to redoStack when undo is called", () => {
    state.undoStack.push("image-1");
    state.undoStack.push("image-2");

    undo(state); // Call undo

    expect(state.undoStack.length).toBe(1); // One item should be removed from undoStack
    expect(state.redoStack.length).toBe(1); // Redo stack should have one item
    expect(state.redoStack[0]).toBe("mocked-image-data-url"); // The current canvas data
  });

  it("should move the last item from redoStack to undoStack when redo is called", () => {
    state.undoStack.push("image-1");
    state.undoStack.push("image-2");
    undo(state); // Call undo
    redo(state); // Call redo

    expect(state.redoStack.length).toBe(0); // Redo stack should be empty
    expect(state.undoStack.length).toBe(2); // Undo stack should have the item returned from redo
    expect(state.undoStack[1]).toBe("mocked-image-data-url"); // The current canvas data
  });
});
