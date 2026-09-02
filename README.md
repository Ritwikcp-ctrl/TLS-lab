# TLS / HTTPS Learning Lab

A hands-on networking project to understand **TLS, HTTPS, certificates, Certificate Authorities, key exchange, symmetric encryption, and secure communication** using Node.js and OpenSSL.

The goal is not simply to use HTTPS, but to understand what happens underneath when a client connects to a server such as:

```text
https://chatgpt.com
```

---

# 1. What is the problem TLS solves?

Suppose a client sends:

```http
POST /login HTTP/1.1

username=alice&password=secret
```

Without TLS, the HTTP data travels as plaintext.

Conceptually:

```text
Client
  │
  │ username=alice
  │ password=secret
  ▼
 Network
  │
  ▼
Server
```

Someone capable of observing the traffic could potentially read or tamper with it.

TLS provides three important security properties:

```text
                TLS
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
Confidentiality Integrity Authentication
```

### Confidentiality

Attackers observing network traffic should not be able to read the application data.

### Integrity

Attackers should not be able to modify the data without detection.

### Authentication

The client can verify the identity represented by the server certificate.

---

# 2. Where TLS fits

For HTTP/1.1 and HTTP/2:

```text
┌─────────────────────┐
│      HTTP           │
├─────────────────────┤
│      TLS            │
├─────────────────────┤
│      TCP            │
├─────────────────────┤
│       IP            │
├─────────────────────┤
│ Ethernet / Wi-Fi    │
└─────────────────────┘
```

Therefore:

```text
HTTPS = HTTP over TLS
```

HTTP is responsible for the application protocol.

TCP is responsible for reliable byte transport.

TLS provides cryptographic security between the application and transport layers.

---

# 3. What happens when a browser opens an HTTPS URL?

Suppose the user enters:

```text
https://agrichain.com
```

A simplified sequence is:

```text
Browser
   │
   │ DNS
   ▼
IP address of agrichain.com
   │
   ▼
TCP 3-way handshake
   │
   ▼
TLS handshake
   │
   ├── Server authentication
   │
   ├── Key agreement
   │
   └── Session keys
   │
   ▼
Encrypted HTTP communication
```

So the browser does not immediately send the HTTP request.

It first establishes a secure TLS session.

---

# 4. Why does the server send a certificate?

The browser needs to answer:

> "Who am I actually talking to?"

Suppose the browser connects to:

```text
https://agrichain.com
```

The server sends a certificate containing information such as:

```text
Certificate
├── Domain identity
├── Public key
├── Validity period
├── Issuer
├── Usage / constraints
└── Digital signature
```

The certificate essentially binds:

```text
agrichain.com
      ↕
server public key
```

The important idea is:

> A certificate is not the symmetric encryption key for the connection.

Its main purpose here is **authentication and identity binding**.

---

# 5. What does the client verify?

When the client receives the certificate, it performs certificate/path validation.

Conceptually:

```text
Server certificate
       │
       ▼
Intermediate CA
       │
       ▼
Trusted Root CA
       │
       ▼
Client trust store
```

The client performs checks such as:

```text
✓ Hostname matches
✓ Certificate is currently valid
✓ Certificate signatures are valid
✓ Certificate chain leads to a trusted root
✓ Certificate is appropriate for server authentication
✓ Relevant constraints and policies are valid
✓ Revocation/status checks may be performed
```

If the necessary checks succeed, the client can accept the server's identity for the TLS connection.

---

# 6. Does the browser already know every website?

No.

The browser does NOT have a certificate for every website.

Instead, the client already has a collection of trusted Root CA certificates.

Conceptually:

```text
Client / OS
│
└── Trust Store
    ├── Root CA A
    ├── Root CA B
    ├── Root CA C
    └── Root CA D
```

The client trusts those roots as **trust anchors**.

A website's certificate can therefore be validated through a chain:

```text
agrichain.com certificate
        │
        │ signed by
        ▼
Intermediate CA
        │
        │ signed by
        ▼
Trusted Root CA
        │
        ▼
Client trust store
```

