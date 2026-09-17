import { db } from "../index.js";
import { feeds, users, feedFollows } from "../../schema.js";
import { and, eq, asc, sql } from "drizzle-orm";

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

export async function createFeedFollow(userId: string, feedId: string) {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({
      userId,
      feedId,
    })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.id, newFeedFollow.id));

  return result;
}

export async function getFeedByUrl(url: string) {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));

  return result;
}
export async function getFeedFollowsForUser(userId: string) {
  return await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .innerJoin(feeds, eq(feedFollows.feedId, feeds.id))
    .innerJoin(users, eq(feedFollows.userId, users.id))
    .where(eq(feedFollows.userId, userId));
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const feed = await getFeedByUrl(feedUrl);

  if (!feed) {
    throw new Error(`Feed with URL ${feedUrl} does not exist`);
  }

  await db
    .delete(feedFollows)
    .where(
      and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feed.id)),
    );
}

export async function markFeedFetched(feedId: string): Promise<void> {
  const now = new Date();

  await db
    .update(feeds)
    .set({
      lastFetchedAt: now,
      updatedAt: now,
    })
    .where(eq(feeds.id, feedId));
}

export async function getNextFeedToFetch() {
  const [feed] = await db
    .select()
    .from(feeds)
    .orderBy(sql`${feeds.lastFetchedAt} ASC NULLS FIRST`)
    .limit(1);

  return feed;
}
