// js/ui.js
export function showInstructionsOnce() {
  if (localStorage.getItem('instructionsShown')) { return; }
  const popup = document.createElement('div');
  popup.id = 'instructions-popup';
  // style and fill popup
  popup.innerHTML = `
    <h1>How to Play</h1>
    <p><strong>Movement:</strong> Use WASD or left stick.</p>
    <p><strong>Grab/Throw:</strong> Hold the grab button (mouse left-click or gamepad button 7) and aim.</p>
    <p><strong>Melee:</strong> Press spacebar or left trigger.</p>
    <button id="closeInstructions">Got it!</button>
  `;
  document.body.appendChild(popup);
  document.getElementById('closeInstructions').addEventListener('click', () => {
    popup.style.display = 'none';
    localStorage.setItem('instructionsShown', 'true');
  });
}

export function updateScoreboard(left, right) {
  document.getElementById("leftScore").textContent = left;
  document.getElementById("rightScore").textContent = right;
}

export function triggerScreenshake() {
  const screenEl = document.getElementById("screen");
  screenEl.classList.remove("shake");
  void screenEl.offsetWidth;
  screenEl.classList.add("shake");
}

// Additional UI functions: digitalPixelExplosion, spawnSpark, triggerGoalEffect, etc.