The client does not need to know `agrichain.com` beforehand.

---

# 7. Why does the client trust the Root CA?

This is the foundation of the Web PKI.

Cryptography can prove:

```text
"This certificate was signed by this CA."
```

But cryptography alone cannot prove:

```text
"This CA is trustworthy."
```

That initial decision is a **trust decision made by the software/platform**.

Operating systems and browsers maintain trust stores containing Root CAs they choose to trust.

Therefore:

```text
Trust store
    ↓
Trusted Root CA
    ↓
Intermediate CA
    ↓
Website certificate
```

The Root CA is the **trust anchor**.

---

# 8. Who controls the CAs?

There is no single organization controlling every CA.

There are several major participants:

```text
Certificate Authorities
├── Let's Encrypt / ISRG
├── DigiCert
├── Sectigo
├── GlobalSign
└── others

Root-store operators
├── Mozilla
├── Apple
├── Microsoft
├── Google / Chrome
└── others
```

Industry requirements are also influenced by organizations such as the **CA/Browser Forum**.

The important relationship is:

```text
Root-store operator
        │
        │ trusts
        ▼
Root CA
        │
        ▼
Intermediate CA
        │
        ▼
Website certificate
```

A CA does not receive permission from a central "Internet authority" to issue every certificate.

For a domain such as `agrichain.com`, the domain owner proves control of the domain to the CA, and the CA issues the certificate according to its policies and applicable requirements.

---

# 9. Does the server and client have the same Root CAs?

Not necessarily.

Each machine/application can have its own trust store.

```text
CLIENT                         SERVER
────────                       ────────
Trust Store                   Trust Store
├── Root A                    ├── Root X
├── Root B                    ├── Root Y
└── Root C                    └── Root Z
```

A normal HTTPS server does not need to trust its own certificate.

The server's trust store becomes important when the server itself acts as a TLS client.

For example:

```text
Backend A
   │
   │ HTTPS
   ▼
Backend B
```

Backend A needs to verify Backend B's certificate.

---

# 10. What does the server actually have?

A typical TLS server has:

```text
Server
├── Private key
├── Server certificate
└── Intermediate certificate(s)
```

The private key must remain secret.

The certificate can be sent to clients.

Conceptually:

```text
SERVER

Private key
    │
    └── SECRET

Certificate
    │
    └── sent during TLS handshake
```

---

# 11. What happens when Agrichain goes to production?

Suppose:

```text
https://agrichain.com
```

You would typically:

```text
1. Register agrichain.com
2. Configure DNS
3. Prove control of the domain to a CA
4. Obtain a TLS certificate
5. Install the certificate and private key on the server
6. Configure HTTPS
7. Renew the certificate automatically
```

You do NOT directly sign your website certificate with a Root CA private key.

The typical public PKI hierarchy is:

```text
Trusted Root CA
      │
      ▼
Intermediate CA
      │
      ▼
agrichain.com certificate
```

---

# 12. Symmetric encryption

Once the secure session is established, the actual application traffic is protected using symmetric cryptography.

Symmetric encryption uses secret key material shared by both sides.

Conceptually:

```text
Plaintext
    │
    ▼
Encryption + key
    │
    ▼
Ciphertext
    │
    ▼
Decryption + key
    │
    ▼
Plaintext
```

Examples of modern symmetric encryption include:

```text
AES-GCM
ChaCha20-Poly1305
```

Symmetric encryption is efficient for large amounts of application data.

---

# 13. Why don't we use asymmetric encryption for all HTTP data?

Asymmetric cryptography is comparatively expensive for bulk data.

TLS therefore uses a hybrid approach:

```text
Handshake
   │
   ├── Asymmetric cryptography
   │
   ├── Authentication
   │
   └── Key agreement
   │
   ▼
Symmetric traffic keys
   │
   ▼
Actual HTTP traffic
```

This gives the security benefits of asymmetric cryptography while using efficient symmetric cryptography for the data transfer.

---

