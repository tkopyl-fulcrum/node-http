const http = require("node:http");

const port = process.env.PORT || 3000;

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

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(port, () => console.log(`Listening on ${port}`));