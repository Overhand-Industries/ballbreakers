// js/main.js
import { engine, world } from "./engine.js";
import { LEVEL_WIDTH } from "./config.js";
import { showInstructionsOnce, updateScoreboard, triggerScreenshake } from "./ui.js";
import { setupKeyboard, setupMouse, setupGamepad, keys1, joystickAim1 } from "./input.js";
import { createPlatform, createWall, createCharacter, createEnemy, grabStart, grabRelease, updateHeldObject, meleeAttack, checkEnemyOutOfBounds } from "./game.js";

// Global variables for camera (accessible in other modules via window)
window.cameraX = 0;
window.cameraY = 0;
window.currentScale = 1;

// Expose player characters and grab functions for input modules to call.
window.playerChar1 = createCharacter(100, 300);
window.playerChar2 = createCharacter(LEVEL_WIDTH - 100, 300);
window.grabStart = grabStart;
window.grabRelease = grabRelease;

// Call UI setup
showInstructionsOnce();

// Set up inputs
setupKeyboard();
setupMouse();
setupGamepad();

// Main update loop
function update() {
  // Call updateGamepadInput() from input.js if needed
  // Update Matter.js engine
  Engine.update(engine, 1000/60);
  
  // Run your game logic here:
  // Update characters, process input (jump, movement, etc.),
  // update held objects, update enemies, call checkEnemyOutOfBounds, update camera, etc.
  
  // For example:
  updateHeldObject(window.playerChar1, joystickAim1);
  updateHeldObject(window.playerChar2, window.joystickAim2);
  checkEnemyOutOfBounds();
  
  // Update camera (you could place the updateCamera code here, or import it from a separate module)
  // e.g., updateCamera();
  
  requestAnimationFrame(update);
}

update();
