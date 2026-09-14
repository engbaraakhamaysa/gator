import {
  handlerLogin,
  registerCommand,
  runCommand,
  type CommandsRegistry,
} from "./commands.js";

// Initializes the command registry and handles CLI input
function main(): void {
  const registry: CommandsRegistry = {};

  // Registers the login command and its handler
  registerCommand(registry, "login", handlerLogin);

  // Gets the command-line arguments without the Node.js and npm arguments
  const args = process.argv.slice(2);

  // Makes sure at least one command was provided.
  if (args.length < 1) {
    console.error("Error: not enough arguments");
    process.exit(1);
  }

  // Separates the command name from its arguments
  const cmdName = args[0];
  const cmdArgs = args.slice(1);

  // Runs the command and handles any errors
  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
