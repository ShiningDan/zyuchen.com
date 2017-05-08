let dels = document.getElementsByClassName('del');

for (let i = 0; i < dels.length; i++) {
  dels[i].addEventListener('click', function(event) {
    let _id = event.target.dataset.id;

    let mask = document.getElementById('mask');
    mask.setAttribute('data-id', _id);
    mask.setAttribute('style', 'display: block;');
  });
}

document.getElementById('mask-confirm').addEventListener('click', function(event) {
  let _id = document.getElementById('mask').dataset.id;
  let tr = document.getElementById('item-id-' + _id);
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.onload = function() {
    if (xmlhttp.status === 200) {
      let success = JSON.parse(xmlhttp.response).success;
      if (success === 1) {
        tr.remove();
        tr = null;
        document.getElementById('mask').setAttribute('style', 'display: none;');
      }
    }
  }
  xmlhttp.open('DELETE', '/admin/list?id=' + _id);
  xmlhttp.send();
})

document.getElementById('mask-cancel').addEventListener('click', function(event) {
  document.getElementById('mask').setAttribute('style', 'display: none;');
})