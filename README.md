# Gator

Gator is a command-line RSS feed aggregator built with TypeScript, Node.js, PostgreSQL, and Drizzle ORM.

It allows users to register, follow RSS feeds, aggregate posts from those feeds, and browse the latest posts directly from the terminal.

## Requirements

Before running Gator, make sure you have the following installed:

- Node.js 22.15.0 or later
- npm
- PostgreSQL
- Git

## Installation

Clone the repository:

```bash
git clone https://github.com/engbaraakhamaysa/gator.git
cd gator
```

Install the project dependencies:

```bash
npm install
```

## Database Setup

Gator uses PostgreSQL as its database.

Make sure PostgreSQL is running and create a database for the project.

Then create the Gator configuration file:

```text
~/.gatorconfig.json
```

The configuration file must contain the PostgreSQL connection URL:

```json
{
  "db_url": "postgres://username:password@localhost:5432/gator"
}
```

Replace the username, password, host, port, and database name with your PostgreSQL configuration.

Run the database migrations:

```bash
npm run migrate
```

## Running Gator

Start Gator with:

```bash
npm start <command> [arguments]
```

### Register a User

Create a new user:

```bash
npm start register <username>
```

Example:

```bash
npm start register baraa
```

The user is automatically set as the current user.

### Login

Switch to an existing user:

```bash
npm start login <username>
```

Example:

```bash
npm start login baraa
```

### List Users

Display all registered users:

```bash
npm start users
```

### Add a Feed

Add an RSS feed:

```bash
npm start addfeed "<feed name>" "<feed url>"
```

Example:

```bash
npm start addfeed "TechCrunch" "https://techcrunch.com/feed/"
```

The feed is also automatically followed by the current user.

### List Feeds

Display all available feeds:

```bash
npm start feeds
```

### Follow a Feed

Follow an existing feed:

```bash
npm start follow "<feed url>"
```

Example:

```bash
npm start follow "https://techcrunch.com/feed/"
```

### List Followed Feeds

Display the feeds followed by the current user:

```bash
npm start following
```

### Unfollow a Feed

Stop following a feed:

```bash
npm start unfollow "<feed url>"
```

### Aggregate Posts

Fetch posts from the feeds and store them in the database:

```bash
npm start agg <time_between_requests>
```

Example:

```bash
npm start agg 10s
```

Supported time units include:

```text
ms
s
m
h
```

For example:

```bash
npm start agg 5s
npm start agg 1m
```

The aggregator continues running until it receives `Ctrl+C`.

### Browse Posts

Display the latest posts from feeds followed by the current user:

```bash
npm start browse
```

By default, the command displays 2 posts.

You can specify the number of posts:

```bash
npm start browse 10
```

## Development

Type-check the project without generating JavaScript files:

```bash
npx tsc --noEmit
```

Generate database migrations after changing the schema:

```bash
npm run generate
```

Apply database migrations:

```bash
npm run migrate
```

## Tech Stack

- TypeScript
- Node.js
- PostgreSQL
- Drizzle ORM
- fast-xml-parser
- Git / GitHub

## Project Structure

```text
gator/
├── src/
│   ├── db/
│   │   ├── queries/
│   │   └── ...
│   ├── commands.ts
│   ├── config.ts
│   ├── index.ts
│   ├── rss.ts
│   └── schema.ts
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── .nvmrc
└── README.md
```
