let originInFront = false
const parts = []
let scale = 8


let anchor = document.createElement("draggable-part")
anchor.style.borderRadius = "100%"
anchor.width = 10
anchor.height = 10
anchor.x = Math.round(visualViewport.width/20)
anchor.y = Math.round(visualViewport.height/20)
anchor.description = "Origin"
anchor.resizable = false
anchor.deletable = false
anchor.rotatable = false
anchor.posCorrection = 0
anchor.coordinateScale = 8
anchor.updateStyles()
anchor.onmove = (event) => {
  if(!event.shiftKey) for(let part of parts){
    part.updateStyles(event)
  }
  grid.style.top = anchor.style.top
  grid.style.left = anchor.style.left
  anchor.style.textAlign = "center"
}
document.body.appendChild(anchor)

let blomp = document.createElement("draggable-part")
blomp.anchor = anchor
blomp.description = "Reference Image"
blomp.style.zIndex = "-1"
blomp.id = "ref"
blomp.width = 230
blomp.height = 150
blomp.serialisable = false
blomp.coordinateScale = scale
document.body.appendChild(blomp)
blomp.style.pointerEvents = "none"
parts.push(blomp)

function updatePreviewBlimp(){
  let input = document.getElementById("export-scale")
  blomp.width = 230 / input.value
  blomp.height = 150 / input.value
  blomp.updateStyles()
}

function makePart(x = 0, y = 0, width = 10, height = 10) {
  let elt = document.createElement("draggable-part")
  elt.x = x
  elt.y = y
  elt.width = width
  elt.height = height
  elt.anchor = anchor
  elt.serialisable = true
  elt.coordinateScale = scale
  document.body.appendChild(elt)
  parts.push(elt)
  visualScale()
  updateInfo()
}

function handleKeyboardShortcut(event){
  if(event.key === " "){
    makePart()
  }
}
document.addEventListener("keydown", handleKeyboardShortcut)

function visualScale(){
  let scale = document.getElementById("scale").value
  anchor.x = Math.round(visualViewport.width/(scale*2))
  anchor.y = Math.round(visualViewport.height/(scale*2))
  anchor.coordinateScale = scale
  anchor.handleMovement({x: anchor.x * scale, y: anchor.y * scale})
  anchor.updateStyles()
  for(let part of parts){
    part.coordinateScale = scale
    part.handleMovement({x: part.x * scale, y: part.y * scale})
    part.updateStyles()
  }
  grid.style.scale = scale / 8
  grid.style.top = anchor.style.top
  grid.style.left = anchor.style.left
}

async function exportMAWeapon(){
  copy(serialiseToMAWeaponTXT(parts).join("\n"))
}
async function exportMAWeaponJSON(){
  copy(JSON.stringify(serialiseToMAWeapon(parts)))
}

function delAll(){
  for(let part of parts){
    part.remove()
  }
  parts.splice(0)
  updateInfo()
}
function toggleOriginInFront(){
  if(originInFront){
    anchor.style.zIndex = "auto"
  }
  else{
    anchor.style.zIndex = "99"
  }
  originInFront = !originInFront
}

function serialiseToMAWeapon(parts){
  let arr = []
  let exportScale = document.getElementById("export-scale").value
  for(let part of parts){
    if(part.serialisable) arr.push({
      type: "part",
      x: part.x * exportScale,
      y: part.y * exportScale,
      width: part.width * exportScale,
      height: part.height * exportScale,
      rotation: part.rotation,
      image: false
    })
  }
  return arr
}
function serialiseToMAWeaponTXT(parts){
  let arr = ["["]
  let exportScale = document.getElementById("export-scale").value
  for(let part of parts){
    if(part.serialisable) arr.push(
      `    {
      type: "part",
      x: ${part.x * exportScale},
      y: ${part.y * exportScale},
      width: ${part.width * exportScale},
      height: ${part.height * exportScale},
      rotation: ${part.rotation},
      image: false
    },`)
  }
  arr.push("]")
  return arr
}

function copy(item){
  navigator.clipboard.writeText(item)
  alert("Copied!")
}

function updateInfo(){
  document.getElementById("part-counter").textContent = ""+parts.filter(x => x.serialisable?x:undefined).length
}