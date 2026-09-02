const https = require("node:https");
const fs = require("node:fs");

const options = {
  key: fs.readFileSync("cert/server.key"),
  cert: fs.readFileSync("cert/server.crt"),
};

const server = https.createServer(options, (req, res) => {
  console.log("HTTPS request received");
  console.log("Method:", req.method);
  console.log("Path :", req.url);

  res.writeHead(200, {
    "Content-Type": "text/plain",
  });
  res.end("Hello form HTTPS\n");
});

server.listen(8443, "127.0.0.1", () => {
  console.log("HTTPS server running on https://127.0.0.1:8443");
});
