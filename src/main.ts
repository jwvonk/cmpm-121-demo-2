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

const commands: (LineCommand | StickerCommand)[] = [];

const redoCommands: (LineCommand | StickerCommand)[] = [];

const bus = new EventTarget();

function notify(name: string) {
  bus.dispatchEvent(new Event(name));
}

class CursorCommand {
  position: { x: number; y: number };
  active: boolean;
  sticker: string | null;
  constructor(x: number, y: number, active: boolean, s: string | null) {
    this.position = { x, y };
    this.active = active;
    this.sticker = s;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    if (!this.sticker) {
      ctx.font = `${parseInt(widthSlide.value) * 5 + 5}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(
        "◦",
        this.position.x,
        this.position.y + 8 + (parseInt(widthSlide.value) - 5) * 1.5
      );
    } else {
      ctx.font = `${parseInt(widthSlide.value) * 10}px monospace`;
      ctx.fillText(this.sticker, this.position.x, this.position.y);
    }
  }
}

const cursorCommand: CursorCommand = new CursorCommand(0, 0, false, null);

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  commands.forEach((cmd) => cmd.display(ctx));
  cursorCommand.draw(ctx);
}

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("tool-moved", redraw);

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

class StickerCommand {
  position: { x: number; y: number };
  sticker: string;
  size: number;
  constructor(x: number, y: number, s: string, size: number) {
    this.position = { x, y };
    this.sticker = s;
    this.size = size;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.size * 10}px monospace`;
    ctx.fillText(this.sticker, this.position.x, this.position.y);
  }
  drag(x: number, y: number) {
    this.position = { x: x, y: y };
  }
}

let currentCommand: LineCommand | StickerCommand | null = null;

canvas.addEventListener("mouseenter", (e) => {
  cursorCommand.position = { x: e.offsetX, y: e.offsetY };
  cursorCommand.active = true;
  notify("tool-moved");
});

canvas.addEventListener("mousedown", (e) => {
  if (cursorCommand.sticker == null) {
    currentCommand = new LineCommand(
      e.offsetX,
      e.offsetY,
      parseInt(widthSlide.value)
    );
  } else {
    currentCommand = new StickerCommand(
      e.offsetX,
      e.offsetY,
      cursorCommand.sticker,
      parseInt(widthSlide.value)
    );
  }
  commands.push(currentCommand);
  redoCommands.splice(0, redoCommands.length);
  notify("drawing-changed");
});

canvas.addEventListener("mousemove", (e) => {
  cursorCommand.position = { x: e.offsetX, y: e.offsetY };
  notify("tool-moved");
  if (e.buttons == 1) {
    currentCommand!.drag(e.offsetX, e.offsetY);
    notify("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
  notify("drawing-changed");
});

canvas.addEventListener("mouseout", () => {
  cursorCommand.active = false;
  notify("tool-moved");
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

const penButton = document.createElement("button");
penButton.innerHTML = "Pen Tool";
app.append(penButton);
penButton.addEventListener("click", () => {
  cursorCommand.sticker = null;
});

const defaultStickers = ["🌴", "🌵", "☀️"];

defaultStickers.forEach((sticker) => {
  const stickerButton = document.createElement("button");
  stickerButton.innerHTML = sticker;
  app.append(stickerButton);
  stickerButton.addEventListener(
    "click",
    () => (cursorCommand.sticker = sticker)
  );
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
label.innerHTML = "Tool Size: ";
app.append(label);
app.append(widthSlide);
