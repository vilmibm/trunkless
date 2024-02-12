// TODO

function addLine() {
  const ltp = document.querySelector("#linetmpl");
  const lines = document.querySelector("#lines");
  const l = ltp.content.cloneNode(true);

  lines.appendChild(l);
}
function main() {
  for (var i = 0; i < 10; i++) {
    addLine();
  }
}

main();
