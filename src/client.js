const https = require("node:https");


const options = {
  hostname: "127.0.0.1",
  port: 8443,
  path: "/hello",
  method: "GET",

  rejectUnauthorized: false,
};

const request = https.request(options, (response) => {
  console.log("Status :", response.statusCode);

  response.on("data", (chunk) => {
    console.log("Body :", chunk.toString());
  });
  response.on("end", () => {
    console.log("Response finished");
  });
});

request.on("socket", (socket) => {
  socket.on("secureConnect", () => {
    console.log("\nTLS connection established ");
    console.log("TLS version :", socket.getProtocol());
    console.log("Cipher:", socket.getCipher());

    const certificate = socket.getPeerCertificate();

    console.log("Certificate subject :", certificate.subject);
    console.log("Certificate issuer:", certificate.issuer);
  });
  request.on("error", (error) => {
    console.error("Request error:", error.message);
  });
});

request.end();



/*  

When the client connects, TLS happens first. The server presents its certificate during the TLS handshake. After the handshake succeeds and session keys are established, the client sends HTTP requests and receives HTTP responses through that encrypted TLS connection.

*/