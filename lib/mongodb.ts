import mongoose, { Connection, Mongoose } from "mongoose";

/**
 * Application-wide MongoDB connection handling for a Next.js app using Mongoose.
 *
 * This module:
 * - Uses a singleton-style cached connection to avoid creating multiple
 *   connections in development (where modules are hot-reloaded).
 * - Exposes a typed `connectToDatabase` function that you can call from
 *   API routes, server components, or server actions.
 */

// Shape of the cached connection object we keep on `globalThis` to persist
// across hot reloads in development.
interface MongooseCached {
  conn: Connection | null;
  promise: Promise<Mongoose> | null;
}

// Extend the Node.js global type definition so TypeScript knows about our
// `mongoose` property on `globalThis`. This avoids using `any`.
declare global {
  // `var` is required here to correctly merge with the global scope.
  // eslint-disable-next-line no-var
  var _mongooseCached: MongooseCached | undefined;
}

// Initialize the cached connection container on first import.
// In production, this will only run once. In development, it will survive
// across module reloads thanks to `globalThis`.
const cached: MongooseCached = global._mongooseCached ?? {
  conn: null,
  promise: null,
};

if (!global._mongooseCached) {
  global._mongooseCached = cached;
}

// Read the MongoDB connection string from environment variables.
// Make sure to define `MONGODB_URI` in your environment (.env.local, etc.).
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in your environment (e.g. .env.local).",
  );
}

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * Usage example (in a route handler or server action):
 * ```ts
 * await connectToDatabase();
 * // Now you can safely use your Mongoose models
 * ```
 */
export async function connectToDatabase(): Promise<Connection> {
  // If we already have an active connection, reuse it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already in progress, await it instead of creating a
  // new one. This prevents race conditions on cold start.
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI)
      .then((mongooseInstance: Mongoose) => mongooseInstance);
  }

  const mongooseInstance = await cached.promise;

  // Store the underlying connection for future reuse.
  cached.conn = mongooseInstance.connection;

  return cached.conn;
}

/**
 * Helper to get the current connection if it exists, without triggering
 * a new connection attempt.
 *
 * This can be useful in advanced scenarios, but most callers should
 * prefer `connectToDatabase`.
 */
export function getCurrentConnection(): Connection | null {
  return cached.conn;
}