# 14. How is the symmetric key established?

A common beginner explanation is:

> "The server sends the symmetric key encrypted with its public key."

That is not the correct mental model for modern TLS 1.3.

Modern TLS normally uses an ephemeral Diffie-Hellman key agreement, typically ECDHE.

The simplified idea is:

```text
CLIENT                         SERVER

temporary private key          temporary private key
temporary public key           temporary public key

       public key ────────────>
                 <──────────── public key

       │                            │
       ▼                            ▼
derive shared secret          derive shared secret

        SAME SHARED SECRET
```

The private values are never sent across the network.

An observer can see the public key-exchange values but cannot practically derive the shared secret.

---

# 15. Why is ECDHE called "ephemeral"?

The key-exchange keys are temporary.

Conceptually:

```text
Connection 1
    ↓
temporary keys

Connection 2
    ↓
different temporary keys

Connection 3
    ↓
different temporary keys
```

This contributes to **forward secrecy**.

If the server's long-term private key is compromised later, previously recorded TLS sessions should not automatically become decryptable when ephemeral key exchange has been used correctly.

---

# 16. How does the certificate relate to ECDHE?

These are two different jobs.

```text
CERTIFICATE
     ↓
"Who is this server?"

ECDHE
     ↓
"What shared secret can we use?"
```

The server certificate contains the server's long-term public-key identity.

The ephemeral ECDHE keys are used for the connection's key agreement.

So:

```text
Certificate
     ↓
Authentication

ECDHE
     ↓
Key agreement

Derived traffic keys
     ↓
Encryption
```

---

# 17. How does the server prove it owns the certificate's private key?

Suppose the certificate binds:

```text
agrichain.com
      ↕
public key
```

The server must also prove that it actually possesses the corresponding private key.

It does this through a cryptographic signature during the handshake.

Conceptually:

```text
Certificate
"This public key belongs to agrichain.com."

Server
"I possess the corresponding private key."

Client
"Verify the cryptographic proof."

                   ↓
                  ✓
```

This prevents someone from simply copying a legitimate certificate and pretending to be the real server.

---

# 18. Simplified TLS 1.3 handshake

A simplified mental model is:

```text
CLIENT                                      SERVER

ClientHello
+ supported options
+ key-share information
────────────────────────────────────────────>

                                  ServerHello
                                  + key-share
                                  + certificate
                                  + authentication proof
                          <──────────────────

Validate certificate
Validate server proof

      derive shared secret ←────→ derive shared secret

             ↓                          ↓
        derive traffic keys

       encrypted handshake messages
       <────────────────────────────>

       ===== encrypted HTTP =====
       <────────────────────────────>
```

The real TLS 1.3 handshake contains more detail, but this captures the main concepts.

---

# 19. What happens after the handshake?

Once the handshake succeeds:

```text
TLS handshake
      ↓
traffic keys established
      ↓
encrypted application data
```

Suppose the browser wants to send:

```http
POST /login HTTP/1.1

username=alice&password=secret
```

The flow is:

```text
Browser
   ↓
HTTP request
   ↓
TLS encryption
   ↓
Encrypted TLS records
   ↓
TCP
   ↓
Network
   ↓
Server
   ↓
TLS decryption
   ↓
HTTP request
   ↓
Backend application
```

The server application ultimately receives the decrypted HTTP data.

---

# 20. Is the data encrypted everywhere?

No.

TLS primarily protects **data in transit**.

The simplified lifecycle is:

```text
Browser
   │
   │ plaintext inside browser
   ▼
TLS encryption
   │
   │ encrypted over network
   ▼
TLS decryption
   │
   ▼
Server application
   │
   ▼
Database / storage
```

So:

```text
TLS
 ↓
protects data in transit

Database encryption
 ↓
protects data at rest
```

These solve different security problems.

---

# 21. Why does the browser not send a certificate?

Normal HTTPS generally provides **server authentication**.

The typical flow is:

```text
Server
  │
  │ certificate + authentication proof
  ▼
Client
```

