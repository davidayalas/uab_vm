const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
   '.html': 'text/html',
   '.js':   'application/javascript',
   '.css':  'text/css',
   '.json': 'application/json',
   '.png':  'image/png',
   '.jpg':  'image/jpeg',
   '.jpeg': 'image/jpeg',
   '.gif':  'image/gif',
   '.svg':  'image/svg+xml',
   '.ico':  'image/x-icon',
   '.txt':  'text/plain'
};

const server = http.createServer((req, res) => {
   let filePath = '.' + decodeURIComponent(req.url);
   if (filePath === './') filePath = './index.html';
   const ext = path.extname(filePath).toLowerCase();
   const contentType = mimeTypes[ext] || 'application/octet-stream';
   fs.readFile(filePath, (err, content) => {
       if (err) {
           res.writeHead(404, {'Content-Type': 'text/plain'});
           res.end('404 Not Found');
       } else {
           res.writeHead(200, {'Content-Type': contentType});
           res.end(content);
       }
   });
});

const PORT = 3000;
server.listen(PORT, () => {
   console.log(`Servidor escoltant a http://localhost:${PORT}`);
});


