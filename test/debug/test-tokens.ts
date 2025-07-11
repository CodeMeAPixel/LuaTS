import { Lexer } from '../dist/index.js';

// Debug the tokens being generated for the demo code
const demoCode = `
type Vector3 = {
  x: number,
  y: number,
  z: number
}

type Player = {
  name: string,
  id: number,
  position: Vector3,
  health: number,
  inventory?: { [string]: number }
}

type GameEvent = {
  type: "PlayerJoined" | "PlayerLeft" | "PlayerMoved",
  playerId: number,
  timestamp: number,
  data?: any
}
`;

console.log('=== Tokenizing Demo Code ===');
const lexer = new Lexer(demoCode);
const tokens = lexer.tokenize();

console.log('Total tokens:', tokens.length);
tokens.forEach((token, i) => {
  if (token.line >= 15 && token.line <= 20) {
    console.log(`${i}: Line ${token.line}, Col ${token.column}: ${token.type} = "${token.value}"`);
  }
});
