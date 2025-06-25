const { Entity } = require("./entity/entity");
const { Color } = require("./entity/color");
const { Player } = require("./entity/player");
const hljs = require("highlight.js");

class JungleMap {
  constructor() {
    this.entities = [];
    this.width = 0;
    this.height = 0;
    this.cellWidth = 14; // Horizontal spacing between characters
    this.cellHeight = 30; // Vertical spacing between lines
    this.fontSize = 24; // Font size for rendering characters
    this.paddingLeft = 20; // Left padding
    this.paddingTop = 20; // Top padding
    this.player = null; // Player entity
    this.gameStarted = false; // Track if game has started
  }

  loadFromContent(content, filename = "") {
    this.entities = [];

    if (!content) {
      this.width = 0;
      this.height = 0;
      return;
    }

    // Try to detect language from filename or content
    let language = this.detectLanguage(filename, content);

    // Use highlight.js to get syntax highlighting
    let highlightedResult;
    try {
      if (language) {
        highlightedResult = hljs.highlight(content, { language });
      } else {
        highlightedResult = hljs.highlightAuto(content);
      }
    } catch (e) {
      // Fallback to no highlighting
      highlightedResult = { value: content };
    }

    // Parse the highlighted HTML to extract token information
    this.parseHighlightedContent(highlightedResult.value);
  }

  detectLanguage(filename, content) {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      html: "html",
      css: "css",
      scss: "scss",
      json: "json",
      xml: "xml",
      md: "markdown",
      sql: "sql",
      sh: "bash",
      yml: "yaml",
      yaml: "yaml",
    };

