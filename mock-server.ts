import http from "http";

http.createServer((req, res) => {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    console.log("📨 Agnost received event:");
    console.log(JSON.parse(body));
    res.writeHead(200);
    res.end("ok");
  });
}).listen(3000, () => {
  console.log("Mock server running on http://localhost:3000");
});