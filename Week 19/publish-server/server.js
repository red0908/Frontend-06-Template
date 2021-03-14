let Http = require('http')
let Https = require('https')
let fs = require('fs')
let unzipper  = require('unzipper')
let querystring = require('querystring')

// 2. auth路由：接受code,用code+client_id + client_secret换token
function auth (request, response) {
  let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/)[1])
  getToken(query.code, function (info) {
    console.log(info)
    response.write(`<a
     style="font-size:25px"
     href="http://localhost:8083/?access_token=${info.access_token}">publish</a>`)
    response.end()
  })
}
function getToken (code, callback) {
  let request = Https.request({
    hostname: 'github.com',
    path: `/login/oauth/access_token?code=${code}&client_id=Iv1.7cf0dcf97bc177de&client_secret=70ec8c116fac88816b0e03f0c0f93537be056d91`,
    port: 443,
    method: 'POST'
  }, function (response) {
    let body = ''
    console.log(response)
    response.on('data', chunk => {
      body += chunk.toString()
    })
    response.on('end', () => {
      callback(querystring.parse(body))
    })
  })
  request.end()
}
// 4. publish路由：用token获取用户信息，检查权限，接受发布
function publish (request, response) {
  let query = querystring.parse(request.url.match(/^\/publish\?([\s\S]+)$/)[1])
  getUser(query.access_token, info => {
    if (info.login === 'red0908') {
      request.pipe(unzipper.Extract({path: '../server/public/'}))
      request.on('end', function () {
        console.log('end')
        response.end('success!')
      })
    }
  })
}
function getUser (access_token, callback) {
  let request = Https.request({
    hostname: 'api.github.com',
    path: '/user',
    port: 443,
    method: 'GET',
    headers: {
      'Authorization': `token ${access_token}`,
      'User-Agent': 'tong-toy-publish'
    }
  }, function (response) {
    let body = ''
    response.on('data', chunk => {
      body += chunk.toString()
    })
    response.on('end', () => {
      callback(JSON.parse(body))
    })
  })
  request.end()
}

Http.createServer(function (request, response) {

  /********实现多文件发布***********/ 
  // let outFile = fs.createWriteStream('../server/public/tmp.zip')
  // request.pipe(outFile)

  // request.pipe(unzipper.Extract({path: '../server/public/'}))


  /********用GitHub oAuth做一个登录实例***********/ 

  if (request.url.match(/^\/auth\?/))
    return auth(request, response)
  if (request.url.match(/^\/publish\?/))
    return publish(request, response)
  // {
  //     request.pipe(unzipper.Extract({path: '../server/public/'}))
  //     // return publish(request, response)
  //     request.on('end', function () {
  //       console.log('end')
  //       response.end('success!')
  //     })
  //   }
  
  // request.on('data', chunck => {
  //   outFile.write(chunck)
  //   console.log(chunck.toString());
  // })
  // request.on('end', () => {
  //   outFile.end()
  //   response.end('success')
  // })
}).listen(8082)