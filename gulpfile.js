let gulp = require('gulp');
let nodemon = require('gulp-nodemon');
// let connect = require('gulp-connect');

gulp.task('server', function() {
  nodemon({
    script: './app.js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'], 
    env: { 'NODE_ENV': 'development' },
  })
})

// gulp.task('connect', function() {
//   connect.server({            //使用connect启动一个Web服务器
//     host: '127.0.0.1',        //地址，可不写，不写的话，默认localhost
//     port: 8000,               //端口号，可不写，默认8000
//     root: './',               //当前项目主目录
//     livereload: true,         //自动刷新
//   });
// });

// gulp.task('html', function() {

// })

// gulp.task('server');

