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

    // 📍 Normaliza coordenadas de mouse o touch
    function getClientXY(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    function startDrag(e) {
        const { x, y } = getClientXY(e);
        const rect = plane.getBoundingClientRect();
        offsetX = x - rect.left - el.offsetLeft;
        offsetY = y - rect.top - el.offsetTop;
        dragging = true;
        e.preventDefault(); // evita scroll en móviles
    }

    function doDrag(e) {
        if (!dragging) return;
        const { x, y } = getClientXY(e);
        const rect = plane.getBoundingClientRect();
        let newX = x - rect.left - offsetX;
        let newY = y - rect.top - offsetY;

        // Limitar dentro del plano considerando el tamaño del punto
        newX = Math.max(0, Math.min(rect.width - pointSize, newX));
        newY = Math.max(0, Math.min(rect.height - pointSize, newY));

        // Snap al centro de la celda
        newX = Math.round(newX / gridSize) * gridSize + (gridSize - pointSize) / 2;
        newY = Math.round(newY / gridSize) * gridSize + (gridSize - pointSize) / 2;

        el.style.left = newX + "px";
        el.style.top = newY + "px";
    }

    function endDrag() {
        dragging = false;
    }

    // 🖱️ Eventos de ratón
    el.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", endDrag);

    // 📱 Eventos táctiles
    el.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", doDrag, { passive: false });
    window.addEventListener("touchend", endDrag);
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
