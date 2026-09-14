// Node.js modules for files, home directory, and paths.
import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName?: string;
};

// Returns the path to the users config file
function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

// Writes a Config object to the JSON config file
function writeConfig(cfg: Config): void {
  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };

  const filePath = getConfigFilePath();

  fs.writeFileSync(filePath, JSON.stringify(rawConfig));
}

// Checks that the parsed JSON has the expected structure
function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw new Error("invalid config");
  }

  if (typeof rawConfig.db_url !== "string") {
    throw new Error("invalid config");
  }

  if (
    "current_user_name" in rawConfig &&
    typeof rawConfig.current_user_name !== "string"
  ) {
    throw new Error("invalid config");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

// Reads, parses, validates, and returns the config
export function readConfig(): Config {
  const filePath = getConfigFilePath();

  const raw = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  const parsed = JSON.parse(raw);

  return validateConfig(parsed);
}

// Updates the current user and saves the config
export function setUser(userName: string): void {
  const config = readConfig();

  config.currentUserName = userName;

  writeConfig(config);
}
