import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const appTitle = "Sticker Sketchbook";

document.title = appTitle;

const header = document.createElement("h1");
header.innerHTML = appTitle;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;
canvas.style.cursor = "none";
app.append(canvas);

const ctx = canvas.getContext("2d")!;

const commands: LineCommand[] = [];

const redoCommands: LineCommand[] = [];

const bus = new EventTarget();

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

let cursorCommand: CursorCommand | null = null;

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.display(ctx));

  if (cursorCommand) {
    cursorCommand.draw(ctx);
  }
}

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("cursor-changed", redraw);

class LineCommand {
  points: { x: number; y: number }[];
  thickness: number;
  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = this.thickness;
    ctx.beginPath();
    const { x, y } = this.points[0];
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  drag(x: number, y: number) {
    this.points.push({ x, y });
  }
}

class CursorCommand {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.font = `${parseInt(widthSlide.value) * 5 + 5}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(
      "◦",
      this.x,
      this.y + 8 + (parseInt(widthSlide.value) - 5) * 1.5
    );
  }
}
let currentLineCommand: LineCommand | null = null;

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
  notify("cursor-changed");
});

canvas.addEventListener("mousedown", (e) => {
  currentLineCommand = new LineCommand(
    e.offsetX,
    e.offsetY,
    parseInt(widthSlide.value)
  );
  commands.push(currentLineCommand);
  redoCommands.splice(0, redoCommands.length);
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand = new CursorCommand(e.offsetX, e.offsetY);
  notify("cursor-changed");
  if (e.buttons == 1) {
    currentLineCommand!.drag(e.offsetX, e.offsetY);
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
  currentLineCommand = null;
  notify("drawing-changed");
});

canvas.addEventListener("mouseout", () => {
  cursorCommand = null;
  notify("cursor-changed");
});

app.append(document.createElement("br"));
app.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  commands.splice(0, commands.length);
  notify("drawing-changed");
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    notify("drawing-changed");
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    notify("drawing-changed");
  }
});

app.append(document.createElement("br"));
app.append(document.createElement("br"));

const widthSlide = document.createElement("input");
widthSlide.type = "range";
widthSlide.id = "widthSlide";
widthSlide.min = "1";
widthSlide.max = "10";
widthSlide.value = "5";
const label = document.createElement("label");
label.htmlFor = "widthSlide";
label.innerHTML = "Pen Thickness: ";
app.append(label);
app.append(widthSlide);
