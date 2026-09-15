import {
  handlerFollowing,
  handlerFollow,
  handlerFeeds,
  handlerAddFeed,
  handlerAgg,
  handlerUsers,
  handlerReset,
  handlerLogin,
  handlerRegister,
  registerCommand,
  runCommand,
  type CommandsRegistry,
} from "./commands.js";

// Initializes the command registry and handles CLI input
async function main(): Promise<void> {
  const registry: CommandsRegistry = {};

  // Register all available CLI commands with their corresponding handlers
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", handlerAddFeed);
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "follow", handlerFollow);
  registerCommand(registry, "following", handlerFollowing);

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
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

main();
