class PoemLine extends HTMLDivElement {
  constructor() {
    super();
    const ltp = document.querySelector("#linetmpl");
    var l = ltp.content.cloneNode(true);
    this.appendChild(l);
    this.addEventListener("regen", function() {
      console.log("poot");
    });
  }

  regen() {
    fetch(new Request("/line")).then((resp) => {
      if (!resp.ok) {
        throw new Error(`sadness stalks the land in ${resp.status} ways`);
      }
      return resp.json();
    }).then((payload) => {
      this.querySelector(".linetext").innerText = payload.Text;
      this.querySelector(".linetext").setAttribute("data-source", payload.Source);
    });
  }
}

customElements.define("poem-line", PoemLine, { extends: "div" });
const regen = new Event("regen");

function addLine() {
  var ld = document.createElement("div", { is: "poem-line" });
  document.querySelector("#lines").append(ld);
  ld.regen();
}

function main() {
  for (var i = 0; i < 10; i++) {
    addLine();
  }
}

main();
