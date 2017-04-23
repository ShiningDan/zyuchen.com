let value = document.getElementById("mde").dataset.value;
var simplemde = new SimpleMDE({ 
  element: document.getElementById("mde")
});
if (value) {
  simplemde.value(value);
}