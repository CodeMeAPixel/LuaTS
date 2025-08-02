import path from 'path';
import os from 'os';
import fs from 'fs';
import { randomUUID } from 'crypto';

/**
 * Creates a uniquely named temporary directory for tests
 * that's cleaned up automatically when the process exits
 */
export function createTempTestDir(prefix = 'luats-test-'): string {
  const tempDir = path.join(os.tmpdir(), `${prefix}${randomUUID()}`);
  
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Register cleanup on process exit
  process.on('exit', () => {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore errors during cleanup
    }
  });
  
  return tempDir;
}
