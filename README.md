## zyuchen.com

这个仓库是我的新版博客的代码备份，博客的地址见：[Yuchen 的主页](http://zyuchen.com/)

由于博客为展示型的网页，对首屏时间和 SEO 有很高的要求，并且没有设计很多交互，所以采用的后端渲染的方式，将来会使用 React 重构一遍代码，并且探索一下 React Server Render。

本博客涉及到的技术如下：

使用 Express 作为后端框架，使用 Jade 作为后端渲染模板，后端数据库使用的 MongoDB，并且使用 Redis 进行数据缓存。博客的全站搜索使用的是单节点 Elasticsearch 实现。