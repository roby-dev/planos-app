// --- Funciones de almacenamiento en localStorage ---
const STORAGE_KEY = "positions";

/**
 * Guardar posiciones en localStorage
 * @param {Array} positions 
 */
function saveToStorage(positions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

/**
 * Cargar posiciones desde localStorage
 * @returns {Array}
 */
function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}
