const addBtn = document.getElementById("addPoint");
const saveBtn = document.getElementById("savePosition");
const nameInput = document.getElementById("pointName");
const positionsList = document.getElementById("positionsList");

let positions = [];
let positionCounter = 1;
let isEditingIndex = null; // Variable para saber qué posición estamos editando

// --- Inicialización ---
window.onload = () => {
    positions = loadFromStorage();
    if (positions.length > 0) {
        const lastPositionName = positions[positions.length - 1].name;
        const lastNumber = parseInt(lastPositionName.replace("Posición ", ""), 10);
        positionCounter = isNaN(lastNumber) ? positions.length + 1 : lastNumber + 1;
    }
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
    if (isEditingIndex !== null) {
        alert("Primero guarda o cancela la edición actual.");
        return;
    }
    const currentPos = getCurrentPositions();
    positions.push({ name: "Posición " + positionCounter, coords: currentPos });
    saveToStorage(positions);
    renderPositions();
    positionCounter++;
});

// --- Lógica de Edición del Nombre del Punto ---

/**
 * Maneja el evento de doble clic en un punto para editar su nombre.
 * @param {MouseEvent} event 
 */
function handlePointNameEdit(pointObject) {
    if (!pointObject || !pointObject.element) return;

    const wrap = pointObject.element;
    const label = wrap.querySelector('.point-label');
    if (!label) return;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = pointObject.name;
    editInput.className = 'point-label-edit';

    const savePointName = () => {
        const newName = editInput.value.trim();
        if (newName) {
            pointObject.name = newName;
            label.textContent = newName;
        }
        if (wrap.contains(editInput)) {
            wrap.replaceChild(label, editInput);
        }
    };

    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            savePointName();
        } else if (e.key === 'Escape') {
            if (wrap.contains(editInput)) {
                wrap.replaceChild(label, editInput); // Cancela sin guardar
            }
        }
    });

    editInput.addEventListener('blur', savePointName);

    wrap.replaceChild(editInput, label);
    editInput.select();
}

/** Activa o desactiva el modo de edición visual y funcional */
function togglePointEditingEffect(enable) {
    points.forEach(p => {
        if (enable) {
            p.element.classList.add('editing');
            handlePointNameEdit(p); // aquí sí reemplazamos el label por input
        } else {
            p.element.classList.remove('editing');
            // Cuando salimos de edición, forzamos a mostrar el label actualizado
            const wrap = p.element;
            const editInput = wrap.querySelector('.point-label-edit');
            if (editInput) {
                const label = document.createElement('span');
                label.className = 'point-label';
                label.textContent = p.name;
                wrap.replaceChild(label, editInput);
            }
        }
    });
}

// --- Renderizar lista de posiciones (Lógica principal) ---
function renderPositions() {
    positionsList.innerHTML = "";
    positions.forEach((pos, index) => {
        const li = document.createElement("li");

        // --- MODO EDICIÓN: Si estamos editando este elemento ---
        if (index === isEditingIndex) {
            li.style.backgroundColor = "#fffbe6";
            const nameSpan = document.createElement("span");
            nameSpan.textContent = `Editando: ${pos.name}`;
            nameSpan.style.fontWeight = "bold";

            const saveEditBtn = document.createElement("button");
            saveEditBtn.textContent = "✅ Guardar Todo";
            saveEditBtn.onclick = () => {
                // getCurrentPositions() ahora recogerá los nombres actualizados de los puntos
                const newCoordsAndNames = getCurrentPositions();
                positions[isEditingIndex].coords = newCoordsAndNames;
                saveToStorage(positions);

                isEditingIndex = null;
                togglePointEditingEffect(false);
                renderPositions();
            };

            const cancelEditBtn = document.createElement("button");
            cancelEditBtn.textContent = "❌ Cancelar";
            cancelEditBtn.onclick = () => {
                const originalPosition = positions[isEditingIndex];
                isEditingIndex = null;
                togglePointEditingEffect(false);
                loadPosition(originalPosition);
                renderPositions();
            };

            li.appendChild(nameSpan);
            li.appendChild(saveEditBtn);
            li.appendChild(cancelEditBtn);

            // --- MODO NORMAL: Si NO estamos editando ---
        } else {
            const nameSpan = document.createElement("span");
            nameSpan.textContent = pos.name;
            nameSpan.style.marginRight = "10px";
            nameSpan.style.cursor = "pointer";
            // agregar hover al pasar por el span cambiar el color (tanto movil y web)
            nameSpan.addEventListener("mouseenter", () => {
                nameSpan.style.color = "blue";
            });
            nameSpan.addEventListener("mouseleave", () => {
                nameSpan.style.color = "";
            });

            nameSpan.addEventListener("click", () => {
                if (isEditingIndex !== null) {
                    alert("Termina de editar la posición actual antes de cargar otra.");
                    return;
                }
                loadPosition(positions[index]);
            });

            const editBtn = document.createElement("button");
            editBtn.textContent = "✏️";
            editBtn.title = "Editar posición";
            editBtn.onclick = (e) => {
                e.stopPropagation();
                isEditingIndex = index;
                loadPosition(positions[index]);
                togglePointEditingEffect(true);
                renderPositions();
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.title = "Eliminar";
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar "${pos.name}"?`)) {
                    positions.splice(index, 1);
                    saveToStorage(positions);
                    renderPositions();
                }
            };

            if (isEditingIndex !== null) {
                editBtn.disabled = true;
                deleteBtn.disabled = true;
                nameSpan.style.cursor = 'not-allowed';
                nameSpan.style.color = '#999';
            }

            li.appendChild(nameSpan);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
        }
        positionsList.appendChild(li);
    });
}

const pointsList = document.getElementById("pointsList");

function renderPointsList() {
    pointsList.innerHTML = "";
    points.forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.name;
        pointsList.appendChild(li);
    });
}

const exportBtn = document.getElementById("exportJson");
const importBtn = document.getElementById("importJsonBtn");
const importInput = document.getElementById("importJson");

// Exportar posiciones a un archivo JSON
exportBtn.addEventListener("click", () => {
    if (positions.length === 0) {
        alert("No hay posiciones para exportar.");
        return;
    }
    const dataStr = JSON.stringify(positions, null, 2); // formato bonito
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "positions.json";
    a.click();

    URL.revokeObjectURL(url);
});

// Abrir selector de archivo al presionar el botón
importBtn.addEventListener("click", () => {
    importInput.click();
});

// Importar posiciones desde un JSON
importInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                positions = importedData;
                saveToStorage(positions);
                renderPositions();
                alert("✅ Posiciones importadas correctamente.");
            } else {
                alert("El archivo JSON no tiene el formato esperado.");
            }
        } catch (err) {
            alert("Error al leer el archivo JSON: " + err.message);
        }
    };
    reader.readAsText(file);
});