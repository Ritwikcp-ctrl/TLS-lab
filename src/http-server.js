const http = require("node:http");

const server = http.createServer((req,res)=> {
    console.log("HTTP request received");
    console.log("Mehtod :",req.method);
    console.log("Path :",req.url);

    res.writeHead(200, {
        "Content-type": "text/plain",
    });

    res.end("hello form HTTP\n");
});

server.listen(8080,"127.0.0.1",() => {
    console.log("HTTP server running on http://127.0.0.1:8080");
})