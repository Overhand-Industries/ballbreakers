// js/game.js
import { world, engine, createDomElement } from "./engine.js";
import { LEVEL_WIDTH, GROUND_EXTRA_HEIGHT } from "./config.js";
import { triggerScreenshake, updateScoreboard } from "./ui.js";
import { Body, World, Composite } from "matter-js";

// Arrays to hold game entities
export const enemies = [];

// --- Level and Entity Creation Functions ---

export function createPlatform(x, y, width, height) {
  const slope = Math.random() * 0.4 + 0.3;
  const options = { isStatic: true, label: "platform", density: 0.01 };
  const boulder = Bodies.trapezoid(x + width / 2, y + height / 2, width, height, slope, options);
  boulder.width = width;
  boulder.height = height;
  boulder.hp = 50;
  World.add(world, boulder);
  const el = document.createElement("div");
  el.className = "boulder";
  el.style.width = width + "px";
  el.style.height = height + "px";
  el.style.left = (x + width / 2) + "px";
  el.style.top = (y + height / 2) + "px";
  el.style.backgroundColor = "#0d0c29";
  const topClipPercent = slope * 50;
  el.style.clipPath = `polygon(0% 100%, 100% 100%, ${100 - topClipPercent}% 0%, ${topClipPercent}% 0%)`;
  document.getElementById("game").appendChild(el);
  boulder.domElement = el;
  return boulder;
}

export function createWall(x, y, width, height) {
  let body, el;
  if (y < window.playAreaHeight / 2) {
    const vertices = [
      { x: -width / 2, y: 0 },
      { x: width / 2, y: 0 },
      { x: 0, y: height }
    ];
    body = Bodies.fromVertices(x + width / 2, height / 3, [vertices], { isStatic: true, label: "wall" }, true);
    body.width = width;
    body.height = height;
    body.hp = 100;
    World.add(world, body);
    el = document.createElement("div");
    el.className = "stalactite";
    el.style.width = width + "px";
    el.style.height = height + "px";
    el.style.left = (x + width / 2) + "px";
    el.style.top = "0px";
    el.style.backgroundColor = "#0d0c29";
    el.style.clipPath = "polygon(50% 100%, 0% 0%, 100% 0%)";
  } else {
    const vertices = [
      { x: -width / 2, y: height },
      { x: width / 2, y: height },
      { x: 0, y: 0 }
    ];
    body = Bodies.fromVertices(x + width / 2, window.playAreaHeight - (2 * height) / 3, [vertices], { isStatic: true, label: "wall" }, true);
    body.width = width;
    body.height = height;
    body.hp = 100;
    World.add(world, body);
    el = document.createElement("div");
    el.className = "stalagmite";
    el.style.width = width + "px";
    el.style.height = height + "px";
    el.style.left = (x + width / 2) + "px";
    el.style.top = (window.playAreaHeight - height) + "px";
    el.style.backgroundColor = "#0d0c29";
    el.style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
  }
  document.getElementById("game").appendChild(el);
  body.domElement = el;
  return body;
}

export function createGoalDom(goalBody, cls) {
  const el = document.createElement("div");
  el.className = "goal " + cls;
  // Assume goalBody has width and height properties set
  el.style.width = goalBody.width + "px";
  el.style.height = goalBody.height + "px";
  el.style.left = (goalBody.position.x - goalBody.width / 2) + "px";
  el.style.top = (goalBody.position.y - goalBody.height / 2) + "px";
  document.getElementById("game").appendChild(el);
  goalBody.domElement = el;
}

export function createCharacter(x, y) {
  // Create a character object with parts.
  const character = { hp: 100, spawn: { x, y }, heldObject: null, isDying: false, facing: "right" };
  const size = 20;
  // Create parts using Matter.Bodies (this is a simplified example)
  const head = Bodies.circle(x, y - 40, size / 2);
  const torso = Bodies.circle(x, y - 20, size);
  // (Create arms, legs, etc., and add them to the world)
  World.add(world, [head, torso]);
  character.head = head;
  character.torso = torso;
  // In your full version, include arms, hands, legs, feet, and link them with Constraints.
  return character;
}

