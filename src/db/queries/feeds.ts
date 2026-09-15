import { db } from "../index.js";
import { feeds, users } from "../../schema.js";
import { eq } from "drizzle-orm";

export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return result;
}

export async function getFeeds() {
  return await db.select().from(feeds);
}

export async function getFeedsWithUsers() {
  return await db
    .select({
      feed: feeds,
      user: users,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}
