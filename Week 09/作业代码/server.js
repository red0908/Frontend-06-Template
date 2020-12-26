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
    body #id {
      width: 100%;
      height: 100%;
    }
    body .a {
      display: inline-block;
    }
    div#name.a.b.c {
      color:red;
    }
    .d#name.a.b.c {
      color:red;
    }
  </style>
</head>
<body>
  <div id="id" class="a b">Hellow world!</div>
  <div id="name" class="a b c d">${body}</div>
</body>
</html>`)
  })
}).listen(8080, function () {
  console.log("server start 8080");
})
