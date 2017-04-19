let fs = require('fs');
let path = require('path');
let marked = require('marked');

let p = path.join(__dirname, 'md/mongodb-入门.md');
let fileContent = fs.readFileSync(p).toString('utf-8');
let writeFile = path.join(__dirname, 'md/mongodb.html');
let writeContent = marked(fileContent);
fs.writeFileSync(writeFile, writeContent);