

exports.home = function(req, res) {
  res.render('./home/home', {
  "articles": [
    {
      "title": "JavaScript 与 JSON",
      "sub": "JSON和JavaScript确实存在渊源，可以说这种数据格式是从JavaScript对象中演变出来的，它是JavaScript的一个子集。JSON本身的意思就是JavaScript对象表示法（JavaScript Object Notation），它用严格的JavaScript对象表示法来表示结构化的数据。",
      "date": "2017-04-08",
      "comments": "5 Comments",
      "more": "继续阅读..."
    },
  ],
  "pageNav": {
    "prev": "上一页",
    "next": "下一页",
    "center": "博客归档"
  }
  });
}