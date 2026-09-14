import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { readConfig } from "../config.js";

const config = readConfig();

const client = postgres(config.dbUrl);

export const db = drizzle(client);
