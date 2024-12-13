const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const undoStack = [];
const redoStack = [];
const popup = document.getElementById("popup");

let drawing = false;
let currentTool = "pencil";
let startX, startY;
let brushSize = 1;
let color = "#000000";

// Tool Handlers
const setTool = (tool) => {
  currentTool = tool;
  if(tool == "brush") {
    brushSize = 5
  } else if(tool == "pencil") {
    brushSize = 1
  }
  updateCursor();
};

// Update the cursor based on the selected tool
const updateCursor = () => {
  const canvasContainer = document.getElementById("canvas-container");
  switch (currentTool) {
    case "pencil":
    case "brush":
      canvasContainer.style.cursor = "crosshair";
      break;
    case "eraser":
      canvasContainer.style.cursor = "cell";
      break;
    case "line":
    case "rectangle":
    case "ellipse":
      canvasContainer.style.cursor = "default";
      break;
    default:
      canvasContainer.style.cursor = "crosshair";
  }
};

document.getElementById("pencilTool").onclick = () => setTool("pencil");
document.getElementById("brushTool").onclick = () => setTool("brush");
document.getElementById("eraserTool").onclick = () => setTool("eraser");
document.getElementById("lineTool").onclick = () => setTool("line");
document.getElementById("rectangleTool").onclick = () => setTool("rectangle");
document.getElementById("ellipseTool").onclick = () => setTool("ellipse");

document.getElementById("brushSize").onchange = (e) => {
  brushSize = parseInt(e.target.value);
};

document.getElementById("colorPicker").onchange = (e) => {
  color = e.target.value;
};

const saveState = () => {
  undoStack.push(canvas.toDataURL());
  redoStack.length = 0;
};

const undo = () => {
  if (undoStack.length > 0) {
    redoStack.push(canvas.toDataURL());
    const imgData = undoStack.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
};

const redo = () => {
  if (redoStack.length > 0) {
    undoStack.push(canvas.toDataURL());
    const imgData = redoStack.pop();
    const img = new Image();
    img.src = imgData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }
};

document.getElementById("undoButton").onclick = undo;
document.getElementById("redoButton").onclick = redo;

const clearCanvas = () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

document.getElementById("clearCanvas").onclick = clearCanvas;

document.getElementById("saveImage").onclick = () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
};

document.getElementById("imageLoader").onchange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
      img.onload = () => {
        saveState();
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    };
    reader.readAsDataURL(file);
  }
};

canvas.onmousedown = (e) => {
  drawing = true;
  startX = e.offsetX;
  startY = e.offsetY;
  if (["line", "rectangle", "ellipse"].includes(currentTool)) {
    saveState();
  }
};

canvas.onmousemove = (e) => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  if (["pencil", "brush", "eraser"].includes(currentTool)) {
    ctx.strokeStyle = currentTool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    startX = x;
    startY = y;
  }
};

canvas.onmouseup = (e) => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  drawing = false;
  if (["line", "rectangle", "ellipse"].includes(currentTool)) {
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    if (currentTool === "line") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === "rectangle") {
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (currentTool === "ellipse") {
      const radiusX = Math.abs(x - startX) / 2;
      const radiusY = Math.abs(y - startY) / 2;
      const centerX = (x + startX) / 2;
      const centerY = (y + startY) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
};

canvas.onmouseleave = () => {
  drawing = false;
};
