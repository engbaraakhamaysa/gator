import { setUser } from "./config.js";
import {
  createUser,
  getUserByName,
  deleteAllUsers,
} from "./db/queries/users.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export async function handlerReset(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  await deleteAllUsers();

  console.log("Database reset successfully");
}

// Handles the login command by setting the current username
export async function handlerLogin(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("username is required");
  }

  const userName = args[0];

  const user = await getUserByName(userName);

  if (!user) {
    throw new Error(`User ${userName} does not exist`);
  }

  setUser(userName);

  console.log(`User ${userName} has been set`);
}

export async function handlerRegister(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  if (args.length === 0) {
    throw new Error("username is required");
  }

  const userName = args[0];

  const existingUser = await getUserByName(userName);

  if (existingUser) {
    throw new Error(`User ${userName} already exists`);
  }

  const user = await createUser(userName);

  setUser(userName);

  console.log(`User ${userName} has been created`);
  console.log(user);
}

// Registers a command handler under a specific command name
export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

// Finds and executes the handler for a given command
export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];

  if (!handler) {
    throw new Error(`Unknown command: ${cmdName}`);
  }

  await handler(cmdName, ...args);
}