export function createEnemy(x, y) {
  const enemy = { hp: 50, state: "patrol", direction: Math.random() < 0.5 ? -1 : 1 };
  enemy.body = Bodies.circle(x, y, 20, { friction: 0.5, frictionAir: 0.05, restitution: 1.0, label: "enemy", isBullet: true });
  createDomElement(enemy.body, "enemy", 40, 40);
  World.add(world, enemy.body);
  const overlay = document.createElement("div");
  overlay.classList.add("enemy-overlay");
  enemy.body.domElement.appendChild(overlay);
  enemy.update = function() {
    // Simple AI: chase the closer player.
    const p1 = window.playerChar1, p2 = window.playerChar2;
    const dist1 = Math.hypot(p1.torso.position.x - enemy.body.position.x, p1.torso.position.y - enemy.body.position.y);
    const dist2 = Math.hypot(p2.torso.position.x - enemy.body.position.x, p2.torso.position.y - enemy.body.position.y);
    const target = dist1 < dist2 ? p1 : p2;
    const dx = target.torso.position.x - enemy.body.position.x;
    const dy = target.torso.position.y - enemy.body.position.y;
    enemy.state = (Math.abs(dx) < 400 && Math.abs(dy) < 50) ? "chase" : "patrol";
    if (enemy.state === "chase") {
      const chaseForce = 0.001;
      Body.applyForce(enemy.body, enemy.body.position, { x: (dx > 0 ? 1 : -1) * chaseForce, y: 0 });
      if (dy < -20 && Math.abs(enemy.body.velocity.y) < 1) {
        Body.setVelocity(enemy.body, { x: enemy.body.velocity.x, y: -10 });
      }
    } else {
      const patrolForce = 0.0005;
      Body.applyForce(enemy.body, enemy.body.position, { x: enemy.direction * patrolForce, y: 0 });
      if (enemy.body.position.x < 50) enemy.direction = 1;
      else if (enemy.body.position.x > LEVEL_WIDTH - 50) enemy.direction = -1;
    }
  };
  enemies.push(enemy);
  return enemy;
}

// --- Grab/Throw Functions ---
export function grabStart(player, joystickAim) {
  if (!player.heldObject) {
    const grabRange = 1000;
    const handPos = (player.facing === "left") 
      ? (player.leftHand ? player.leftHand.position : player.torso.position)
      : (player.rightHand ? player.rightHand.position : player.torso.position);
    const bodies = Composite.allBodies(world);
    let candidate = null;
    let candidateDist = Infinity;
    bodies.forEach(body => {
      if (body.isStatic || body.character || body.label === "bullet" ||
          body.label === "leftGoal" || body.label === "rightGoal") return;
      const dx = body.position.x - handPos.x;
      const dy = body.position.y - handPos.y;
      const dist = Math.hypot(dx, dy);
      if (dist < grabRange && dist < candidateDist) {
        candidate = body;
        candidateDist = dist;
      }
    });
    if (candidate) {
      player.heldObject = candidate;
      candidate.collisionFilter.mask = 0;
    }
  }
}

export function grabRelease(player, keys, joystickAim) {
  if (player.heldObject) {
    let dx = 0, dy = 0;
    const aimMag = Math.hypot(joystickAim.x, joystickAim.y);
    if (aimMag > 0.1) {
      dx = joystickAim.x;
      dy = joystickAim.y;
    } else {
      if (keys["ArrowUp"]) dy = -1;
      if (keys["ArrowDown"]) dy = 1;
      if (keys["ArrowLeft"]) dx = -1;
      if (keys["ArrowRight"]) dx = 1;
      if (dx === 0 && dy === 0) dx = (player.facing === "left") ? -1 : 1;
      const mag = Math.hypot(dx, dy);
      dx /= mag;
      dy /= mag;
    }
    const throwSpeed = 55;
    Body.setVelocity(player.heldObject, { x: dx * throwSpeed, y: dy * throwSpeed });
    player.heldObject.collisionFilter.mask = 0xFFFFFFFF;
    player.heldObject = null;
  }
}

export function updateHeldObject(player, joystickAim) {
  if (player.heldObject) {
    const offsetDistance = 40;
    let aimX = joystickAim.x, aimY = joystickAim.y;
    if (Math.hypot(aimX, aimY) < 0.1) {
      aimX = (player.facing === "left") ? -1 : 1;
      aimY = 0;
    }
    const targetX = player.torso.position.x + aimX * offsetDistance;
    const targetY = player.torso.position.y + aimY * offsetDistance;
    Body.setPosition(player.heldObject, { x: targetX, y: targetY });
  }
}

