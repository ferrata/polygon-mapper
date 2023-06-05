export default class CanvasContext {
  context: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  setFillStyle(color: string): CanvasContext {
    this.context.fillStyle = color;

    return this;
  }

  setStrokeStyle(lineWidth: number, color: string): CanvasContext {
    this.context.lineWidth = lineWidth;
    this.context.strokeStyle = color;

    return this;
  }

  clearRect(
    x: number,
    y: number,
    width: number,
    height: number
  ): CanvasContext {
    this.context.clearRect(x, y, width, height);

    return this;
  }

  rect(x: number, y: number, width: number, height: number): CanvasContext {
    this.context.beginPath();
    this.context.moveTo(x, y);
    this.context.lineTo(x + width, y);
    this.context.lineTo(x + width, y + height);
    this.context.lineTo(x, y + height);
    this.context.closePath();
    this.context.stroke();

    return this;
  }

  drawImage(
    image: CanvasImageSource,
    x: number,
    y: number,
    width?: number,
    height?: number
  ): CanvasContext {
    if (width && height) {
      this.context.drawImage(image, x, y, width, height);
    } else {
      this.context.drawImage(image, x, y);
    }

    return this;
  }

  dot(x: number, y: number, radius: number): CanvasContext {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI);
    this.context.fill();

    return this;
  }

  circle(x: number, y: number, radius: number): CanvasContext {
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI);
    this.context.stroke();

    return this;
  }

  polygon(coordinates: { x: number; y: number }[]): CanvasContext {
    this.context.beginPath();
    this.context.moveTo(coordinates[0].x, coordinates[0].y);
    coordinates.slice(1).forEach((coordinate) => {
      this.context.lineTo(coordinate.x, coordinate.y);
    });
    this.context.closePath();
    this.context.stroke();

    return this;
  }

  text(
    x: number,
    y: number,
    text: string,
    options: {
      font?: string;
      fontSize?: number;
      color?: string;
      alpha?: number;
      backgroundColor?: string;
      backgroundAlpha?: number;
    } = {}
  ): CanvasContext {
    this.context.save();
    try {
      let { font, fontSize, color, backgroundColor } = options;
      fontSize = fontSize || 20;
      font = font || "Arial";
      color = color || "black";
      backgroundColor = backgroundColor || "white";

      this.context.font = `${fontSize}px ${font}`;

      // since canvas does not support multiline text, we need to do it manually
      // find the width for the longest line
      const lines = text.split("\n");
      const textWidth = Math.max(
        ...lines.map((line) => this.context.measureText(line).width)
      );
      const textHeight = fontSize * lines.length;

      // make sure the text is not drawn outside the canvas
      let effectiveX = x;
      let effectiveY = y;
      if (x + textWidth > this.context.canvas.width) {
        effectiveX = this.context.canvas.width - textWidth - 10;
      }
      if (y + textHeight > this.context.canvas.height) {
        effectiveY = this.context.canvas.height - textHeight - 10;
      }

      this.context.fillStyle = backgroundColor;
      this.context.globalAlpha = options.backgroundAlpha || 0.5;
      this.context.fillRect(
        effectiveX - 2,
        effectiveY,
        textWidth + 4,
        textHeight + 6
      );

      this.context.fillStyle = color;
      this.context.globalAlpha = options.alpha || 1;
      lines.forEach((line, index) => {
        this.context.fillText(
          line,
          effectiveX,
          effectiveY + fontSize! * (index + 1),
          textWidth
        );
      });
    } finally {
      this.context.restore();
    }

    return this;
  }
}
