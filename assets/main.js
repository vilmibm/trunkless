class LineRemover extends HTMLButtonElement {
  constructor() {
    super();
    this.container = this.closest("div.linecontainer").parentElement;
    this.addEventListener("click", (e) => {
      this.container.remove();
    });
  }
}

customElements.define("line-remover", LineRemover, { extends: "button" });

class LineAdder extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", (e) => {
      document.querySelector("div[is=lines-div]").add()
    });
  }
}

customElements.define("line-adder", LineAdder, { extends: "button" });

class PoemLine extends HTMLDivElement {
  constructor() {
    super();
    const ltp = document.querySelector("#linetmpl");
    var l = ltp.content.cloneNode(true);
    this.appendChild(l);
    this.addEventListener("regen", this.regen); // TODO will this be bound?
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

class Lines extends HTMLDivElement {
  constructor() {
    super();
    for (var i = 0; i < 10; i++) {
      this.add();
    }
  }

  add() {
    var ld = document.createElement("div", { is: "poem-line" });
    this.append(ld);
    ld.regen();
  }
}

customElements.define("lines-div", Lines, { extends: "div" });