// --- Melee Attack (simplified sample) ---
export function meleeAttack(player, keys, joystickAim) {
  let inputDir = { x: 0, y: 0 };
  if (keys["ArrowLeft"]) inputDir.x -= 1;
  if (keys["ArrowRight"]) inputDir.x += 1;
  if (keys["ArrowUp"]) inputDir.y -= 1;
  if (keys["ArrowDown"]) inputDir.y += 1;
  if (inputDir.x === 0 && inputDir.y === 0 && Math.hypot(joystickAim.x, joystickAim.y) > 0.1) {
    inputDir.x = joystickAim.x;
    inputDir.y = joystickAim.y;
  }
  const mag = Math.hypot(inputDir.x, inputDir.y);
  const attackDir = mag > 0 ? { x: inputDir.x / mag, y: inputDir.y / mag } : { x: 0, y: -1 };
  // (Apply forces to perform melee attack, damage objects, etc.)
  triggerScreenshake();
}

// --- Check Enemies Out of Bounds ---
export function checkEnemyOutOfBounds() {
  enemies.slice().forEach(enemy => {
    const pos = enemy.body.position;
    const outHorizontally = pos.x < 0 || pos.x > LEVEL_WIDTH;
    const outBelowSafety = pos.y > window.playAreaHeight + 50;
    const groundCenter = (window.playAreaHeight - 20) + (GROUND_EXTRA_HEIGHT / 2);
    const groundPenetration = pos.y > groundCenter && enemy.body.speed > 3;
    if (outHorizontally || outBelowSafety || groundPenetration) {
      triggerOutEffect();
      removeEnemy(enemy.body);
      setTimeout(() => { createEnemy(LEVEL_WIDTH / 2, window.playAreaHeight / 2); }, 2000);
    }
  });
}

// --- New Functions to Fix Errors ---

// respawnPlayer: Removes all parts of a player so that it can be recreated.
export function respawnPlayer(player) {
  const parts = [player.head, player.torso, player.rightUpperArm, player.rightHand,
                 player.leftUpperArm, player.leftHand, player.rightUpperLeg, player.rightFoot,
                 player.leftUpperLeg, player.leftFoot];
  parts.forEach(part => {
    World.remove(world, part);
    if (part.domElement && part.domElement.parentNode) {
      part.domElement.parentNode.removeChild(part.domElement);
    }
  });
  if (player.hpContainer && player.hpContainer.parentNode) {
    player.hpContainer.parentNode.removeChild(player.hpContainer);
  }
}

// damageDestructible: Decreases the hp of a destructible object, plays effects, and removes it when hp <= 0.
export function damageDestructible(obj, damage) {
  if (typeof obj.hp !== "number") return;
  obj.hp -= damage;
  // If you have a particleBurst function, call it:
  if (typeof particleBurst === "function") {
    particleBurst(obj.position.x, obj.position.y, "orange");
  }
  if (obj.hp <= 0) {
    if (typeof particleBurst === "function") {
      particleBurst(obj.position.x, obj.position.y, "red");
    }
    if (obj.label === "wall") {
      // breakWall(obj);
    } else if (obj.label === "platform") {
      // breakBoulder(obj);
    } else {
      World.remove(world, obj);
      if (obj.domElement && obj.domElement.parentNode) {
        obj.domElement.parentNode.removeChild(obj.domElement);
      }
      // Remove from arrays if needed.
    }
  }
}

// Helper to remove an enemy.
export function removeEnemy(enemyBody) {
  World.remove(world, enemyBody);
  if (enemyBody.domElement && enemyBody.domElement.parentNode) {
    enemyBody.domElement.parentNode.removeChild(enemyBody.domElement);
  }
  // Remove from the enemies array.
  const index = enemies.findIndex(e => e.body === enemyBody);
  if (index !== -1) enemies.splice(index, 1);
}

// A sample triggerOutEffect function.
function triggerOutEffect() {
  const outText = document.createElement("div");
  outText.id = "outText";
  outText.innerText = "OUT!";
  outText.style.position = "absolute";
  outText.style.top = "50%";
  outText.style.left = "50%";
  outText.style.transform = "translate(-50%, -50%)";
  outText.style.fontSize = "72px";
  outText.style.fontWeight = "bold";
  outText.style.fontFamily = '"Impact", "Arial Black", sans-serif';
  outText.style.color = "red";
  outText.style.zIndex = "60";
  outText.style.pointerEvents = "none";
  document.getElementById("game").appendChild(outText);
  // Shake the screen.
  triggerScreenshake();
  outText.classList.add("goalTextAnimation");
  setTimeout(() => {
    if (outText.parentNode) {
      outText.parentNode.removeChild(outText);
    }
  }, 1000);
}

// You may add additional functions such as digitalPixelExplosion, breakWall, breakBoulder, etc.
