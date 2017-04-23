let gulp = require('gulp');
let nodemon = require('gulp-nodemon');
let browserSync  = require('browser-sync').create();
// let connect = require('gulp-connect');

// gulp.task('templates', function() {

// });

gulp.task('default', ['browser-sync'], function() {
  gulp.watch('./view/**/*.*', browserSync.reload);
  gulp.watch('./www/**/*.*', browserSync.reload);
  gulp.watch(['./app/**/*.js', './www/static/js/*.js', './app.js'], ['bs-delay'])
});

gulp.task('bs-delay', function() {
  setTimeout(function() {
    browserSync.reload({stream: false});
  }, 1000);
})

gulp.task('browser-sync', ['nodemon'], function() {
    browserSync.init(null, {
		  proxy: "http://localhost:8000",
      // files: ["./**/*.*"],
      browser: "google chrome",
      port: 7000,
      // rewriteRules: [
      //   {
      //       match: /Content-Security-Policy/,
      //       fn: function (match) {
      //           return "DISABLED-Content-Security-Policy";
      //       }
      //   }
      // ],
  })
})

gulp.task('nodemon',function(cb) {
  let started = false;
  return nodemon({
    script: './app.js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'], 
    env: { 'NODE_ENV': 'development' },
  }).on('start', function() {
    if (!started) {
      cb();
      started = true;
    }
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

