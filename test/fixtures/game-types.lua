--[[
  Game types
  This module defines the core types used in the game
]]

type EntityId = string

-- Basic entity type
type Entity = {
  id: EntityId,
  name: string,
  active: boolean
}

-- Component types
type Transform = {
  position: Vector3,
  rotation: Vector3,
  scale: Vector3
}

type Physics = {
  mass: number,
  velocity: Vector3,
  acceleration: Vector3,
  applyForce: (self: Physics, force: Vector3) -> ()
}

-- Item type
type Item = {
  id: string,
  name: string,
  value: number,
  weight: number,
  [string]: any -- Additional properties
}

-- Specialized entity type
type Player = Entity & {
  health: number,
  inventory: {Item},
  equipped?: Item
}

-- Game events
type GameEvent =
  { type: "PlayerSpawn", player: Player } |
  { type: "PlayerDeath", player: Player, cause: string } |
  { type: "ItemPickup", player: Player, item: Item }