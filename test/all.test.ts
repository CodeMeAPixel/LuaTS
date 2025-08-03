import { describe } from 'bun:test';

// Import all test files
import './index.test.js';
import './features.test.js';
import './types.test.js';
import './snapshots.test.js';
import './plugins.test.js';
//import './cli.test.js';

describe('LuaTS Test Suite', () => {
  // This is just a container for all the tests
  // Each imported test file will run its own tests
  // This file helps organize and run all tests at once
});