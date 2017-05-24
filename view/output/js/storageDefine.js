function ls(name, tag) {
  let target = document.getElementById(name);
  if (!target) {
    throw new Error('ls save fn not find ' + name);
  } else {
    if (window.localStorage) {
      try {
        window.localStorage.setItem(name, target.innerHTML);
        document.cookie = 'v='+tag;
      } catch(e) {
        console.log(e);
      }
    }
  }
}
function ll(name, isScript) {
  let storage = window.localStorage.getItem(name);
  if (!storage) {
    // 如果 cookie 中存在，但是在 localstorage 中找不到需要如何处理？先删除 cookie，然后刷新页面。
    document.cookie = 'v=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.reload();
    throw new Error('ls load fn not find ' + name);
  } else {
    let type = isScript ? 'script' : 'style';  // 设置 0 来添加 style，设置 1 来添加 script
    let elem = document.createElement(type);
    elem.innerHTML = storage;
    document.head.appendChild(elem);
  }
}