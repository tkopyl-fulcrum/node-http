const http = require("node:http");
const { Client: PgClient } = require("pg");
const { createClient: createRedisClient } = require("redis");

const port = process.env.PORT || 3000;

const pg = new PgClient({ connectionString: process.env.DATABASE_URL });
const redis = createRedisClient({ url: process.env.REDIS_URL });

async function init() {
  await pg.connect();
  await redis.connect();

  const server = http.createServer(async (req, res) => {
    const url = (req.url || "").split("?")[0];

    if (req.method === "GET" && url === "/") {
      res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
      return res.end("OK");
    }

    if (req.method === "GET" && url === "/health") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      return res.end(JSON.stringify({ status: "ok" }));
    }

    if (req.method === "GET" && url === "/db") {
      try {
        await pg.query("SELECT 1 AS ok");
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ db: "ok" }));
      } catch (e) {
        res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ db: "fail" }));
      }
    }

    if (req.method === "GET" && url === "/redis") {
      try {
        const pong = await redis.ping();
        res.writeHead(pong === "PONG" ? 200 : 500, { "content-type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ redis: pong }));
      } catch (e) {
        res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
        return res.end(JSON.stringify({ redis: "fail" }));
      }
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  });

  server.listen(port, () => console.log(`Listening on ${port}`));
}

init().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});