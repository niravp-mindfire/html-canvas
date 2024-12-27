import { setupUI } from "../src/js/ui"; // Import the setupUI function

describe("Tool switching functionality", () => {
  let state;

  beforeEach(() => {
    // Initialize the state object
    state = {
      currentTool: "brush", // Initial tool is 'brush'
      brushSize: 10,
      color: "#000000",
    };

    // Mock document methods to simulate the DOM
    document.body.innerHTML = `
    <button id="pencilTool">Pencil</button>
    <button id="brushTool">Brush</button>
    <button id="eraserTool">Eraser</button>
    <button id="lineTool">Line</button>
    <button id="rectangleTool">Rectangle</button>
    <button id="ellipseTool">Ellipse</button>
    <button id="selectTool">Select</button>
  `;

    // Setup the UI with mock setTool function
    setupUI(state);
  });

  it("should set the tool to pencil when pencil tool is clicked", () => {
    const pencilButton = document.getElementById("pencilTool");
    pencilButton.click();

    expect(state.currentTool).toBe("pencil");
  });

  it("should set the tool to brush when brush tool is clicked", () => {
    const brushButton = document.getElementById("brushTool");
    brushButton.click();

    expect(state.currentTool).toBe("brush");
  });

  it("should set the tool to eraser when eraser tool is clicked", () => {
    const eraserButton = document.getElementById("eraserTool");
    eraserButton.click();

    expect(state.currentTool).toBe("eraser");
  });
});
