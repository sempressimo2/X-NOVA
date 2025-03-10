import { gameState, updateStatus, setTargetingMode } from './game-state.js';
import { getCellAt } from './grid.js';
import { renderUnits } from './render.js';
import { showGameMessage, animateShot } from './ui-effects.js';
import { checkWinCondition } from './game-state.js';

// Function to determine if a target is in cover relative to the shooter
function getTargetCoverStatus(shooterX, shooterY, targetX, targetY) {
    // Check if there's an obstacle adjacent to the target that could provide cover
    const potentialCoverPositions = [];
    
    // Check the four adjacent cells to the target
    potentialCoverPositions.push({ x: targetX + 1, y: targetY });
    potentialCoverPositions.push({ x: targetX - 1, y: targetY });
    potentialCoverPositions.push({ x: targetX, y: targetY + 1 });
    potentialCoverPositions.push({ x: targetX, y: targetY - 1 });
    
    // Filter to find cover positions that are between shooter and target
    let coverFound = null;
    
    for (const pos of potentialCoverPositions) {
        // Check if this position has an obstacle
        const obstacle = gameState.obstacles.find(o => o.x === pos.x && o.y === pos.y);
        
        if (obstacle) {
            // Basic check - if the cover is between shooter and target
            const coverDx = pos.x - shooterX;
            const coverDy = pos.y - shooterY;
            const dx = targetX - shooterX;
            const dy = targetY - shooterY;
            
            // If cover is in the same direction as target
            if (Math.sign(coverDx) === Math.sign(dx) && Math.sign(coverDy) === Math.sign(dy)) {
                coverFound = obstacle.type;
                break;
            }
        }
    }
    
    return coverFound;
}

// Handle shooting - enter targeting mode
function handleShoot() {
    if (gameState.turn !== 'player' || !gameState.selectedUnit || gameState.actionPoints < 2) {
        return;
    }
    
    // Enter targeting mode
    setTargetingMode(true);
    showGameMessage("Select an enemy to target");
    
    // Highlight targetable aliens
    gameState.aliens.forEach(alien => {
        if (alien.health > 0) {
            const cell = getCellAt(alien.x, alien.y);
            cell.classList.add('targetable');
        }
    });
}

// Handle target selection
function handleTargetSelection(alien) {
    // Calculate hit chance
    const distance = Math.abs(alien.x - gameState.selectedUnit.x) + 
                    Math.abs(alien.y - gameState.selectedUnit.y);
    
    // Check cover status
    const coverStatus = getTargetCoverStatus(
        gameState.selectedUnit.x, gameState.selectedUnit.y,
        alien.x, alien.y
    );
    
    // Calculate hit chance
    let hitChanceModifier = 0;
    if (coverStatus === 'half-cover') {
        hitChanceModifier = -30; // -30% hit chance for half cover
    } else if (coverStatus === 'full-cover') {
        hitChanceModifier = -60; // -60% hit chance for full cover
    }
    
    // Base hit chance calculation
    const baseHitChance = Math.max(10, 90 - distance * 10);
    const finalHitChance = Math.max(5, baseHitChance + hitChanceModifier);
    
    // Show targeting dialog
    showTargetingDialog(alien, finalHitChance);
}

// Create a targeting dialog
function showTargetingDialog(alien, hitChance) {
    // Remove any existing dialog
    const existingDialog = document.getElementById('targeting-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.id = 'targeting-dialog';
    dialog.classList.add('targeting-dialog');
    
    // Add content
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Target: Alien at (${alien.x}, ${alien.y})</h3>
            <p>Shot Accuracy: <span class="accuracy">${Math.round(hitChance)}%</span></p>
            <div class="dialog-buttons">
                <button id="confirm-shot">Shoot (2 AP)</button>
                <button id="cancel-shot">Cancel</button>
            </div>
        </div>
    `;
    
    // Position dialog near the target
    const targetCell = getCellAt(alien.x, alien.y);
    const targetRect = targetCell.getBoundingClientRect();
    
    dialog.style.position = 'absolute';
    dialog.style.top = `${targetRect.top - 10}px`;
    dialog.style.left = `${targetRect.right + 10}px`;
    
    // Add to document
    document.body.appendChild(dialog);
    
    // Add event listeners
    document.getElementById('confirm-shot').addEventListener('click', () => {
        executeShot(alien, hitChance);
        dialog.remove();
    });
    
    document.getElementById('cancel-shot').addEventListener('click', () => {
        exitTargetingMode();
        dialog.remove();
    });
}

// Execute the shot after confirmation
function executeShot(alien, hitChance) {
    // Determine if shot hits
    const hit = Math.random() * 100 < hitChance;
    
    // Animate the shot
    animateShot(
        gameState.selectedUnit.x, 
        gameState.selectedUnit.y, 
        alien.x, 
        alien.y,
        hit
    );
    
    if (hit) {
        alien.health--;
        showGameMessage(`Hit! Alien at (${alien.x}, ${alien.y}) took damage!`);
        
        if (alien.health <= 0) {
            showGameMessage('Alien eliminated!');
        }
    } else {
        showGameMessage('Shot missed!');
    }
    
    // Deduct action points
    gameState.actionPoints -= 2;
    updateStatus();
    renderUnits();
    
    // Exit targeting mode
    exitTargetingMode();
    
    // Check win condition
    if (checkWinCondition()) {
        showGameMessage('Victory! All aliens eliminated!');
    }
}

// Exit targeting mode
function exitTargetingMode() {
    setTargetingMode(false);
    
    // Remove targeting highlights
    document.querySelectorAll('.targetable').forEach(el => {
        el.classList.remove('targetable');
    });
}

export { 
    handleShoot, 
    handleTargetSelection, 
    exitTargetingMode, 
    getTargetCoverStatus 
};