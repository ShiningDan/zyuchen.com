let dels = document.getElementsByClassName('del');

for (let i = 0; i < dels.length; i++) {
  dels[i].addEventListener('click', function(event) {
    let _id = event.target.dataset.id;
    let tr = document.getElementById('item-id-' + _id);
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onload = function() {
      if (xmlhttp.status === 200) {
        let success = JSON.parse(xmlhttp.response).success;
        if (success === 1) {
          tr.remove();
          tr = null;
        }
      }
    }
    xmlhttp.open('DELETE', '/admin/list?id=' + _id);
    xmlhttp.send();
  });
}