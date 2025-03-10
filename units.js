import { gameState, updateStatus } from './game-state.js';
import { getCellAt } from './grid.js';
import { renderUnits } from './render.js';
import { targetingMode } from './game-state.js';
import { handleTargetSelection, exitTargetingMode } from './combat.js';

// Handle cell click
function handleCellClick(e) {
    const cell = e.currentTarget;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    
    // Clear any previous path indicators
    document.querySelectorAll('.path').forEach(cell => cell.classList.remove('path'));
    
    // If in targeting mode, check if clicked on an alien
    if (targetingMode) {
        const targetAlien = gameState.aliens.find(a => a.x === x && a.y === y && a.health > 0);
        
        if (targetAlien) {
            handleTargetSelection(targetAlien);
        } else {
            // Clicked elsewhere while targeting, cancel targeting
            exitTargetingMode();
        }
        return;
    }
    
    if (gameState.turn === 'player') {
        // Check if there's a soldier at this position
        const soldier = gameState.soldiers.find(s => s.x === x && s.y === y && s.health > 0);
        
        if (soldier) {
            // Select the soldier
            document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
            cell.classList.add('selected');
            gameState.selectedUnit = soldier;
        } 
        else if (gameState.selectedUnit) {
            // Move the selected soldier if possible
            moveSoldier(x, y);
        }
    }
}

function moveSoldier(x, y) {
    // Check if target cell has an obstacle
    const hasObstacle = gameState.obstacles.some(o => o.x === x && o.y === y);
    
    // Check if target is occupied
    const targetOccupied = 
        gameState.soldiers.some(s => s.x === x && s.y === y && s.health > 0) ||
        gameState.aliens.some(a => a.x === x && a.y === y && a.health > 0) ||
        hasObstacle;
    
    if (!targetOccupied) {
        // Calculate distance (Manhattan distance)
        const distance = Math.abs(x - gameState.selectedUnit.x) + 
                        Math.abs(y - gameState.selectedUnit.y);
        
        // Each movement costs 1 AP
        if (distance <= gameState.actionPoints) {
            gameState.actionPoints -= distance;
            gameState.selectedUnit.x = x;
            gameState.selectedUnit.y = y;
            renderUnits();
            updateStatus();
        }
    }
}

export { handleCellClick, moveSoldier };