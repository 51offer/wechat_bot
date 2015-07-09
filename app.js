var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var contact_bot = require('./routes/contact_bot');
var cloud = require('./cloud');
var xml2js = require('xml2js');

var app = express();


function xmlBodyParser(req, res, next) {
    // if (req.body) return next();
    // req.body = req.body || {};
 
    // ignore GET
    // if ('GET' == req.method || 'HEAD' == req.method) return next();
 
    // // check Content-Type
    if ('text/xml' != req.get('Content-Type')) return next();
 
    // flag as parsed
    req._body = true;
 
    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){  
      var parseString = xml2js.parseString;
      parseString(buf, function(err, json) {
        if (err) {
            err.status = 400;
            next(err);
        } else {
            req.body = json;
            next();
        }
      });
    });
};



// 设置 view 引擎
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// 加载云代码方法
app.use(cloud);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(xmlBodyParser);
app.use(cookieParser());

app.get('/', function(req, res) {
  res.render('index', { currentTime: new Date() })
})

// 可以将一类的路由单独保存在一个文件中
app.use('/contact_bot', contact_bot);

// 如果任何路由都没匹配到，则认为 404
// 生成一个异常让后面的 err handler 捕获
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// 如果是非开发环境，则页面只输出简单的错误信息
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
