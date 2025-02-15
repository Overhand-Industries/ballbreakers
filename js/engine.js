// js/engine.js
import { Engine, World, Bodies, Body, Constraint, Events, Composites, Composite } from "matter-js";

export const engine = Engine.create();
engine.world.gravity.y = 3.2;
export const world = engine.world;

export function createDomElement(body, cls, w, h) {
  const el = document.createElement("div");
  el.className = "entity " + cls;
  el.style.width = w + "px";
  el.style.height = h + "px";
  document.getElementById("game").appendChild(el);
  body.domElement = el;
  return el;
}

// … Include additional helper functions related to the physics world if desired.
