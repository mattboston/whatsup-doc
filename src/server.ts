import { getContainers } from "./docker";
import { join } from "path";

const PORT = parseInt(Bun.env.PORT ?? "3000");
const VERSION = Bun.env.VERSION ?? "unknown";
const PUBLIC_DIR = join(import.meta.dir, "../public");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".css": "text/css",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function mime(path: string) {
  const ext = path.slice(path.lastIndexOf("."));
  return MIME[ext] ?? "application/octet-stream";
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.headers.get("x-whatsup-doc-probe")) {
      return new Response("Alive");
    }

    if (url.pathname === "/about") {
      return new Response(`Version: ${VERSION}`);
    }

    if (url.pathname === "/api/containers") {
      try {
        const containers = await getContainers();
        return Response.json(containers);
      } catch (err) {
        console.error("Docker error:", err);
        return Response.json({ error: String(err) }, { status: 500 });
      }
    }

    const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(join(PUBLIC_DIR, filePath));

    if (await file.exists()) {
      return new Response(file, {
        headers: {
          "Content-Type": mime(filePath),
          "Cache-Control": "no-cache, must-revalidate",
        },
      });
    }

    return new Response(Bun.file(join(PUBLIC_DIR, "index.html")), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, must-revalidate",
      },
    });
  },
});

console.log(`Running on http://localhost:${PORT}`);
