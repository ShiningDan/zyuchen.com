let express = require('express');
let path = require('path');
let mongoose = require('mongoose');

let port = process.env.PORT || 8000;

let app = express();

app.set('views', './view')                // 设置视图的目录
app.set('view engine', 'pug');             // 设置视图的引擎
// app.set('view engine', 'jade');             // 设置视图的引擎
app.use(express.static(path.join(__dirname, './view')));       // 需要将./view 目录添加到静态资源目录中，否则请求 127.0.0.1:8000/home/home.css 等静态资源会请求不到。。。注意！！后续需要将静态资源都转移到 /www/static 下
app.use(express.static(path.join(__dirname, './www/static'))); // 将 ./www/static 添加到静态资源目录中

app.listen(port);


require('./app/config/route')(app);