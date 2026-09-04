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
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials');
const LEGACY_CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getCliConfig(): NorthveilCliConfig {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf8');
      return JSON.parse(raw);
    }
    if (fs.existsSync(LEGACY_CONFIG_FILE)) {
      const raw = fs.readFileSync(LEGACY_CONFIG_FILE, 'utf8');
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
      fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  } catch (e: any) {
    console.error('⚠️ Failed to save CLI credentials:', e.message);
  }
}

export function clearCliConfig(): void {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      fs.unlinkSync(CREDENTIALS_FILE);
    }
    if (fs.existsSync(LEGACY_CONFIG_FILE)) {
      fs.unlinkSync(LEGACY_CONFIG_FILE);
    }
  } catch (e: any) {
    console.error('⚠️ Failed to clear CLI credentials:', e.message);
  }
}
