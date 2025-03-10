import { initGrid } from './grid.js';
import { handleShoot } from './combat.js';
import { endTurn } from './ai.js';

// Initialize the game
function init() {
    initGrid();
    
    // Set up event listeners
    document.getElementById('end-turn').addEventListener('click', endTurn);
    document.getElementById('shoot').addEventListener('click', handleShoot);
}

// Start the game when the page loads
window.addEventListener('load', init);