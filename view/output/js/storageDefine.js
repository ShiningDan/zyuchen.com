function ls(name) {
  let target = document.getElementById(name);
  if (!target) {
    throw new Error('ls save fn not find ' + name);
  } else {
    window.localStorage.setItem(name, target.innerHTML);
  }
}
function ll(name, tag) {
  let storage = window.localStorage.getItem(name);
  if (!storage) {
    throw new Error('ls load fn not find ' + name);
    // 如果 cookie 中存在，但是在 localstorage 中找不到需要如何处理？先删除 cookie，然后刷新页面。
  } else {
    let type = tag ? 'script' : 'style';  // 设置 0 来添加 style，设置 1 来添加 script
    let elem = document.createElement(type);
    elem.innerHTML = storage;
    document.head.appendChild(elem);
  }
}