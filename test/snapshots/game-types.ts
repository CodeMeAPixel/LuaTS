/**
 * Basic entity type
 */
interface Entity {
  id: EntityId;
  name: string;
  active: boolean;
}

/**
 * Component types
 */
interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

interface Physics {
  mass: number;
  velocity: Vector3;
  acceleration: Vector3;
  applyForce: (self: Physics, force: Vector3) => any;
}

/**
 * Item type
 */
interface Item {
  id: string;
  name: string;
  value: number;
  weight: number;
  [key: string]: any;
}

/**
 * Game types
  This module defines the core types used in the game
 */
type EntityId = string;

/**
 * Specialized entity type
 */
type Player = Entity & { health: number, inventory: Item[], equipped?: Item };

/**
 * Game events
 */
type GameEvent = { type: "PlayerSpawn", player: Player } | { type: "PlayerDeath", player: Player, cause: string } | { type: "ItemPickup", player: Player, item: Item };