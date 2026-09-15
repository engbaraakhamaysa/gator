import { setUser, readConfig } from "./config.js";
import { fetchFeed } from "./rss.js";
import {
  createUser,
  getUserByName,
  deleteAllUsers,
  getUsers,
} from "./db/queries/users.js";
import {
  createFeed,
  getFeedsWithUsers,
  createFeedFollow,
  getFeedByUrl,
  getFeedFollowsForUser,
  deleteFeedFollow,
} from "./db/queries/feeds.js";

import type { Feed, User } from "./schema.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;

export type CommandsRegistry = Record<string, CommandHandler>;

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();

    if (!config.currentUserName) {
      throw new Error("No user is currently logged in");
    }

    const user = await getUserByName(config.currentUserName);

    if (!user) {
      throw new Error(`User ${config.currentUserName} does not exist`);
    }

    await handler(cmdName, user, ...args);
  };
}

export async function handlerUnfollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error("url is required");
  }

  const feedUrl = args[0];

  await deleteFeedFollow(user.id, feedUrl);
}

export async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  const feedFollows = await getFeedFollowsForUser(user.id);

  for (const feedFollow of feedFollows) {
    console.log(feedFollow.feedName);
  }
}

export async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error("url is required");
  }

  const feedUrl = args[0];

  const feed = await getFeedByUrl(feedUrl);

  if (!feed) {
    throw new Error(`Feed with URL ${feedUrl} does not exist`);
  }

  const feedFollow = await createFeedFollow(user.id, feed.id);

  console.log(`* ${feedFollow.feedName}`);
  console.log(`  Followed by: ${feedFollow.userName}`);
}

function printFeed(feed: Feed, user: User): void {
  console.log(`* ${feed.name}`);
  console.log(`  URL: ${feed.url}`);
  console.log(`  Added by: ${user.name}`);
}

export async function handlerFeeds(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feeds = await getFeedsWithUsers();

  for (const feed of feeds) {
    printFeed(feed.feed, feed.user);
  }
}

export async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error("name and url are required");
  }

  const feedName = args[0];
  const feedUrl = args[1];

  const feed = await createFeed(feedName, feedUrl, user.id);

  const feedFollow = await createFeedFollow(user.id, feed.id);

  printFeed(feed, user);

  console.log(`* ${feedFollow.feedName}`);
  console.log(`  Followed by: ${feedFollow.userName}`);
}

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");

  console.log(JSON.stringify(feed, null, 2));
}

export async function handlerUsers(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const users = await getUsers();
  const config = readConfig();

  for (const user of users) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

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
