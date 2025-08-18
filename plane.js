// --- Configuración global del plano ---
const gridSize = 50; // tamaño de celda (cambiar aquí)
const plane = document.getElementById("plane");

let points = [];

/**
 * Crear un nuevo punto en el plano
 * @param {string} name - nombre del punto
 * @returns {HTMLElement}
 */
function createPoint(name) {
    const point = document.createElement("div");
    point.className = "point";
    point.textContent = name;
    point.style.left = gridSize / 2 - point.offsetWidth / 2 + "px";
    point.style.top = gridSize / 2 - point.offsetHeight / 2 + "px";;

    plane.appendChild(point);
    makeDraggable(point, name);

    points.push({ element: point, name });
    return point;
}

/**
 * Hacer que un punto sea arrastrable y se ajuste a la cuadrícula
 * @param {HTMLElement} el 
 * @param {string} name 
 */
function makeDraggable(el, name) {
    let offsetX, offsetY, dragging = false;

    el.addEventListener("mousedown", (e) => {
        dragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
    });

    window.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        const rect = plane.getBoundingClientRect();
        let x = e.clientX - rect.left - offsetX;
        let y = e.clientY - rect.top - offsetY;

        // Limitar dentro del plano
        x = Math.max(0, Math.min(rect.width - el.offsetWidth, x));
        y = Math.max(0, Math.min(rect.height - el.offsetHeight, y));

        // Ajustar a la cuadrícula
        x = Math.round(x / gridSize) * gridSize + gridSize / 2 - el.offsetWidth / 2;
        y = Math.round(y / gridSize) * gridSize + gridSize / 2 - el.offsetHeight / 2;

        el.style.left = x + "px";
        el.style.top = y + "px";
    });

    window.addEventListener("mouseup", () => {
        dragging = false;
    });
}

/**
 * Obtener la posición actual de los puntos
 * @returns {Array}
 */
function getCurrentPositions() {
    return points.map(p => ({
        name: p.name,
        x: parseInt(p.element.style.left),
        y: parseInt(p.element.style.top),
    }));
}

/**
 * Cargar una posición guardada en el plano
 * @param {Object} pos 
 */
function loadPosition(pos) {
    pos.coords.forEach(c => {
        // si existe el punto lo mueve, sino lo crea
        let p = points.find(pt => pt.name === c.name);
        if (!p) {
            const point = createPoint(c.name);
            p = { element: point, name: c.name };
            points.push(p);
        }
        p.element.style.left = c.x + "px";
        p.element.style.top = c.y + "px";
    });
}
