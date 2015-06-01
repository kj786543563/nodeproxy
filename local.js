var http = require('http');
var url = require('url');
//创建http服务器
http.createServer(function (req, res) {
    //获得请求body
    var start_time = new Date;
    var body = '';
    console.log(req.headers);
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', function () {
        //代理请求
        var request_url='http://node-proxy-001.herokuapp.com';
        //var request_url = 'http://localhost:8088';
        var option = url.parse(request_url);
        //发送header
        req.headers.host = option.host;
        req.headers.fetchurl = req.url;//设置fetchUrl
        delete req.headers['accept-encoding'];//不进行压缩，在cloudfoundry上面压缩时访问google会出问题
        option.method = req.method;
        option.headers = req.headers;
        http.request(option, function (result) {
            //打出日志
            console.log('\033[90m' + req.url + '\t\033[33m' + result.statusCode + '\t\033[36m' + (new Date - start_time) + 'ms \033[0m');
            //设置header
            for (var key in result.headers) {
                res.setHeader(key, result.headers[key]);
            }
            result.on('data', function (chunk) {
                res.write(chunk);
            });
            result.on('end', function () {
                res.end();
            });
        }).on('error', function (error) {
            res.end('remote http.request error' + error)
        }).end(body);

    });
}).listen(8787);