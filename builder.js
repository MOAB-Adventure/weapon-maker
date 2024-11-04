let originInFront = false;
const parts = [];
let scale = 8;

let anchor = document.createElement("draggable-part");
anchor.style.borderRadius = "100%";
anchor.width = 10;
anchor.height = 10;
anchor.x = Math.round(visualViewport.width / 20);
anchor.y = Math.round(visualViewport.height / 20);
anchor.description = "Origin";
anchor.resizable = false;
anchor.deletable = false;
anchor.rotatable = false;
anchor.posCorrection = 0;
anchor.coordinateScale = 8;
anchor.circle = true;
anchor.hidePos = true;
anchor.coloured = false;
anchor.updateStyles();
anchor.onmove = (event) => {
  if (!event.shiftKey)
    for (let part of parts) {
      part.updateStyles(event);
    }
  grid.style.top = anchor.style.top;
  grid.style.left = anchor.style.left;
  anchor.style.textAlign = "center";
};
document.body.appendChild(anchor);

let blomp = document.createElement("draggable-part");
blomp.anchor = anchor;
blomp.description = "Reference Image";
blomp.style.zIndex = "-10";
blomp.id = "ref";
blomp.width = 230;
blomp.height = 150;
blomp.serialisable = false;
blomp.coordinateScale = scale;
blomp.deletable = false;
blomp.movable = false;
blomp.coloured = false;
document.body.appendChild(blomp);
blomp.style.pointerEvents = "none";
parts.push(blomp);

function updatePreviewBlimp() {
  let input = document.getElementById("export-scale");
  blomp.width = 230 / input.value;
  blomp.height = 150 / input.value;
  blomp.updateStyles();
}

function makePart(x = 0, y = 0, width = 10, height = 10) {
  let elt = document.createElement("draggable-part");
  elt.x = x;
  elt.y = y;
  elt.width = width;
  elt.height = height;
  elt.anchor = anchor;
  elt.serialisable = true;
  elt.coordinateScale = scale;
  document.body.appendChild(elt);
  parts.push(elt);
  visualScale();
  updateInfo();
  return elt;
}

function handleKeyboardShortcut(event) {
  if (painting) {
    if (event.key === "s") {
      disablePainter();
    }
    return;
  }
  if (event.key === "s") {
    enablePainter();
  }
  if (event.key === " ") {
    makePart();
  }
}
document.addEventListener("keydown", handleKeyboardShortcut);

function visualScale() {
  let scale = document.getElementById("scale").value;
  anchor.x = Math.round(visualViewport.width / (scale * 2));
  anchor.y = Math.round(visualViewport.height / (scale * 2));
  anchor.coordinateScale = scale;
  anchor.handleMovement({ x: anchor.x * scale, y: anchor.y * scale });
  anchor.updateStyles();
  for (let part of parts) {
    part.coordinateScale = scale;
    part.handleMovement({ x: part.x * scale, y: part.y * scale });
    part.updateStyles();
  }
  grid.style.scale = scale / 8;
  grid.style.top = anchor.style.top;
  grid.style.left = anchor.style.left;
}

async function exportMAWeapon() {
  copy(serialiseToMAWeaponTXT(parts).join("\n"));
}
async function exportMAWeaponJSON() {
  copy(JSON.stringify(serialiseToMAWeapon(parts)));
}

function delAll() {
  for (let part of parts) {
    if (part.deletable) part.remove();
  }
  parts.splice(1);
  updateInfo();
}
function toggleOriginInFront() {
  if (originInFront) {
    anchor.style.zIndex = "auto";
  } else {
    anchor.style.zIndex = "99";
  }
  originInFront = !originInFront;
}

