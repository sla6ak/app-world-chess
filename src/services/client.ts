import { Client } from "colyseus.js";

const COLYSEUS_URL = "ws://localhost:5000";

const client = new Client(COLYSEUS_URL);

export default client;
