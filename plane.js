// --- Configuración global del plano ---
const gridSize = 50;   // tamaño de celda
const pointSize = 30;  // tamaño del punto (debe coincidir con CSS)
const plane = document.getElementById("plane");

let points = [];

/**
 * Crear un nuevo punto (wrapper + label + circle)
 * @param {string} name
 * @returns {HTMLElement} wrapper del punto
 */
function createPoint(name) {
    const wrap = document.createElement("div");
    wrap.className = "point-wrap";
    wrap.style.width = pointSize + "px";
    wrap.style.height = pointSize + "px";

    // Centrado inicial en la 1ra celda
    wrap.style.left = (gridSize - pointSize) / 2 + "px";
    wrap.style.top = (gridSize - pointSize) / 2 + "px";

    const label = document.createElement("div");
    label.className = "point-label";
    label.textContent = name;

    const dot = document.createElement("div");
    dot.className = "point"; // solo el círculo, sin texto

    wrap.appendChild(label);
    wrap.appendChild(dot);
    plane.appendChild(wrap);

    makeDraggable(wrap, name);
    points.push({ element: wrap, name });
    return wrap;
}

/**
 * Hacer arrastrable el WRAPPER y ajustar al centro de la celda
 */
function makeDraggable(el, name) {
    let offsetX = 0, offsetY = 0, dragging = false;

    el.addEventListener("mousedown", (e) => {
        const rect = plane.getBoundingClientRect();
        // offset relativo al wrapper (no al target) para que funcione al hacer click en label o círculo
        offsetX = e.clientX - rect.left - el.offsetLeft;
        offsetY = e.clientY - rect.top - el.offsetTop;
        dragging = true;
    });

    window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const rect = plane.getBoundingClientRect();
        let x = e.clientX - rect.left - offsetX;
        let y = e.clientY - rect.top - offsetY;

        // Limitar dentro del plano considerando el tamaño del punto
        x = Math.max(0, Math.min(rect.width - pointSize, x));
        y = Math.max(0, Math.min(rect.height - pointSize, y));

        // Snap al centro de la celda
        x = Math.round(x / gridSize) * gridSize + (gridSize - pointSize) / 2;
        y = Math.round(y / gridSize) * gridSize + (gridSize - pointSize) / 2;

        el.style.left = x + "px";
        el.style.top = y + "px";
    });

    window.addEventListener("mouseup", () => {
        dragging = false;
    });
}

/**
 * Obtener posiciones actuales
 */
function getCurrentPositions() {
    return points.map(p => ({
        name: p.name,
        x: parseInt(p.element.style.left, 10),
        y: parseInt(p.element.style.top, 10),
    }));
}

/**
 * Cargar una posición guardada
 */
function loadPosition(pos) {
    pos.coords.forEach(c => {
        let p = points.find(pt => pt.name === c.name);
        if (!p) {
            const wrap = createPoint(c.name);
            p = { element: wrap, name: c.name };
            points.push(p);
        }
        p.element.style.left = c.x + "px";
        p.element.style.top = c.y + "px";
    });
}
