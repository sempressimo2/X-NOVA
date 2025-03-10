import { gameState } from './game-state.js';
import { handleCellClick } from './units.js';
import { renderUnits, renderObstacles } from './render.js';
import { updateStatus } from './game-state.js';

// Initialize the grid
function initGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';

    for (let y = 0; y < gameState.gridSize; y++) {
        for (let x = 0; x < gameState.gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleCellClick);
            grid.appendChild(cell);
        }
    }

    renderUnits();
    renderObstacles();
    updateStatus();
}

// Get cell element at coordinates
function getCellAt(x, y) {
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

export { initGrid, getCellAt };