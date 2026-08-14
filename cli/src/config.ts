import fs from 'fs';
import path from 'path';
import os from 'os';

export interface NorthveilCliConfig {
  apiKey?: string;
  apiUrl?: string;
  defaultWallet?: string;
  keyName?: string;
  tier?: string;
  userId?: string;
}

const CONFIG_DIR = path.join(os.homedir(), '.northveil');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getCliConfig(): NorthveilCliConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    // Ignore corrupt or unreadable config
  }
  return {};
}

export function saveCliConfig(config: NorthveilCliConfig): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  } catch (e: any) {
    console.error('⚠️ Failed to save CLI configuration:', e.message);
  }
}

export function clearCliConfig(): void {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  } catch (e: any) {
    console.error('⚠️ Failed to clear CLI configuration:', e.message);
  }
}
