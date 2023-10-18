import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const appTitle = "Sticker Sketchbook";

document.title = appTitle;

const header = document.createElement("h1");
header.innerHTML = appTitle;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;
app.append(canvas);

const ctx = canvas.getContext("2d")!;

const lines: { x: number; y: number }[][] = [];

let currentLine: { x: number; y: number }[] = [];

const cursor = { active: false, x: 0, y: 0 };

const event = new Event("drawing-changed");

canvas.addEventListener("mousedown", (e) => {
  cursor.active = true;
  cursor.x = e.offsetX;
  cursor.y = e.offsetY;
  currentLine = [];
  lines.push(currentLine);
  currentLine.push({ x: cursor.x, y: cursor.y });
  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursor.active) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(event);
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.active = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const line of lines) {
    if (line.length > 1) {
      ctx.beginPath();
      const { x, y } = line[0];
      ctx.moveTo(x, y);
      for (const { x, y } of line) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
});

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(document.createElement("br"));
app.append(clearButton);

clearButton.addEventListener("click", () => {
  lines.splice(0, lines.length);
  canvas.dispatchEvent(event);
});