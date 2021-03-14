let Http = require('http')
let fs = require('fs')
let querystring = require('querystring')
let archiver = require('archiver')
let child_process = require('child_process')
/*******************实现多文件发布****************************/
/*let request = Http.request({
  hostname: '127.0.0.1',
  port: 8082,
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream',
    // 'Content-Length': stats.size
  }
},
  response => {
  console.log(response)
})
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level.
});
archive.directory('./simple/', false)
archive.finalize()
archive.pipe(request)
*/


/*******************用GitHub oAuth做一个登录实例****************************/
//1. 打开 https://github.com/login/oath/authorize
child_process.exec(`open https://github.com/login/oauth/authorize?client_id=Iv1.7cf0dcf97bc177de`)

//2. 创建server, 接受token，后点击发布
Http.createServer(function (res, req) {
  let query = querystring.parse(res.url.match(/^\/\?([\s\S]+)$/)[1])
  publish(query.access_token, req)
}).listen(8083)
function publish (access_token, req) {
  let archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  archive.directory('./simple/', false)
  archive.finalize()
  console.log(archive)
  let request = Http.request({
    hostname: '127.0.0.1',
    path: '/publish?access_token=' + access_token,
    port: 8082,
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      // 'Content-Length': stats.size
    }
  },
    response => {
      // req.end()
  })
  archive.pipe(request)
}
/***********************************************/
// let file = fs.createReadStream('./tmp.zip')
// file.pipe(request)

// file.on('end', () => request.end())
// fs.stat('./simple.html', (err, stats) => {

// })

// file.on('data', chunck => {
//   request.write(chunck)
// })
// file.on('end', chunck => {
//   console.log('read finish');
//   request.end(chunck)
// })

// let request = Http.request({
//   hostname: '127.0.0.1',
//   path: '/publish?access_token=1',
//   port: 8082,
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/octet-stream',
//     // 'Content-Length': stats.size
//   }
// },
//   response => {
//     req.end()
// })
// const archive = archiver('zip', {
//   zlib: { level: 9 } // Sets the compression level.
// });
// archive.directory('./simple/', false)
// archive.finalize()
// console.log(archive)
// archive.pipe(request)