The client generally does not present a certificate for an ordinary website.

User authentication usually happens through mechanisms such as:

```text
password
session cookie
OAuth
access token
```

There is also **mutual TLS (mTLS)** where both sides authenticate using certificates:

```text
Client certificate ─────────→ Server
Server certificate ─────────→ Client
```

---

# 22. HTTP vs HTTPS

Plain HTTP:

```text
HTTP
 ↓
TCP
 ↓
IP
```

HTTPS:

```text
HTTP
 ↓
TLS
 ↓
TCP
 ↓
IP
```

With plain HTTP, the application data can be visible in plaintext on the network.

With HTTPS:

```text
HTTP
 ↓
TLS encryption
 ↓
TCP
 ↓
IP
```

The network carries encrypted TLS records instead.

---

# 23. How TLS relates to the networking concepts from this project

Earlier we learned:

```text
TCP
 ↓
socket
 ↓
HTTP/1.1
 ↓
HTTP/2
```

TLS fits into that architecture:

```text
HTTP/1.1
    ↓
   TLS
    ↓
   TCP
    ↓
   IP
```

For HTTP/2:

```text
HTTP/2
   ↓
  TLS
   ↓
  TCP
```

For HTTP/3:

```text
HTTP/3
   ↓
  QUIC
   ↓
  UDP
```

QUIC incorporates TLS 1.3 cryptographic mechanisms into its connection establishment rather than using TLS as a separate layer over TCP in the same way.

---

# 24. Local TLS experiment

For development, this project uses a self-signed certificate.

Generate one with:

```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout cert/server.key \
  -out cert/server.crt \
  -days 365 \
  -subj "/CN=localhost"
```

This gives:

```text
cert/
├── server.key
└── server.crt
```

The certificate is self-signed:

```text
localhost certificate
        ↓
signed by itself
```

It is useful for learning but is not equivalent to a publicly trusted production certificate.

---

# 25. Inspect the certificate

Use:

```bash
openssl x509 -in cert/server.crt -text -noout
```

Look for:

```text
Subject
Issuer
Validity
Public Key
Signature Algorithm
```

For the self-signed local certificate:

```text
Subject = localhost
Issuer  = localhost
```

---

# 26. Run the HTTPS server

Example Node.js server:

```js
const https = require("node:https");
const fs = require("node:fs");

const options = {
    key: fs.readFileSync("cert/server.key"),
    cert: fs.readFileSync("cert/server.crt"),
};

const server = https.createServer(options, (req, res) => {
    console.log("HTTPS request received");
    console.log("Method:", req.method);
    console.log("Path:", req.url);

    res.writeHead(200, {
        "Content-Type": "text/plain",
    });

    res.end("Hello from HTTPS\n");
});

server.listen(8443, "127.0.0.1", () => {
    console.log("HTTPS server listening on https://127.0.0.1:8443");
});
```

---

# 27. Test with curl

Because the certificate is self-signed:

```bash
curl -k -v https://127.0.0.1:8443/hello
```

The `-k` option tells curl not to enforce normal certificate trust verification for this local experiment.

Do not use this as a production configuration.

---

# 28. Inspect the handshake with OpenSSL

Start the server:

```bash
node src/https-server.js
```

Then:

```bash
openssl s_client -connect 127.0.0.1:8443
```

OpenSSL acts as the client.

You can inspect:

```text
Certificate
Certificate chain
TLS protocol
Cipher
Verification result
```

For example:

```text
Protocol : TLSv1.3
Cipher   : ...
```

The exact values can vary.

---

# 29. Why does OpenSSL show a verification error?

Because our local certificate is self-signed.

By default:

```text
Server certificate
      ↓
self-signed
      ↓
not anchored in the normal trust store
```

So OpenSSL may report a verification error.

You can explicitly trust your local certificate:

```bash
openssl s_client \
  -connect 127.0.0.1:8443 \
  -CAfile cert/server.crt
```

Now the certificate is explicitly provided as a trust anchor for this experiment.

This demonstrates an important difference:

