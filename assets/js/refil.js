let inventory = 500;
const maxInventory = 500;
const refillRate = 1; // Energy refilled per interval
const refillInterval = 300000; // 5 minutes in milliseconds
const cooldownTime = 30000; // 30 seconds cooldown after using energy
let lastUpdateTime = Date.now();
let isOnCooldown = false;

// Start vibration if supported by the device
function startVibration() {
    if ("vibrate" in navigator) {
        window.navigator.vibrate(20);
    } else {
        console.log("Vibration not supported on this device");
    }
}

// Handle click event on the image
function handleClick() {
    if (inventory > 2 && !isOnCooldown) {
        let coins = Number(localStorage.getItem('coins')) || 0; // Retrieve the saved coins
        coins += 2;
        localStorage.setItem('coins', coins); // Save updated coins to localStorage

        inventory -= 2;
        updateInventory();
        startVibration();

        // Trigger cooldown
        isOnCooldown = true;
        setTimeout(() => {
            isOnCooldown = false;
            lastUpdateTime = Date.now(); // Reset timer after cooldown
        }, cooldownTime);

        // Animation for the coin image
        const image = document.querySelector('.clickable');
        image.classList.add('shake');
        setTimeout(() => {
            image.classList.remove('shake');
        }, 500);

        // Display +4 animation
        const scoreDisplay = document.createElement('div');
        scoreDisplay.textContent = "+4";
        scoreDisplay.classList.add('score-display');
        document.body.appendChild(scoreDisplay);

        const rect = image.getBoundingClientRect();
        scoreDisplay.style.left = `${rect.left + rect.width / 2}px`;
        scoreDisplay.style.top = `${rect.top}px`;

        setTimeout(() => {
            scoreDisplay.remove();
        }, 1000);
    }
}

// Update the inventory display and send data to the server
function updateInventory() {
    document.getElementById('inventory').textContent = inventory;
    document.getElementById('inventory-fill').style.width = `${(inventory / maxInventory) * 100}%`;

    // Save inventory state to localStorage
    localStorage.setItem('inventory', inventory);
    localStorage.setItem('lastUpdateTime', lastUpdateTime);

    // Send data to server (optional)
    var formData = new FormData();
    formData.append('username', 'Alex');
    formData.append('charge', inventory);

    fetch('update.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Error:', data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Calculate energy refill based on elapsed time
function refillEnergy() {
    const now = Date.now();
    const elapsed = now - lastUpdateTime;

    if (!isOnCooldown && inventory < maxInventory) {
        const energyGained = Math.floor(elapsed / refillInterval) * refillRate;
        if (energyGained > 0) {
            inventory = Math.min(inventory + energyGained, maxInventory);
            lastUpdateTime = now;
            updateInventory();
        }
    }
}

// Load user data and update inventory when the page loads
window.onload = () => {
    const profilePic = localStorage.getItem('profilePic');
    const userName = localStorage.getItem('userName');
    let coins = localStorage.getItem('coins') || 0; // Retrieve saved coins or set to 0 if not available
    inventory = Number(localStorage.getItem('inventory')) || maxInventory; // Retrieve saved inventory or set to max
    lastUpdateTime = Number(localStorage.getItem('lastUpdateTime')) || Date.now(); // Retrieve last update time

    if (profilePic) {
        document.querySelector("img[alt='User Avatar']").src = profilePic;
    }

    if (userName) {
        document.getElementById('userName').textContent = userName;
    }

    document.getElementById('score').textContent = `$ ${Number(coins).toLocaleString()}`; // Display saved coins
    updateInventory();

    // Refill energy on page load
    refillEnergy();

    // Continuously check for energy refill
    setInterval(refillEnergy, 10000); // Check every 10 seconds
};