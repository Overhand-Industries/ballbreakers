// js/main.js
import { engine } from "./engine.js";
import { LEVEL_WIDTH } from "./config.js";
import { showInstructionsOnce, updateScoreboard, triggerScreenshake } from "./ui.js";
import { setupKeyboard, setupMouse, setupGamepad, keys1, joystickAim1 } from "./input.js";
import { createPlatform, createWall, createCharacter, createEnemy, grabStart, grabRelease, updateHeldObject, meleeAttack, checkEnemyOutOfBounds, respawnPlayer, damageDestructible } from "./game.js";
import { Engine } from "matter-js";

// Global camera variables
window.cameraX = 0;
window.cameraY = 0;
window.currentScale = 1;

// Global play area height
window.playAreaHeight = window.innerHeight - 100;

// Create player characters and attach to global window
window.playerChar1 = createCharacter(100, window.playAreaHeight / 2);
window.playerChar2 = createCharacter(LEVEL_WIDTH - 100, window.playAreaHeight / 2);

// Expose grab functions for input
window.grabStart = grabStart;
window.grabRelease = grabRelease;

// Show instructions
showInstructionsOnce();

// Set up input handlers
setupKeyboard();
setupMouse();
setupGamepad();

// Main update loop
function update() {
  Engine.update(engine, 1000 / 60);
  
  // Update held objects for player 1
  updateHeldObject(window.playerChar1, joystickAim1);
  
  // Check for enemies out-of-bounds
  checkEnemyOutOfBounds();
  
  // Update camera here if needed (code not included; add your updateCamera implementation)
  
  requestAnimationFrame(update);
}

update();