```text
Receiving a certificate
          ≠
Trusting the certificate
```

---

# 30. Inspect a Node.js TLS connection

Example:

```js
const https = require("node:https");

const options = {
    hostname: "127.0.0.1",
    port: 8443,
    path: "/hello",
    method: "GET",

    // Only for the self-signed local lab.
    rejectUnauthorized: false,
};

const request = https.request(options, (response) => {
    console.log("Status:", response.statusCode);

    response.on("data", (chunk) => {
        console.log("Body:", chunk.toString());
    });

    response.on("end", () => {
        console.log("Response finished");
    });
});

request.on("socket", (socket) => {
    socket.on("secureConnect", () => {
        console.log("TLS connection established");

        console.log("Protocol:", socket.getProtocol());
        console.log("Cipher:", socket.getCipher());

        const certificate = socket.getPeerCertificate();

        console.log("Certificate subject:", certificate.subject);
        console.log("Certificate issuer:", certificate.issuer);
    });
});

request.on("error", (error) => {
    console.error("Request error:", error.message);
});

request.end();
```

The important operations are:

```text
socket.getProtocol()
        ↓
TLS version

socket.getCipher()
        ↓
negotiated cryptographic cipher

socket.getPeerCertificate()
        ↓
server certificate
```

---

# 31. A complete HTTPS mental model

When you visit:

```text
https://agrichain.com
```

think:

```text
                     HTTPS

                    Browser
                       │
                       │ DNS
                       ▼
                 IP address
                       │
                       ▼
                TCP handshake
                       │
                       ▼
                 TLS handshake
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      Server certificate     Key agreement
             │                   │
             ▼                   ▼
        Verify identity     Shared secret
             │                   │
             └─────────┬─────────┘
                       ▼
               Traffic keys
                       │
                       ▼
              Encrypted HTTP
                       │
                       ▼
                  Backend
```

---

# 32. The concepts to remember for backend interviews

### Certificate

```text
Identity ↔ Public key
```

### Root CA

```text
Trust anchor
```

### Certificate chain

```text
Server certificate
       ↓
Intermediate CA
       ↓
Trusted Root CA
```

### ECDHE

```text
Key agreement
```

### Symmetric encryption

```text
Actual application data protection
```

### TLS

```text
Authentication
+
Key establishment
+
Confidentiality
+
Integrity
```

### HTTPS

```text
HTTP over TLS
```

---

# 33. The entire process in one diagram

```text
                         USER
                          │
                          │
                 https://agrichain.com
                          │
                          ▼
                         DNS
                          │
                          ▼
                    Server IP
                          │
                          ▼
                  TCP 3-Way Handshake
                          │
                SYN → SYN-ACK → ACK
                          │
                          ▼
                    TLS Handshake
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
    Server Certificate                ECDHE
          │                               │
          ▼                               ▼
   Certificate Chain               Key Agreement
          │                               │
          ▼                               ▼
    Trusted Root CA                Shared Secret
          │                               │
          └───────────────┬───────────────┘
                          ▼
                  Traffic Keys Created
                          │
                          ▼
                  Symmetric Encryption
                          │
                          ▼
                   Encrypted HTTP
                          │
                          ▼
                       Backend
                          │
                          ▼
                      Database
```

---

# 34. Project progression

This lab should be built in this order:

```text
1. Plain HTTP server
        ↓
2. Self-signed certificate
        ↓
3. HTTPS server
        ↓
4. Node.js HTTPS client
        ↓
5. Certificate inspection
        ↓
6. OpenSSL s_client
        ↓
7. Certificate verification
        ↓
8. Trust store understanding
        ↓
9. TLS handshake inspection
        ↓
10. Symmetric session-key concept
        ↓
11. Packet inspection
        ↓
12. Compare HTTP vs HTTPS
```

The long-term goal is to understand the complete path:

```text
Application
    ↓
HTTP
    ↓
TLS
    ↓
TCP
    ↓
IP
    ↓
Network
```

rather than treating HTTPS as a black box.
