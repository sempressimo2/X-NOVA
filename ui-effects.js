// Show game message
function showGameMessage(message, duration = 2000) {
    // Create or get message container
    let msgContainer = document.getElementById('game-messages');
    if (!msgContainer) {
        msgContainer = document.createElement('div');
        msgContainer.id = 'game-messages';
        document.body.appendChild(msgContainer);
    }
    
    // Create message element
    const msgElement = document.createElement('div');
    msgElement.classList.add('game-message');
    msgElement.textContent = message;
    msgContainer.appendChild(msgElement);
    
    // Remove after duration
    setTimeout(() => {
        msgElement.classList.add('fade-out');
        setTimeout(() => {
            msgElement.remove();
        }, 500);
    }, duration);
}

// Animate shot
function animateShot(fromX, fromY, toX, toY, hit) {
    // Create the bullet element
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    document.body.appendChild(bullet);
    
    // Get grid position for accurate coordinates
    const grid = document.getElementById('grid');
    const gridRect = grid.getBoundingClientRect();
    const cellSize = 50; 
    const cellGap = 2;
    
    // Calculate starting position (center of source cell)
    const startX = gridRect.left + (fromX * (cellSize + cellGap)) + (cellSize / 2);
    const startY = gridRect.top + (fromY * (cellSize + cellGap)) + (cellSize / 2);
    
    // Calculate ending position (center of target cell)
    const endX = gridRect.left + (toX * (cellSize + cellGap)) + (cellSize / 2);
    const endY = gridRect.top + (toY * (cellSize + cellGap)) + (cellSize / 2);
    
    // Set initial position
    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    
    // Animate the bullet
    const duration = 800;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        
        bullet.style.left = `${currentX}px`;
        bullet.style.top = `${currentY}px`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Animation complete
            if (hit) {
                // Add hit effect
                const hitEffect = document.createElement('div');
                hitEffect.classList.add('hit-effect');
                hitEffect.style.left = `${endX}px`;
                hitEffect.style.top = `${endY}px`;
                document.body.appendChild(hitEffect);
                
                // Remove hit effect after animation
                setTimeout(() => {
                    hitEffect.remove();
                }, 500);
            }
            
            // Remove bullet after animation
            setTimeout(() => {
                bullet.remove();
            }, 200);
        }
    }
    
    requestAnimationFrame(animate);
}

export { showGameMessage, animateShot };