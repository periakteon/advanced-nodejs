import fs from "fs";
import http from "http";

const server = http.createServer();

server.on('request', (req, res) => {
  const src = fs.createReadStream('./big.file');
  src.pipe(res);
});

server.listen(8000);

// import fs from "fs";
// import http from "http";

// const server = http.createServer();

// server.on('request', (req, res) => {
//   fs.readFile('./big.file', (err, data) => {
//     if (err) throw err;
  
//     res.end(data);
//   });
// });

// server.listen(8000);