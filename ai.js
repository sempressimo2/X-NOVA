import { gameState, updateStatus, checkLossCondition } from './game-state.js';
import { renderUnits } from './render.js';
import { getTargetCoverStatus } from './combat.js';
import { showGameMessage } from './ui-effects.js';
import { exitTargetingMode } from './combat.js';
import { targetingMode } from './game-state.js';

// End player turn and start alien turn
function endTurn() {
    if (gameState.turn === 'player') {
        // Exit targeting mode if active
        if (targetingMode) {
            exitTargetingMode();
        }
        
        gameState.turn = 'alien';
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        gameState.selectedUnit = null;
        updateStatus();
        
        // Simple AI for aliens
        setTimeout(() => {
            alienTurn();
        }, 1000);
    }
}

// Alien turn logic
function alienTurn() {
    gameState.aliens.forEach(alien => {
        if (alien.health <= 0) return;
        
        // Find closest soldier
        let closestSoldier = null;
        let shortestDistance = Infinity;
        
        gameState.soldiers.forEach(soldier => {
            if (soldier.health <= 0) return;
            
            const distance = Math.abs(soldier.x - alien.x) + 
                            Math.abs(soldier.y - alien.y);
            
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestSoldier = soldier;
            }
        });
        
        if (closestSoldier) {
            executeAlienMove(alien, closestSoldier, shortestDistance);
        }
    });
    
    renderUnits();
    
    // Check loss condition
    if (checkLossCondition()) {
        showGameMessage('Game Over! All soldiers are down!');
        return;
    }
    
    // Switch back to player turn
    gameState.turn = 'player';
    gameState.actionPoints = 4;
    updateStatus();
}

function executeAlienMove(alien, closestSoldier, shortestDistance) {
    // Try to find a position with cover that's closer to the soldier
    let bestMove = { x: alien.x, y: alien.y };
    let bestMovePriority = 0;
    
    // Check adjacent cells for movement
    const possibleMoves = [
        { x: alien.x + 1, y: alien.y },
        { x: alien.x - 1, y: alien.y },
        { x: alien.x, y: alien.y + 1 },
        { x: alien.x, y: alien.y - 1 }
    ];
    
    for (const move of possibleMoves) {
        // Skip if out of bounds
        if (move.x < 0 || move.x >= gameState.gridSize || 
            move.y < 0 || move.y >= gameState.gridSize) {
            continue;
        }
        
        // Skip if occupied
        const isOccupied = 
            gameState.soldiers.some(s => s.x === move.x && s.y === move.y && s.health > 0) ||
            gameState.aliens.some(a => a.x === move.x && a.y === move.y && a.health > 0) ||
            gameState.obstacles.some(o => o.x === move.x && o.y === move.y);
        
        if (isOccupied) continue;
        
        // Calculate new distance to soldier
        const newDistance = Math.abs(closestSoldier.x - move.x) + 
                           Math.abs(closestSoldier.y - move.y);
        
        // Calculate priority based on cover and distance
        let movePriority = 0;
        
        // Check if this position would have cover against the soldier
        const coverStatus = getTargetCoverStatus(
            closestSoldier.x, closestSoldier.y, move.x, move.y
        );
        
        if (coverStatus === 'half-cover') {
            movePriority += 2;
        } else if (coverStatus === 'full-cover') {
            movePriority += 3;
        }
        
        // Prefer moves that get closer to the soldier
        if (newDistance < shortestDistance) {
            movePriority += 1;
        }
        
        // Update best move if this one has higher priority
        if (movePriority > bestMovePriority) {
            bestMovePriority = movePriority;
            bestMove = move;
        }
    }
    
    // Move the alien
    alien.x = bestMove.x;
    alien.y = bestMove.y;
    
    // Attack if adjacent to soldier
    const newDistance = Math.abs(closestSoldier.x - alien.x) + 
                       Math.abs(closestSoldier.y - alien.y);
    
    if (newDistance <= 1) {
        closestSoldier.health--;
        showGameMessage(`Alien attacked soldier! Soldier health: ${closestSoldier.health}`);
        
        if (closestSoldier.health <= 0) {
            showGameMessage('Soldier down!');
        }
    }
}

export { endTurn, alienTurn };