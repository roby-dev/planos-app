const addBtn = document.getElementById("addPoint");
const saveBtn = document.getElementById("savePosition");
const nameInput = document.getElementById("pointName");
const positionsList = document.getElementById("positionsList");

let positions = [];
let positionCounter = 1;

// --- Inicialización ---
window.onload = () => {
    positions = loadFromStorage();
    positionCounter = positions.length + 1;
    renderPositions();
};

// --- Eventos ---
addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Escribe un nombre para el punto");
        return;
    }
    createPoint(name);
    nameInput.value = "";
});

saveBtn.addEventListener("click", () => {
    if (points.length === 0) return;

    const currentPos = getCurrentPositions();
    positions.push({ name: "Posición " + positionCounter, coords: currentPos });

    saveToStorage(positions);
    renderPositions();
    positionCounter++;
});

// --- Renderizar lista de posiciones ---
function renderPositions() {
    positionsList.innerHTML = "";
    positions.forEach((pos, index) => {
        const li = document.createElement("li");
        li.textContent = pos.name;
        li.addEventListener("click", () => loadPosition(positions[index]));
        positionsList.appendChild(li);
    });
}
