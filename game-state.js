// Game state and core game data
const gameState = {
    gridSize: 10,
    turn: 'player',
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

// Targeting mode tracking
let targetingMode = false;

function updateStatus() {
    const statusEl = document.getElementById('status');
    statusEl.textContent = `Turn: ${gameState.turn === 'player' ? 'Player' : 'Alien'} | Action Points: ${gameState.actionPoints}`;
}

function checkWinCondition() {
    return gameState.aliens.every(a => a.health <= 0);
}

function checkLossCondition() {
    return gameState.soldiers.every(s => s.health <= 0);
}

export { 
    gameState, 
    targetingMode, 
    updateStatus, 
    checkWinCondition, 
    checkLossCondition 
};
export function setTargetingMode(value) {
    targetingMode = value;
}