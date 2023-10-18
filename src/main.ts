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

const commands: LineCommand[] = [];

const redoCommands: LineCommand[] = [];

let currentCommand: LineCommand | null = null;

let cursorActive = false;

const event = new Event("drawing-changed");

canvas.addEventListener("mousedown", (e) => {
  cursorActive = true;
  currentCommand = new LineCommand(e.offsetX, e.offsetY);
  commands.push(currentCommand);
  redoCommands.splice(0, redoCommands.length);

  canvas.dispatchEvent(event);
});

canvas.addEventListener("mousemove", (e) => {
  if (cursorActive) {
    currentCommand!.drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(event);
  }
});

canvas.addEventListener("mouseup", () => {
  cursorActive = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.display(ctx));
});

class LineCommand {
  points: { x: number; y: number }[];
  constructor(x: number, y: number) {
    this.points = [{ x, y }];
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
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

app.append(document.createElement("br"));
app.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);

clearButton.addEventListener("click", () => {
  commands.splice(0, commands.length);
  canvas.dispatchEvent(event);
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);

undoButton.addEventListener("click", () => {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    canvas.dispatchEvent(event);
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);

redoButton.addEventListener("click", () => {
  if (redoCommands.length > 0) {
    commands.push(redoCommands.pop()!);
    canvas.dispatchEvent(event);
  }
});
