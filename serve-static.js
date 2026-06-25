const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 5173;
const root = path.join(__dirname, "public");
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "text/javascript",
  ".json": "application/json"
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);

    if (urlPath === "/" || urlPath === "") {
      urlPath = "/index.html";
    }

    const filePath = path.join(root, urlPath);

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end("Not found");
      }

      res.writeHead(200, {
        "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
      });
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`Frontend running at http://localhost:${port}`);
  });
