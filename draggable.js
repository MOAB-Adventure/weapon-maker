const grid = document.getElementById("grid")
class DraggableElement extends HTMLElement{
  x = 0
  y = 0
  rotation = 0
  width = 20
  height = 20
  dragging = false
  selected = false
  resizable = true
  deletable = true
  rotatable = true
  posCorrection = 0
  serialisable = true
  onmove = () => {}
  description = "Generic Part"
  anchor = {
    x: 0,
    y: 0,
    coordinateScale: 5,
    width: 0,
    height: 0
  }
  coordinateScale = 10
  constructor(){
    super()
  }
  static observedAttributes = ["desc"]
  connectedCallback(){
    this.addEventListener("mousedown", this.handlePossibleDragStart)
    this.addEventListener("mouseup", this.handleDefiniteDragEnd)
    this.addEventListener("wheel", this.handleScroll)
    this.addEventListener("mouseenter", this.handleSelect)
    this.addEventListener("mouseleave", this.handleDeselect)
    this.addEventListener("contextmenu", this.handleDefiniteDragEnd)

    document.addEventListener("mousemove", (event) => this.handleMovement(event))
    document.addEventListener("keydown", (event) => this.handleKeyPress(event))

    this.style.cursor = "grab"
    this.style.display = "inline-block"
    this.style.position = "absolute"
    this.style.borderWidth = "1px"
    this.style.textAlign = "center"
    this.updateStyles()
    this.onmove(new KeyboardEvent("a"))
  }
  handleScroll(event){
    if(this.rotatable){
      this.rotation += Math.round(event.deltaY / 100)
      this.updateStyles()
    }
  }
  handleKeyPress(event){
    if(!this.selected) return;
    if(event.key === "d" && this.deletable){
      const duplicate = document.createElement("draggable-part")
      duplicate.x = this.x
      duplicate.y = this.y
      duplicate.width = this.width
      duplicate.height = this.height
      duplicate.rotation = this.rotation
      duplicate.coordinateScale = this.coordinateScale
      duplicate.anchor = this.anchor
      duplicate.updateStyles()
      document.body.appendChild(duplicate)
      parts.push(duplicate)
      duplicate.style.borderColor = "blue"
    }
    if(event.key === "Backspace" && this.deletable){
      this.selected = false
      this.deletable = false
      parts.splice(parts.indexOf(this), 1)
      this.remove()
      return;
    }
    if(event.key === "ArrowUp"){
      if(this.resizable && event.shiftKey){
        this.height += 1
        this.y -= 0.5
        this.style.borderTopColor = "lime"
      }
      else if(this.resizable && event.ctrlKey){
        this.height -= 1
        this.y += 0.5
        this.style.borderTopColor = "red"
      }
      else{
        this.y -= 1
      }
    }
    if(event.key === "ArrowDown"){
      if(this.resizable && event.shiftKey){
        this.height += 1
        this.y += 0.5
        this.style.borderBottomColor = "lime"
      }
      else if(this.resizable && event.ctrlKey){
        this.height -= 1
        this.y -= 0.5
        this.style.borderBottomColor = "red"
      }
      else{
        this.y += 1
      }
    }
    if(event.key === "ArrowRight"){
      if(this.resizable && event.shiftKey){
        this.width += 1
        this.x += 0.5
        this.style.borderRightColor = "lime"
      }
      else if(this.resizable && event.ctrlKey){
        this.width -= 1
        this.x -= 0.5
        this.style.borderRightColor = "red"
      }
      else{
        this.x += 1
      }
    }
    if(event.key === "ArrowLeft"){
      if(this.resizable && event.shiftKey){
        this.width += 1
        this.x -= 0.5
        this.style.borderLeftColor = "lime"
      }
      else if(this.resizable && event.ctrlKey){
        this.width -= 1
        this.x += 0.5
        this.style.borderLeftColor = "red"
      }
      else{
        this.x -= 1
      }
    }
    this.updateStyles()
    this.onmove(event)
  }
  handleMovement(event){
    if(!this.dragging) return;
    this.x = Math.round(((event.x - this.anchor.x * this.anchor.coordinateScale) - this.posCorrection*this.coordinateScale) / this.coordinateScale)
    this.y = Math.round(((event.y - this.anchor.y * this.anchor.coordinateScale) - this.posCorrection*this.coordinateScale) / this.coordinateScale)
    this.updateStyles()
    this.onmove(event)
  }
  handlePossibleDragStart(event){
    this.handleDefiniteDragStart(event)
  }
  handleDefiniteDragStart(event){
    this.dragging = true
    this.style.cursor = "grabbing"
    this.updateStyles()
  }
  handleDefiniteDragEnd(event){
    this.dragging = false
    this.style.cursor = "grab"
    this.updateStyles()
  }
  handleDeselect(event){
    if(!this.dragging){
      this.selected = false
      this.style.cursor = "grab" 
      this.updateStyles()
    }
  }
  handleSelect(event){
    this.selected = true
    this.updateStyles()
  }
  updateStyles(){
    if(this.style.borderLeftColor === "black") this.style.borderLeftColor = "cyan";
    if(this.style.borderRightColor === "black") this.style.borderRightColor = "cyan";
    if(this.style.borderTopColor === "black") this.style.borderTopColor = "cyan";
    if(this.style.borderBottomColor === "black") this.style.borderBottomColor = "cyan";
    // this.style.backgroundColor = this.selected?"#dfdfdf":"#ffffff"
    this.style.width = this.width*this.coordinateScale+"px"
    this.style.height = this.height*this.coordinateScale+"px"
    this.style.left = (this.x - this.width/2 + this.anchor.x + this.posCorrection)*this.coordinateScale + "px"
    this.style.top = (this.y - this.height/2 + this.anchor.y + this.posCorrection)*this.coordinateScale + "px"
    this.style.rotate = this.rotation+"deg"
    this.setAttribute("desc", this.description+(this.resizable?"\n("+this.width+"x"+this.height+")":"")+"\n[X:"+this.x+",Y:"+this.y+"]"+(this.rotatable?("\nRotation: "+this.rotation):""))
    this.setAttribute("rot", this.rotation)
    if(!this.selected) this.style.borderColor = "black"
  }
}

customElements.define("draggable-part", DraggableElement)
