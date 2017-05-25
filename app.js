let express = require('express');
let path = require('path');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');  
let cookieParser = require('cookie-parser');
let session = require('express-session');                   
let mongoStore = require('connect-mongo')(session);    
let favicon = require('serve-favicon');

let port = process.env.PORT || 8000;
let dbUrl = 'mongodb://zyc:blog@127.0.0.1:27017/blog';
mongoose.Promise = global.Promise;
mongoose.connect(dbUrl);

let app = express();

app.set('views', './view')                // 设置视图的目录
app.set('view engine', 'pug');             // 设置视图的引擎
// app.set('view engine', 'jade');             // 设置视图的引擎
// app.use(express.static(path.join(__dirname, './view')));       // 需要将./view 目录添加到静态资源目录中，否则请求 127.0.0.1:8000/home/home.css 等静态资源会请求不到。。。注意！！后续需要将静态资源都转移到 /www/static 下
app.use(express.static(path.join(__dirname, './www/static'), {
  maxAge: '365d',
})); // 将 ./www/static 添加到静态资源目录中
app.use(bodyParser.urlencoded({extended: true}));          // 查看 body-parser 的配置
app.use(favicon(__dirname + '/www/static/img/favicon.ico'));
app.use(cookieParser());
app.use(session({
  secret: 'zyc',
  resave: false,
  saveUninitialized: true,
  store: new mongoStore({
      url: dbUrl,
      collection: 'sessions',
  }),
}))

app.locals.moment = require('moment');

app.listen(port);

require('./app/config/route')(app);