    return languageMap[ext] || null;
  }

  parseHighlightedContent(highlightedHTML) {
    // Split content into lines
    const lines = highlightedHTML.split("\n");
    this.height = lines.length;
    this.width = Math.max(...lines.map((line) => this.stripHTML(line).length));

    // Convert each character to an entity with highlighting
    lines.forEach((line, y) => {
      this.parseLineTokens(line, y);
    });
  }

  parseLineTokens(line, y) {
    let x = 0;
    let currentPos = 0;

    // Remove HTML tags and track their positions for styling
    const tokens = this.extractTokens(line);

    tokens.forEach((token) => {
      for (let i = 0; i < token.text.length; i++) {
        const char = token.text[i];

        // Only create entities for visible characters
        if (char !== " " && char !== "\t") {
          const entity = this.createEntityFromChar(char, x, y);
          entity.tokenType = token.className;
          entity._color = this.getColorForToken(token.className, char);
          this.entities.push(entity);
        }
        x++;
      }
    });
  }

  extractTokens(htmlLine) {
    const tokens = [];
    const regex = /<span class="([^"]*)">(.*?)<\/span>|([^<]+)/g;
    let match;

    while ((match = regex.exec(htmlLine)) !== null) {
      if (match[1] && match[2]) {
        // Highlighted token
        tokens.push({
          className: match[1],
          text: this.stripHTML(match[2]),
        });
      } else if (match[3]) {
        // Plain text
        tokens.push({
          className: "",
          text: match[3],
        });
      }
    }

    // If no tokens found, treat entire line as plain text
    if (tokens.length === 0) {
      tokens.push({
        className: "",
        text: this.stripHTML(htmlLine),
      });
    }

    return tokens;
  }

  stripHTML(html) {
    return html.replace(/<[^>]*>/g, "");
  }

  createEntityFromChar(char, x, y) {
    const position = {
      x: x * this.cellWidth + this.paddingLeft,
      y: y * this.cellHeight + this.paddingTop,
    };
    const entity = new Entity(position);

    // Assign colors based on character type
    entity.character = char;
    // Color will be set later in parseLineTokens with token information

    return entity;
  }

  getColorForToken(tokenClass, char) {
    // Handle special characters first
    if (char === " ") {
      return new Color(200, 200, 200, 50);
    } else if (char === "\t") {
      return new Color(150, 150, 150, 100);
    }

    // Map highlight.js token classes to colors (VS Code Dark theme)
    if (tokenClass.includes("keyword")) {
      return new Color(86, 156, 214, 255); // Blue
    } else if (tokenClass.includes("string")) {
      return new Color(206, 145, 120, 255); // Orange
    } else if (tokenClass.includes("number")) {
      return new Color(181, 206, 168, 255); // Light green
    } else if (tokenClass.includes("comment")) {
      return new Color(106, 153, 85, 255); // Green
    } else if (tokenClass.includes("function")) {
      return new Color(220, 220, 170, 255); // Light yellow
    } else if (tokenClass.includes("variable") || tokenClass.includes("name")) {
      return new Color(156, 220, 254, 255); // Light blue
    } else if (tokenClass.includes("type") || tokenClass.includes("class")) {
      return new Color(78, 201, 176, 255); // Teal
    } else if (tokenClass.includes("operator")) {
      return new Color(220, 220, 220, 255); // White
    } else if (tokenClass.includes("punctuation")) {
      return new Color(220, 220, 220, 255); // White
    } else if (tokenClass.includes("tag")) {
      return new Color(86, 156, 214, 255); // Blue
    } else if (tokenClass.includes("attribute")) {
      return new Color(156, 220, 254, 255); // Light blue
    } else {
      // Default color for unclassified tokens
      return new Color(220, 220, 220, 255); // White
    }
  }

  render(canvas) {
    if (!canvas || !canvas.context) {
      return;
    }

    // Store canvas reference for pixel collision detection
    this.lastRenderedCanvas = canvas;

    const ctx = canvas.context;

    // Set background color similar to VS Code dark theme
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, canvas.ele.width, canvas.ele.height);

    // Set font properties for character rendering
    ctx.font = `${this.fontSize}px 'Consolas', 'Monaco', 'Courier New', monospace`;
    ctx.textBaseline = "top";

    // Render each entity as a character (spaces and tabs are not entities anymore)
    this.entities.forEach((entity) => {
      if (entity._color.alpha > 0) {
        ctx.fillStyle = `rgba(${entity._color.red}, ${entity._color.green}, ${
          entity._color.blue
        }, ${entity._color.alpha / 255})`;

        // Draw the character (no special handling needed since spaces/tabs aren't entities)
        ctx.fillText(entity.character, entity.position.x, entity.position.y);
      }
    });

    // Render player if game has started
    if (this.gameStarted && this.player) {
      console.log("Rendering player at:", this.player.position);
      this.player.render(ctx);
    }
  }

  getMapDimensions() {
    return {
      width: this.width * this.cellWidth + this.paddingLeft * 2,
      height: this.height * this.cellHeight + this.paddingTop * 2,
    };
  }

  setCellSize(width, height) {
    this.cellWidth = Math.max(1, width || this.cellWidth);
    this.cellHeight = Math.max(1, height || this.cellHeight);
    // Recalculate positions for existing entities
    this.entities.forEach((entity) => {
      const x = Math.floor(
        (entity.position.x - this.paddingLeft) / this.cellWidth
      );
      const y = Math.floor(
        (entity.position.y - this.paddingTop) / this.cellHeight
      );
      entity.position.x = x * this.cellWidth + this.paddingLeft;
      entity.position.y = y * this.cellHeight + this.paddingTop;
    });
  }

  setPadding(left, top) {
    this.paddingLeft = Math.max(0, left || this.paddingLeft);
    this.paddingTop = Math.max(0, top || this.paddingTop);
    // Recalculate positions for existing entities
    this.entities.forEach((entity) => {
      const x = Math.floor(
        (entity.position.x - this.paddingLeft) / this.cellWidth
      );
      const y = Math.floor(
        (entity.position.y - this.paddingTop) / this.cellHeight
      );
      entity.position.x = x * this.cellWidth + this.paddingLeft;
      entity.position.y = y * this.cellHeight + this.paddingTop;
    });
  }

  setFontSize(size) {
    this.fontSize = Math.max(1, size);
  }

  startGame() {
    console.log("startGame() called");
    this.gameStarted = true;

    // Find a random position without collision
    const spawnPosition = this.findRandomSpawnPosition();
    this.player = new Player(spawnPosition);

    console.log("Player created at random position:", this.player);
    console.log("Game started:", this.gameStarted);
  }

  findRandomSpawnPosition() {
    const maxAttempts = 100; // Prevent infinite loop
    let attempts = 0;

    while (attempts < maxAttempts) {
      // Generate random position within content area
      const x =
        Math.random() *
          (this.width * this.cellWidth - this.player?.radius * 2 || 12) +
        this.paddingLeft;
      const y =
        Math.random() *
          (this.height * this.cellHeight - this.player?.radius * 2 || 12) +
        this.paddingTop;

      // Create temporary player to test collision
      const tempPlayer = new Player({ x, y });
      this.player = tempPlayer; // Temporarily set for collision detection

      // Check if this position has no collision
      if (!this.isPixelCollision(x, y)) {
        console.log(`Found spawn position after ${attempts + 1} attempts:`, {
          x,
          y,
        });
        return { x, y };
      }

      attempts++;
    }

    // Fallback to top-left if no position found
    console.log("Could not find collision-free spawn position, using default");
    return {
      x: this.paddingLeft,
      y: this.paddingTop,
    };
  }

  stopGame() {
    this.gameStarted = false;
    this.player = null;
  }

  movePlayer(deltaX, deltaY) {
    if (this.player && this.gameStarted) {
      // Calculate new position
      const newX = this.player.position.x + deltaX * this.player.speed;
      const newY = this.player.position.y + deltaY * this.player.speed;

      // Check boundaries (considering player radius)
      const minX = this.paddingLeft;
      const minY = this.paddingTop;
      const maxX =
        this.width * this.cellWidth + this.paddingLeft - this.player.radius * 2;
      const maxY =
        this.height * this.cellHeight +
        this.paddingTop -
        this.player.radius * 2;

      // Check if new position is within boundaries
      if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
        // Render scene without player to check for collisions
        this.renderForCollisionCheck();

        // Check for collision with entities using pixel-based detection
        if (!this.isPixelCollision(newX, newY)) {
          this.player.move(deltaX, deltaY);
        } else {
          console.log("Movement blocked by collision");
        }
      } else {
        console.log("Movement blocked by boundaries");
      }
    }
  }

  renderForCollisionCheck() {
    if (!this.lastRenderedCanvas || !this.lastRenderedCanvas.context) {
      return;
    }

    const ctx = this.lastRenderedCanvas.context;

    // Set background color similar to VS Code dark theme
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(
      0,
      0,
      this.lastRenderedCanvas.ele.width,
      this.lastRenderedCanvas.ele.height
    );

    // Set font properties for character rendering
    ctx.font = `${this.fontSize}px 'Consolas', 'Monaco', 'Courier New', monospace`;
    ctx.textBaseline = "top";

    // Render each entity as a character (without player)
    this.entities.forEach((entity) => {
      if (entity._color.alpha > 0) {
        ctx.fillStyle = `rgba(${entity._color.red}, ${entity._color.green}, ${
          entity._color.blue
        }, ${entity._color.alpha / 255})`;

        // Draw the character
        ctx.fillText(entity.character, entity.position.x, entity.position.y);
      }
    });
  }

  isPixelCollision(playerX, playerY) {
    if (!this.lastRenderedCanvas) {
      return false; // No canvas to check against
    }

    const playerRadius = this.player.radius;
    const ctx = this.lastRenderedCanvas.context;

    try {
      // Check pixels around the player's circular area
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        // Check points around the circumference of the player
        const checkX = Math.round(
          playerX + playerRadius + Math.cos(angle) * (playerRadius - 1)
        );
        const checkY = Math.round(
          playerY + playerRadius + Math.sin(angle) * (playerRadius - 1)
        );

        // Make sure we're within canvas bounds
        if (
          checkX >= 0 &&
          checkY >= 0 &&
          checkX < this.lastRenderedCanvas.ele.width &&
          checkY < this.lastRenderedCanvas.ele.height
        ) {
          // Get pixel data at this position
          const imageData = ctx.getImageData(checkX, checkY, 1, 1);
          const [r, g, b, a] = imageData.data;

          // If pixel is not background color (not #1e1e1e), there's a collision
          if (a > 0 && !(r === 30 && g === 30 && b === 30)) {
            console.log(
              `Collision detected at (${checkX}, ${checkY}) with color rgba(${r}, ${g}, ${b}, ${a})`
            );
            return true;
          }
        }
      }

      // Also check center point
      const centerX = Math.round(playerX + playerRadius);
      const centerY = Math.round(playerY + playerRadius);

      if (
        centerX >= 0 &&
        centerY >= 0 &&
        centerX < this.lastRenderedCanvas.ele.width &&
        centerY < this.lastRenderedCanvas.ele.height
      ) {
        const imageData = ctx.getImageData(centerX, centerY, 1, 1);
        const [r, g, b, a] = imageData.data;

        if (a > 0 && !(r === 30 && g === 30 && b === 30)) {
          console.log(
            `Center collision detected at (${centerX}, ${centerY}) with color rgba(${r}, ${g}, ${b}, ${a})`
          );
          return true;
        }
      }
    } catch (error) {
      console.error("Error in pixel collision detection:", error);
      return false;
    }

    return false;
  }
}

module.exports = { JungleMap };
