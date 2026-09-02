```
 node src/client.js
       ↓
https.request()
       ↓
Create/connect TCP socket
       ↓
TCP 3-way handshake
       ↓
TLS handshake
       ↓
Server certificate received
       ↓
Certificate verification
       ↓
Key agreement
       ↓
TLS secure connection established
       ↓
HTTP request sent
       ↓
HTTP response received



```