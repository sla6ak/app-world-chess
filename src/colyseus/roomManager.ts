import type { Room } from "colyseus.js";

let currentRoom: Room | null = null;

export function setRoom(room: Room | null): void {
    currentRoom = room;
}

export function getRoom(): Room | null {
    return currentRoom;
}
