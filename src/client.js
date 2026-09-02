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
  // https.request(options, ...)  -----> Make an HTTPS request to this server.

  response.on("data", (chunk) => {
    console.log("Body :", chunk.toString());
  });
  response.on("end", () => {
    console.log("Response finished");
  });
});

request.on("socket", (socket) => {
    //For this particular HTTP request ,tell me which underlying socket/connection is being used.
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
//finishes the request and allows Node to send it.



/*  

When the client connects, TLS happens first. The server presents its certificate during the TLS handshake. After the handshake succeeds and session keys are established, the client sends HTTP requests and receives HTTP responses through that encrypted TLS connection.


Socket = communication channel; TCP = transport; TLS = secures the channel; HTTP request/response = application data carried through that secure channel.

*/