// js/input.js
import { triggerScreenshake } from "./ui.js"; // if needed

export const keys1 = {};
export const keys2 = {};
export const joystickAim1 = { x: 0, y: 0 };
export const joystickAim2 = { x: 0, y: 0 };

export function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()){
      case 'w': keys1["ArrowUp"] = true; break;
      case 'a': keys1["ArrowLeft"] = true; break;
      case 's': keys1["ArrowDown"] = true; break;
      case 'd': keys1["ArrowRight"] = true; break;
      case ' ':
        // Call melee attack or other function from game module if needed.
        break;
    }
  });
  document.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()){
      case 'w': keys1["ArrowUp"] = false; break;
      case 'a': keys1["ArrowLeft"] = false; break;
      case 's': keys1["ArrowDown"] = false; break;
      case 'd': keys1["ArrowRight"] = false; break;
    }
  });
}

export function setupMouse() {
  // Update joystickAim1 based on mouse move
  document.addEventListener('mousemove', (e) => {
    const gameEl = document.getElementById("game");
    const rect = gameEl.getBoundingClientRect();
    // Assume cameraX, cameraY, and currentScale are global (see main.js)
    const scale = window.currentScale || 1;
    const mouseX = (e.clientX - rect.left) / scale + window.cameraX;
    const mouseY = (e.clientY - rect.top) / scale + window.cameraY;
    
    // For example, assume player1 is global:
    const player = window.playerChar1;
    const dx = mouseX - player.torso.position.x;
    const dy = mouseY - player.torso.position.y;
    const mag = Math.hypot(dx, dy);
    if (mag > 0) {
      joystickAim1.x = dx / mag;
      joystickAim1.y = dy / mag;
    }
  });
  
  // For grab actions using mouse down/up:
  document.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      // Call grabStart from game module (imported in main.js)
      window.grabStart(window.playerChar1, joystickAim1);
    }
  });
  document.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      window.grabRelease(window.playerChar1, keys1, joystickAim1);
    }
  });
}

export function setupGamepad() {
  // Implement gamepad handling similar to your existing code.
  // Update keys1, keys2, and joystickAim1, joystickAim2 accordingly.
}
