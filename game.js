// Game state
const gameState = {
    gridSize: 10,
    turn: 'player', // 'player' or 'alien'
    actionPoints: 4,
    selectedUnit: null,
    soldiers: [
        { id: 's1', x: 1, y: 8, health: 3, actionPoints: 4 },
        { id: 's2', x: 3, y: 8, health: 3, actionPoints: 4 },
        { id: 's3', x: 5, y: 8, health: 3, actionPoints: 4 }
    ],
    aliens: [
        { id: 'a1', x: 2, y: 1, health: 2 },
        { id: 'a2', x: 5, y: 2, health: 2 },
        { id: 'a3', x: 8, y: 1, health: 2 }
    ],
    obstacles: [
        { x: 2, y: 5, type: 'full-cover' },
        { x: 3, y: 5, type: 'full-cover' },
        { x: 4, y: 5, type: 'half-cover' },
        { x: 6, y: 3, type: 'half-cover' },
        { x: 7, y: 3, type: 'full-cover' },
        { x: 7, y: 6, type: 'full-cover' },
        { x: 2, y: 2, type: 'half-cover' },
        { x: 8, y: 7, type: 'half-cover' }
    ]
};

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

// Get cell element at coordinates
function getCellAt(x, y) {
    return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

// Handle cell click
function handleCellClick(e) {
    const cell = e.currentTarget;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);
    
    // Clear any previous path indicators
    document.querySelectorAll('.path').forEach(cell => cell.classList.remove('path'));
    
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
            // Check if target cell has an obstacle
            const hasObstacle = gameState.obstacles.some(o => o.x === x && o.y === y);
            
            // Move the selected soldier if the cell is empty and has no obstacle
            const targetOccupied = 
                gameState.soldiers.some(s => s.x === x && s.y === y && s.health > 0) ||
                gameState.aliens.some(a => a.x === x && a.y === y && a.health > 0) ||
                hasObstacle;
            
            if (!targetOccupied) {
                // Calculate distance (simple Manhattan distance)
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
    }
}

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
            // Very basic check - if the cover is between shooter and target
            const coverDx = pos.x - shooterX;
            const coverDy = pos.y - shooterY;
            const dx = targetX - shooterX;
            const dy = targetY - shooterY;
            
            // If cover is in the same direction as target (simple check)
            if (Math.sign(coverDx) === Math.sign(dx) && Math.sign(coverDy) === Math.sign(dy)) {
                coverFound = obstacle.type;
                break;
            }
        }
    }
    
    return coverFound;
}

// Handle shooting
function handleShoot() {
    if (gameState.turn !== 'player' || !gameState.selectedUnit || gameState.actionPoints < 2) {
        return;
    }
    
    // Find the closest alien
    let closestAlien = null;
    let shortestDistance = Infinity;
    
    gameState.aliens.forEach(alien => {
        if (alien.health <= 0) return;
        
        const distance = Math.abs(alien.x - gameState.selectedUnit.x) + 
                        Math.abs(alien.y - gameState.selectedUnit.y);
        
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestAlien = alien;
        }
    });
    
    if (closestAlien) {
        // Check if alien is in cover
        const coverStatus = getTargetCoverStatus(
            gameState.selectedUnit.x, gameState.selectedUnit.y,
            closestAlien.x, closestAlien.y
        );
        
        // Adjust hit chance based on cover
        let hitChanceModifier = 0;
        if (coverStatus === 'half-cover') {
            hitChanceModifier = -30; // -30% hit chance for half cover
        } else if (coverStatus === 'full-cover') {
            hitChanceModifier = -60; // -60% hit chance for full cover
        }
        
        // Base hit chance calculation - closer is better
        const baseHitChance = Math.max(10, 90 - shortestDistance * 10);
        const finalHitChance = Math.max(5, baseHitChance + hitChanceModifier);
        
        // Display info about the shot
        alert(`Attempting shot: ${finalHitChance}% chance to hit`);
        
        const hit = Math.random() * 100 < finalHitChance;
        
        if (hit) {
            closestAlien.health--;
            alert(`Hit! Alien at (${closestAlien.x}, ${closestAlien.y}) took damage!`);
            
            if (closestAlien.health <= 0) {
                alert('Alien eliminated!');
            }
        } else {
            alert('Shot missed!');
        }
        
        gameState.actionPoints -= 2;
        updateStatus();
        renderUnits();
        
        // Check win condition
        if (gameState.aliens.every(a => a.health <= 0)) {
            alert('Victory! All aliens eliminated!');
        }
    } else {
        alert('No aliens in sight!');
    }
}

// End player turn and start alien turn
function endTurn() {
    if (gameState.turn === 'player') {
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
                alert(`Alien attacked soldier! Soldier health: ${closestSoldier.health}`);
                
                if (closestSoldier.health <= 0) {
                    alert('Soldier down!');
                }
            }
        }
    });
    
    renderUnits();
    
    // Check loss condition
    if (gameState.soldiers.every(s => s.health <= 0)) {
        alert('Game Over! All soldiers are down!');
    }
    
    // Switch back to player turn
    gameState.turn = 'player';
    gameState.actionPoints = 4;
    updateStatus();
}

// Update status display
function updateStatus() {
    const statusEl = document.getElementById('status');
    statusEl.textContent = `Turn: ${gameState.turn === 'player' ? 'Player' : 'Alien'} | Action Points: ${gameState.actionPoints}`;
}

// Initialize the game
function init() {
    initGrid();
    document.getElementById('end-turn').addEventListener('click', endTurn);
    document.getElementById('shoot').addEventListener('click', handleShoot);
}

// Start the game when the page loads
window.addEventListener('load', init);