function serialiseToMAWeapon(parts) {
  let arr = [];
  let exportScale = document.getElementById("export-scale").value;
  for (let part of parts) {
    if (part.serialisable) {
      arr.push(
        Object.assign({}, part.otherProperties, {
          type: "part",
          x: part.x * exportScale,
          y: part.y * exportScale,
          width: part.width * exportScale,
          height: part.height * exportScale,
          rotation: part.rotation,
          slide: part.slide * exportScale,
          image: false,
        }, part.coloured?{colour: part.colour}:{})
      );
    }
  }
  return arr;
}
function serialiseToMAWeaponTXT(parts) {
  let arr = ["["];
  let exportScale = document.getElementById("export-scale").value;
  for (let part of parts) {
    if (part.serialisable)
      arr.push(
        `    {
      type: "part",
      x: ${part.x * exportScale},
      y: ${part.y * exportScale},
      width: ${part.width * exportScale},
      height: ${part.height * exportScale},
      rotation: ${part.rotation},
      slide: ${part.slide * exportScale},
      ${part.coloured?"colour: ["+part.colour.join(", ")+"],\n":""}image: false,
      ${objAsProperties(part.otherProperties)}
    },`
      );
  }
  arr.push("]");
  return arr;
}
function objAsProperties(obj) {
  let str = JSON.stringify(obj).replaceAll(
    /(?<=[ \n{}]\w*)(?<!: )"|"(?=[^":,]*:)/g,
    ""
  );
  return str
    .substring(1, str.length - 1)
    .replaceAll(/(?<=[ \n{}]\w*)(?<!: )"|"(?=[^":,]*:)/g, "");
}
function importJSON() {
  let json = document.getElementById("json-input").value;
  let scl = document.getElementById("import-scale").value;
  let obj = JSON.parse(json);
  delAll();
  if (!obj instanceof Array) return;
  for (let part of obj) {
    let created = makePart(
      (part.x ?? 0) / scl,
      (part.y ?? 0) / scl,
      (part.width ?? 0) / scl,
      (part.height ?? 0) / scl
    );
    created.rotation = part.rotation ?? 0;
    created.slide = (part.slide ?? 0) / scl;
    created.colour = part.colour ?? [200, 200, 200];
    for (let key of Object.keys(part)) {
      created.otherProperties[key] = part[key];
    }
    delete created.otherProperties.type;
    delete created.otherProperties.x;
    delete created.otherProperties.y;
    delete created.otherProperties.width;
    delete created.otherProperties.height;
    delete created.otherProperties.rotation;
    delete created.otherProperties.slide;
    delete created.otherProperties.image;
    delete created.otherProperties.colour;
    created.updateStyles();
  }
  console.log(obj);
}

function copy(item) {
  navigator.clipboard.writeText(item);
  alert("Copied!");
}

function updateInfo() {
  document.getElementById("part-counter").textContent =
    "" + parts.filter((x) => (x.serialisable ? x : undefined)).length;
}

function toggleTooltip() {
  if (!document.getElementById("show-tt").checked) {
    tooltip.setAttribute("off", "");
  } else {
    tooltip.removeAttribute("off");
  }
}

function toggleOutline() {
  if (!document.getElementById("show-ln").checked) {
    outline.setAttribute("off", "");
  } else {
    outline.removeAttribute("off");
  }
}
let normalControls, painterControls;
addEventListener("DOMContentLoaded", () => {
  painterControls = document.getElementById("painter-controls");
  normalControls = document.getElementById("normal-controls");
});

function updatePainter() {
  if (!painting) {
    painterControls.style.visibility = "hidden";
    painterControls.style.height = "0";
    normalControls.style.visibility = "visible";
    normalControls.style.height = "auto";
    blomp.removeAttribute("colour");
    for (let part of parts) {
      part.handleDeselect();
      part.resetCursor();
    }
  } else {
    normalControls.style.visibility = "hidden";
    normalControls.style.height = "0";
    painterControls.style.visibility = "visible";
    painterControls.style.height = "auto";
    blomp.setAttribute("colour", "");
    for (let part of parts) {
      part.handleDeselect();
      part.resetCursor();
    }
  }
}

function disablePainter() {
  painting = false;
  updatePainter();
}
function enablePainter() {
  painting = true;
  updatePainter();
}
