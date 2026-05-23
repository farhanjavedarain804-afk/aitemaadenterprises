import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import path from "node:path";
import { fileURLToPath } from "node:url";
import worker from "./dist/server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const documentRoot = path.join(__dirname, "dist", "client");

const app = new Hono();

// Serve static client assets built by Vite (Document Root)
app.use("/*", serveStatic({ root: documentRoot }));

// Forward all other requests to the TanStack Start SSR worker
app.all("*", async (c) => {
  return await worker.fetch(c.req.raw, process.env, {
    waitUntil: () => {},
    passThroughOnException: () => {}
  });
});

const port = process.env.PORT || 3000;
console.log(`🚀 Server listening on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});
