let canvas = document.querySelector("canvas");
let pencilColor = document.querySelectorAll(".pencil-color");
let pencilWidthElem = document.querySelector(".pencil-width");
let eraserWidthElem = document.querySelector(".eraser-width");
let download = document.querySelector(".download");
let undo = document.querySelector(".undo");
let redo = document.querySelector(".redo");

let undoRedoTracker = []; // DATA

let track = 0; // to get track of action - undo or redo

let penColor = "red";
let eraserColor = "white";
let penWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mousedown = false;

const tool = canvas.getContext("2d"); //Basically this is api throungh which we can access different functions

tool.strokeStyle = penColor;
tool.lineWidth = penWidth;

canvas.addEventListener("mousedown", (e) => {
  mousedown = true;
  let data = {
    x: e.clientX,
    y: e.clientY,
  };
  socket.emit("beginPath", data);
});

canvas.addEventListener("mousemove", (e) => {
  if (mousedown) {
    let data = {
      color: eraserFlag ? eraserColor : penColor,
      width: eraserFlag ? eraserWidth : penWidth,
      x: e.clientX,
      y: e.clientY,
    };
    socket.emit("drawStroke", data);
  }
});

canvas.addEventListener("mouseup", (e) => {
  mousedown = false;
  let url = canvas.toDataURL();
  undoRedoTracker.push(url);

  track = undoRedoTracker.length - 1;
});

redo.addEventListener("click", (e) => {
  if (track < undoRedoTracker.length - 1) {
    track++;
  }
  let data = {
    trackValue: track,
    undoRedoTracker,
  };
  socket.emit("redoUndo", data);
});

undo.addEventListener("click", (e) => {
  if (track > 0) {
    track--;
  }

  let trackObj = {
    trackValue: track,
    undoRedoTracker,
  };
  undoRedoCanvas(trackObj);
});

function undoRedoCanvas(trackObj) {
  let track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker;

  let url = undoRedoTracker[track];

  let img = new Image();
  img.src = url;

  img.onload = (e) => {
    tool.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

function beginPath(strokeObj) {
  tool.beginPath();
  tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
  tool.strokeStyle = strokeObj.color;
  tool.lineWidth = strokeObj.width;
  tool.lineTo(strokeObj.x, strokeObj.y);
  tool.stroke();
}

pencilColor.forEach((colorElem) => {
  colorElem.addEventListener("click", (e) => {
    let color = colorElem.classList[0];
    penColor = color;
    tool.strokeStyle = penColor;
  });
});

pencilWidthElem.addEventListener("change", (e) => {
  penWidth = pencilWidthElem.value;
  tool.lineWidth = penWidth;
});

eraserWidthElem.addEventListener("change", (e) => {
  eraserWidth = eraserWidthElem.value;
  tool.lineWidth = eraserWidth;
});

eraser.addEventListener("click", (e) => {
  if (eraserFlag) {
    tool.strokeStyle = eraserColor;
    tool.lineWidth = eraserWidth;
  } else {
    tool.strokeStyle = penColor;
    tool.lineWidth = penWidth;
  }
});

download.addEventListener("click", (e) => {
  let url = canvas.toDataURL();

  let a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";

  a.click();
});

socket.on("beginPath", (data) => {
  // data -> data from server
  beginPath(data);
});
socket.on("drawStroke", (data) => {
  drawStroke(data);
});
socket.on("redoUndo", (data) => {
  undoRedoCanvas(data);
});
