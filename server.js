/**
 * Production server — serves the Vite SPA build from /dist
 * Hostinger: start command = `npm start` (runs this file)
 */
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const documentRoot = path.join(__dirname, "dist");
const indexHtmlPath = path.join(documentRoot, "index.html");

const app = new Hono();

app.use("/*", serveStatic({ root: documentRoot }));

app.get("*", (c) => {
  if (!fs.existsSync(indexHtmlPath)) {
    return c.text(
      "Build output not found. Run `npm run build` before `npm start`.",
      500,
    );
  }
  return c.html(fs.readFileSync(indexHtmlPath, "utf-8"));
});

const port = Number(process.env.PORT) || 3000;
console.log(`Server listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
