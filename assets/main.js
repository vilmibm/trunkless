// TODO
function main() {
  const lines = document.querySelector("#lines");
  const bp = document.querySelector("#blueprint .linecontainer");
  function addLine() {
    lines.appendChild(bp.cloneNode(true));
  }
  for (var i = 0; i < 10; i++) {
    addLine();
  }
}

main();
