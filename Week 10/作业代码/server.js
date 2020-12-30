const http = require('http')

http.createServer((request, response) => {
  let body = []
  request.on('error', (err) => {
    console.log(err)
  }).on('data', (chuck) => {
    body.push(chuck)
  }).on('end', () => {
    body = Buffer.concat(body).toString()
    console.log('body', body)
    response.writeHead(200, {'Content-Type': 'text/html'})
    response.end(`<html lang="en">
<head>
  <title>Document</title>
  <style>
    body {
      background-color: rgb(0,0,0);
    }
    #container {
      width: 500px;
      height: 300px;
      display: flex;
      background-color: rgb(255,255,255);
    }
    #container #a {
      width: 200px;
      height: 100px;
      background-color: rgb(255,0,0);
    }
    #container #b {
      flex: 1;
      background-color: rgb(0,255,0);
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="a"></div>
    <div id="b"></div>
  </div>
</body>
</html>`)
  })
}).listen(8080, function () {
  console.log("server start 8080");
})
