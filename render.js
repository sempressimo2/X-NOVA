import { gameState } from './game-state.js';
import { getCellAt } from './grid.js';

// Render obstacles on the grid
function renderObstacles() {
    gameState.obstacles.forEach(obstacle => {
        const cell = getCellAt(obstacle.x, obstacle.y);
        cell.classList.add(obstacle.type);
    });
}

// Render units on the grid
function renderUnits() {
    // Clear existing units
    document.querySelectorAll('.soldier, .alien').forEach(el => el.remove());
    
    // Render soldiers
    gameState.soldiers.forEach(soldier => {
        if (soldier.health > 0) {
            const cell = getCellAt(soldier.x, soldier.y);
            const soldierEl = document.createElement('div');
            soldierEl.classList.add('soldier');
            soldierEl.dataset.id = soldier.id;
            cell.appendChild(soldierEl);
        }
    });
    
    // Render aliens
    gameState.aliens.forEach(alien => {
        if (alien.health > 0) {
            const cell = getCellAt(alien.x, alien.y);
            const alienEl = document.createElement('div');
            alienEl.classList.add('alien');
            alienEl.dataset.id = alien.id;
            cell.appendChild(alienEl);
        }
    });
}

export { renderUnits, renderObstacles };