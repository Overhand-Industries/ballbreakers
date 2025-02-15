// js/game.js
import { world, engine, createDomElement } from "./engine.js";
import { LEVEL_WIDTH, GROUND_EXTRA_HEIGHT } from "./config.js";
import { triggerScreenshake, updateScoreboard } from "./ui.js";
import { Body, World, Composite, Bodies } from "matter-js";

// Array for storing enemies
export const enemies = [];

/* ---------------------------
   Level & Entity Creation
--------------------------- */
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
  el.style.width = goalBody.width + "px";
  el.style.height = goalBody.height + "px";
  el.style.left = (goalBody.position.x - goalBody.width / 2) + "px";
  el.style.top = (goalBody.position.y - goalBody.height / 2) + "px";
  document.getElementById("game").appendChild(el);
  goalBody.domElement = el;
}

/* ---------------------------
   Character Creation
--------------------------- */
export function createCharacter(x, y) {
  const character = { hp: 100, spawn: { x, y }, heldObject: null, isDying: false, facing: "right" };
  const size = 20;
  // Create parts
  const head = Bodies.circle(x, y - 40, size / 2, { friction: 0.5, restitution: 0 });
  const torso = Bodies.circle(x, y - 20, size, { friction: 6.0, frictionAir: 0.11, restitution: 0 });
  const rightUpperArm = Bodies.circle(x + 30, y - 20, size / 2, { friction: 0.5, restitution: 0 });
  const rightHand = Bodies.circle(x + 30, y, size / 2, { friction: 0.5, restitution: 0 });
  const leftUpperArm = Bodies.circle(x - 30, y - 20, size / 2, { friction: 0.5, restitution: 0 });
  const leftHand = Bodies.circle(x - 30, y, size / 2, { friction: 0.5, restitution: 0 });
  const rightUpperLeg = Bodies.circle(x + 10, y + 10, size / 2, { friction: 0.5, restitution: 0 });
  const rightFoot = Bodies.circle(x + 10, y + 30, size / 2, { friction: 0.5, restitution: 0 });
  const leftUpperLeg = Bodies.circle(x - 10, y + 10, size / 2, { friction: 0.5, restitution: 0 });
  const leftFoot = Bodies.circle(x - 10, y + 30, size / 2, { friction: 0.5, restitution: 0 });
  
  World.add(world, [head, torso, rightUpperArm, rightHand, leftUpperArm, leftHand, rightUpperLeg, rightFoot, leftUpperLeg, leftFoot]);
  
  // Link parts using constraints
  const link = (a, b, offsetA, offsetB) => {
    const con = Matter.Constraint.create({
      bodyA: a, pointA: offsetA, bodyB: b, pointB: offsetB, stiffness: 1, length: 0.1
    });
    World.add(world, con);
  };
  
  link(head, torso, { x: 0, y: size / 2 }, { x: 0, y: -size });
  link(torso, rightUpperArm, { x: size, y: 0 }, { x: 0, y: 0 });
  link(rightUpperArm, rightHand, { x: 0, y: 0 }, { x: 0, y: -20 });
  link(torso, leftUpperArm, { x: -size, y: 0 }, { x: 0, y: 0 });
  link(leftUpperArm, leftHand, { x: 0, y: 0 }, { x: 0, y: -20 });
  link(torso, rightUpperLeg, { x: 10, y: size }, { x: 0, y: -size / 2 });
  link(rightUpperLeg, rightFoot, { x: 0, y: 0 }, { x: 0, y: -20 });
  link(torso, leftUpperLeg, { x: -10, y: size }, { x: 0, y: -size / 2 });
  link(leftUpperLeg, leftFoot, { x: 0, y: 0 }, { x: 0, y: -20 });
  
  character.head = head;
  character.torso = torso;
  character.rightUpperArm = rightUpperArm;
  character.rightHand = rightHand;
  character.leftUpperArm = leftUpperArm;
  character.leftHand = leftHand;
  character.rightUpperLeg = rightUpperLeg;
  character.rightFoot = rightFoot;
  character.leftUpperLeg = leftUpperLeg;
  character.leftFoot = leftFoot;
  
  // Create a simple HP bar DOM element
  const hpContainer = document.createElement("div");
  hpContainer.className = "hp-bar-container";
  const hpBar = document.createElement("div");
  hpBar.className = "hp-bar";
  hpContainer.appendChild(hpBar);
  document.getElementById("game").appendChild(hpContainer);
  character.hpContainer = hpContainer;
  character.hpBar = hpBar;
  
  return character;
}

/* ---------------------------
   Enemy Creation
--------------------------- */
export function createEnemy(x, y) {
  const enemy = { hp: 50, state: "patrol", direction: Math.random() < 0.5 ? -1 : 1 };
  enemy.body = Bodies.circle(x, y, 20, { friction: 0.5, frictionAir: 0.05, restitution: 1.0, label: "enemy", isBullet: true });
  createDomElement(enemy.body, "enemy", 40, 40);
  World.add(world, enemy.body);
  const overlay = document.createElement("div");
  overlay.classList.add("enemy-overlay");
  enemy.body.domElement.appendChild(overlay);
  enemy.update = function() {
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

/* ---------------------------
   Grab/Throw & Melee Functions
--------------------------- */
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
  // For simplicity, we simply trigger a screen shake.
  triggerScreenshake();
}

/* ---------------------------
   Out-of-Bounds and Destruction
--------------------------- */
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

export function damageDestructible(obj, damage) {
  if (typeof obj.hp !== "number") return;
  obj.hp -= damage;
  particleBurst(obj.position.x, obj.position.y, "orange");
  if (obj.hp <= 0) {
    particleBurst(obj.position.x, obj.position.y, "red");
    World.remove(world, obj);
    if (obj.domElement && obj.domElement.parentNode) {
      obj.domElement.parentNode.removeChild(obj.domElement);
    }
  }
}

export function removeEnemy(enemyBody) {
  World.remove(world, enemyBody);
  if (enemyBody.domElement && enemyBody.domElement.parentNode) {
    enemyBody.domElement.parentNode.removeChild(enemyBody.domElement);
  }
  const index = enemies.findIndex(e => e.body === enemyBody);
  if (index !== -1) enemies.splice(index, 1);
}

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
  triggerScreenshake();
  outText.classList.add("goalTextAnimation");
  setTimeout(() => {
    if (outText.parentNode) outText.parentNode.removeChild(outText);
  }, 1000);
}

// Example particleBurst function (complete implementation)
export function particleBurst(x, y, color) {
  const numParticles = 20;
  const gameEl = document.getElementById("game");
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement("div");
    particle.style.position = "absolute";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.width = "4px";
    particle.style.height = "4px";
    particle.style.backgroundColor = color;
    particle.style.borderRadius = "50%";
    particle.style.pointerEvents = "none";
    particle.style.opacity = "1";
    particle.style.transform = "translate(-50%, -50%)";
    gameEl.appendChild(particle);
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 50 + 20;
    const deltaX = Math.cos(angle) * distance;
    const deltaY = Math.sin(angle) * distance;
    particle.animate([
      { transform: "translate(0,0)", opacity: 1 },
      { transform: `translate(${deltaX}px, ${deltaY}px)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 400,
      easing: "ease-out",
      fill: "forwards"
    });
    setTimeout(() => { if (particle.parentNode) gameEl.removeChild(particle); }, 1200);
  }
}
