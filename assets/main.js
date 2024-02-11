// TODO
function main() {
  const lines = document.querySelector("#lines");
  const bp = document.querySelector("#blueprint .linecontainer");
  for (var i = 0; i < 10; i++) {
    lines.appendChild(bp.cloneNode(true));
  }
}

main();
