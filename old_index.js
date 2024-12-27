const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const undoStack = [];
const redoStack = [];
const brushPreview = document.getElementById("brushPreview");

let drawing = false;
let currentTool = "pencil";
let startX, startY;
let brushSize = 5;
let color = "#000000";

let isSelecting = false;
let selectionStartX, selectionStartY, selectionWidth, selectionHeight;
let selectedArea = null;
let isDragging = false;
let dragOffsetX, dragOffsetY;

const saveState = () => {
  undoStack.push(canvas.toDataURL());
  redoStack.length = 0;
};

const resetState = () => {
  drawing = false;
  isSelecting = false;
  isDragging = false;
  selectedArea = null;
  selectionStartX = 0;
  selectionStartY = 0;
  selectionWidth = 0;
  selectionHeight = 0;
};

const setTool = (tool) => {
  resetState(); // Clear all states before switching tools
  currentTool = tool;
  updateCursor();
};

const updateCursor = (x, y) => {
  if (currentTool === "select" && selectedArea && x && y) {
    // Check if mouse is inside the selected area
    if (
      x >= selectedArea.x &&
      x <= selectedArea.x + selectedArea.width &&
      y >= selectedArea.y &&
      y <= selectedArea.y + selectedArea.height
    ) {
      canvas.style.cursor = "move";
      return;
    }
  }
  canvas.style.cursor =
    {
      pencil: "url('assets/pencil.png') 0 16, auto",
      brush: "url('assets/brush.png') 0 16, auto",
      eraser: "url('assets/eraser.png') 0 16, auto",
      line: "crosshair",
      rectangle: "crosshair",
      ellipse: "crosshair",
      select: "crosshair",
    }[currentTool] || "default";
};

const drawShape = (x, y, type) => {
  const img = new Image();
  img.src = undoStack[undoStack.length - 1];
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    if (type === "rectangle") {
      ctx.strokeRect(startX, startY, x - startX, y - startY);
    } else if (type === "ellipse") {
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
    } else if (type === "line") {
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };
};

canvas.addEventListener("mousedown", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (currentTool === "select") {
    // Selection logic
    if (
      selectedArea &&
      x >= selectedArea.x &&
      x <= selectedArea.x + selectedArea.width &&
      y >= selectedArea.y &&
      y <= selectedArea.y + selectedArea.height
    ) {
      isDragging = true;
      dragOffsetX = x - selectedArea.x;
      dragOffsetY = y - selectedArea.y;
    } else {
      isSelecting = true;
      selectionStartX = x;
      selectionStartY = y;
      saveState();
    }
  } else {
    // Drawing logic
    startX = x;
    startY = y;
    drawing = true;
    saveState();
  }
});

canvas.addEventListener("mousemove", (e) => {
  const x = e.offsetX;
  const y = e.offsetY;

  if (
    drawing &&
    ["pencil", "brush", "eraser", "line", "rectangle", "ellipse"].includes(
      currentTool
    )
  ) {
    if (currentTool === "pencil" || currentTool === "brush") {
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(x, y);
      ctx.stroke();
      startX = x;
      startY = y;
    } else if (currentTool === "eraser") {
      ctx.clearRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
    } else {
      drawShape(x, y, currentTool);
    }
  }

  if (isSelecting) {
    selectionWidth = x - selectionStartX;
    selectionHeight = y - selectionStartY;
    const img = new Image();
    img.src = undoStack[undoStack.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.setLineDash([6]);
      ctx.strokeStyle = "blue";
      ctx.strokeRect(
        selectionStartX,
        selectionStartY,
        selectionWidth,
        selectionHeight
      );
      ctx.setLineDash([]);
    };
  }

  if (isDragging && selectedArea) {
    const img = new Image();
    img.src = undoStack[undoStack.length - 1];
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ctx.drawImage(img, 0, 0);
      ctx.clearRect(
        selectedArea.x,
        selectedArea.y,
        selectedArea.width,
        selectedArea.height
      );
      selectedArea.x = x - dragOffsetX;
      selectedArea.y = y - dragOffsetY;
      ctx.putImageData(selectedArea.imageData, selectedArea.x, selectedArea.y);
      ctx.setLineDash([6]);
      ctx.strokeStyle = "blue";
      ctx.strokeRect(
        selectedArea.x,
        selectedArea.y,
        selectedArea.width,
        selectedArea.height
      );
      ctx.setLineDash([]);
    }
  }

  updateCursor(x, y);
});

canvas.addEventListener("mouseup", () => {
  if (isSelecting) {
    isSelecting = false;
    selectedArea = {
      x: selectionStartX,
      y: selectionStartY,
      width: selectionWidth,
      height: selectionHeight,
      imageData: ctx.getImageData(
        selectionStartX,
        selectionStartY,
        selectionWidth,
        selectionHeight
      ),
    };
  }
  resizeHandle = null;
  isDragging = false;
  drawing = false;
});

document.getElementById("pencilTool").onclick = () => setTool("pencil");
document.getElementById("brushTool").onclick = () => setTool("brush");
document.getElementById("eraserTool").onclick = () => setTool("eraser");
document.getElementById("lineTool").onclick = () => setTool("line");
document.getElementById("rectangleTool").onclick = () => setTool("rectangle");
document.getElementById("ellipseTool").onclick = () => setTool("ellipse");
document.getElementById("selectTool").onclick = () => setTool("select");

document.getElementById("brushSize").oninput = (e) => {
  brushSize = parseInt(e.target.value);
};

document.getElementById("colorPicker").onchange = (e) => {
  color = e.target.value;
};

document.getElementById("undoButton").onclick = () => {
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

document.getElementById("redoButton").onclick = () => {
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

document.getElementById("clearCanvas").onclick = () => {
  saveState();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

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


// Ensure brush preview updates correctly
const updateBrushPreview = (e) => {
  if (["brush", "pencil", "eraser"].includes(currentTool)) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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

canvas.addEventListener("mousemove", (e) => {
  if (["brush", "pencil", "eraser"].includes(currentTool)) {
    const rect = canvas.getBoundingClientRect();
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
  updateBrushPreview(e);
});

canvas.addEventListener("mouseleave", () => {
  brushPreview.style.display = "none";
});