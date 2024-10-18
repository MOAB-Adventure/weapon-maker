const grid = document.getElementById("grid");
class DraggableElement extends HTMLElement {
  x = 0;
  y = 0;
  px = 0;
  py = 0;
  slide = 0;
  rotation = 0;
  width = 20;
  height = 20;
  dragging = false;
  sliding = false;
  draggable = true;
  selected = false;
  resizable = true;
  deletable = true;
  rotatable = true;
  locked = false;
  posCorrection = 0;
  serialisable = true;
  onmove = () => { };
  description = "Generic Part";
  anchor = {
    x: 0,
    y: 0,
    coordinateScale: 5,
    width: 0,
    height: 0,
  };
  coordinateScale = 10;
  constructor() {
    super();
  }
  static observedAttributes = ["desc"];
  connectedCallback() {
    this.addEventListener("mousedown", this.handlePossibleDragStart);
    this.addEventListener("mouseup", this.handleDefiniteDragEnd);
    this.addEventListener("wheel", this.handleScroll);
    this.addEventListener("mouseenter", this.handleSelect);
    this.addEventListener("mouseleave", this.handleDeselect);
    this.addEventListener("contextmenu", this.handleDefiniteDragEnd);

    document.addEventListener("mousemove", (event) =>
      this.handleMovement(event)
    );
    document.addEventListener("keydown", (event) => this.handleKeyPress(event));

    this.resetCursor()
    this.style.display = "inline-block";
    this.style.position = "absolute";
    this.style.borderWidth = "1px";
    this.style.textAlign = "center";
    this.updateStyles();
    this.onmove(new KeyboardEvent("a"));
  }
  handleScroll(event) {
    if (this.rotatable && !this.locked) {
      this.rotation += Math.round(event.deltaY / 100);
      this.updateStyles();
    }
  }
  handleKeyPress(event) {
    if (!this.selected) return;
    if (this.locked) return;
    if (event.key === "d" && this.deletable) {
      const duplicate = document.createElement("draggable-part");
      duplicate.x = this.x;
      duplicate.y = this.y;
      duplicate.width = this.width;
      duplicate.height = this.height;
      duplicate.rotation = this.rotation;
      duplicate.coordinateScale = this.coordinateScale;
      duplicate.anchor = this.anchor;
      duplicate.updateStyles();
      document.body.appendChild(duplicate);
      parts.push(duplicate);
      updateInfo();
      duplicate.style.borderColor = "blue";
    }
    if (event.key === "Backspace" && this.deletable) {
      this.selected = false;
      this.deletable = false;
      parts.splice(parts.indexOf(this), 1);
      this.remove();
      updateInfo();
      return;
    }
    if (event.key === "ArrowUp") {
      if (this.resizable && event.shiftKey) {
        this.height += 1;
        this.y -= 0.5;
        this.style.borderTopColor = "lime";
      } else if (this.resizable && event.ctrlKey) {
        this.height -= 1;
        this.y += 0.5;
        this.style.borderTopColor = "red";
      } else {
        this.y -= 1;
      }
    }
    if (event.key === "ArrowDown") {
      if (this.resizable && event.shiftKey) {
        this.height += 1;
        this.y += 0.5;
        this.style.borderBottomColor = "lime";
      } else if (this.resizable && event.ctrlKey) {
        this.height -= 1;
        this.y -= 0.5;
        this.style.borderBottomColor = "red";
      } else {
        this.y += 1;
      }
    }
    if (event.key === "ArrowRight") {
      if (this.resizable && event.shiftKey) {
        this.width += 1;
        this.x += 0.5;
        this.style.borderRightColor = "lime";
      } else if (this.resizable && event.ctrlKey) {
        this.width -= 1;
        this.x -= 0.5;
        this.style.borderRightColor = "red";
      } else {
        this.x += 1;
      }
    }
    if (event.key === "ArrowLeft") {
      if (this.resizable && event.shiftKey) {
        this.width += 1;
        this.x -= 0.5;
        this.style.borderLeftColor = "lime";
      } else if (this.resizable && event.ctrlKey) {
        this.width -= 1;
        this.x += 0.5;
        this.style.borderLeftColor = "red";
      } else {
        this.x -= 1;
      }
    }
    this.updateStyles();
    this.onmove(event);
  }
  confirmSlide(){
    this.px = this.x
    this.py = this.y
    this.sliding = false
    if(this.ghost) this.killGhost()
  }
  createGhost(){
    this.ghost = document.createElement("draggable-part")
    this.ghost.style.pointerEvents = "none"
    document.body.appendChild(this.ghost)
    this.ghost.updateStyles()
  }
  updateGhost(){
    this.ghost.x = this.x
    this.ghost.y = this.y
    this.ghost.rotation = this.rotation
    this.ghost.updateStyles()
  }
  killGhost(){
    this.ghost.remove()
    delete this.ghost
  }
  handleMovement(event) {
    if (!this.dragging || this.locked) return;
    if (event.shiftKey) {
      this.sliding = true
      //if(!this.ghost) this.createGhost()
      //this.updateGhost()
      let nx = (event.x -
        this.anchor.x * this.anchor.coordinateScale -
        this.posCorrection * this.coordinateScale) /
        this.coordinateScale
      let ny = (event.y -
        this.anchor.y * this.anchor.coordinateScale -
        this.posCorrection * this.coordinateScale) /
        this.coordinateScale
      let dx = nx - this.px
      let dy = ny - this.py
      let angle = Math.atan2(dy, dx)
      let deg = Math.round(degrees(angle))
      this.slide = Math.round(Math.sqrt(dx**2 + dy**2));
      if(this.rotatable && !isNaN(+deg)) this.rotation = deg
      this.updateStyles()
      return;
    }
    this.x = Math.round(
      (event.x -
        this.anchor.x * this.anchor.coordinateScale -
        this.posCorrection * this.coordinateScale) /
      this.coordinateScale
    );
    this.y = Math.round(
      (event.y -
        this.anchor.y * this.anchor.coordinateScale -
        this.posCorrection * this.coordinateScale) /
      this.coordinateScale
    );
    this.updateStyles();
    this.onmove(event);
  }
  resetCursor() {
    if (this.locked) {
      this.style.cursor = "not-allowed";
    }
    else this.style.cursor = "grab"
  }
  focusSelection(){
    if(parts){
      for(let p of parts){
        if(p !== this) p.handleDefiniteDragEnd()
      }
    }
  }
  handlePossibleDragStart(event) {
    if (event.ctrlKey) {
      this.locked = !this.locked;
      this.setAttribute("locked", this.locked)
      this.resetCursor();
      this.style.borderColor = "black"
      this.updateStyles();
    }
    if (this.draggable && !this.locked) this.handleDefiniteDragStart(event);
    this.focusSelection()
  }
  handleDefiniteDragStart(event) {
    this.dragging = true;
    this.style.cursor = "grabbing";
    this.updateStyles();
  }
  handleDefiniteDragEnd(event) {
    this.dragging = false;
    this.confirmSlide()
    this.resetCursor()
    this.updateStyles();
  }
  handleDeselect(event) {
    if (!this.dragging) {
      this.selected = false;
      this.resetCursor()
      this.updateStyles();
    }
  }
  handleSelect(event) {
    this.selected = true;
    this.updateStyles();
  }
  get borderColour() {
    return this.locked ? "red" : "cyan";
  }
  updateStyles() {
    if (this.style.borderLeftColor === "black")
      this.style.borderLeftColor = this.borderColour;
    if (this.style.borderRightColor === "black")
      this.style.borderRightColor = this.borderColour;
    if (this.style.borderTopColor === "black")
      this.style.borderTopColor = this.borderColour;
    if (this.style.borderBottomColor === "black")
      this.style.borderBottomColor = this.borderColour;
    // this.style.backgroundColor = this.selected?"#dfdfdf":"#ffffff"
    this.style.width = this.width * this.coordinateScale + "px";
    this.style.height = this.height * this.coordinateScale + "px";
    let absX = (this.x - this.width / 2 + this.anchor.x + this.posCorrection) * this.coordinateScale
    let absY = (this.y - this.height / 2 + this.anchor.y + this.posCorrection) * this.coordinateScale
    let relX = (this.dragging&&!this.sliding)?0:(this.slide * Math.cos(radians(this.rotation)) * this.coordinateScale)
    let relY = (this.dragging&&!this.sliding)?0:(this.slide * Math.sin(radians(this.rotation)) * this.coordinateScale)
    this.style.left = (absX + relX) + "px";
    this.style.top = (absY + relY) + "px"
    this.style.rotate = this.rotation + "deg";
    this.setAttribute(
      "desc",
      this.description +
      (this.resizable ? "\n(" + this.width + "x" + this.height + ")" : "") +
      "\n[X:" +
      this.x +
      ",Y:" +
      this.y +
      "]" +
      (this.rotatable ? "\nRotation: " + this.rotation : "") + 
      (this.slide ? "\nSlide:"+this.slide : "")
    );
    this.setAttribute("rot", this.rotation);
    if (!this.selected) this.style.borderColor = "black";
  }
}

customElements.define("draggable-part", DraggableElement);

function radians(deg){
  return deg / 180 * Math.PI
}
function degrees(rad){
  return rad / Math.PI * 180
}