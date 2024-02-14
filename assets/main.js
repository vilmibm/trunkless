// nostalgia for a simpler, more complicated time
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

class LineRemover extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", (e) => {
      this.closest("div.linecontainer").parentElement.remove();
    });
  }
}

customElements.define("line-remover", LineRemover, { extends: "button" });

class LinePinner extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", (e) => {
      this.closest("div.linecontainer").classList.toggle("unpinned");
    });
  }
}

customElements.define("line-pinner", LinePinner, { extends: "button" });

class LineAdder extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", (e) => {
      $("div[is=lines-div]").add()
    });
  }
}

customElements.define("line-adder", LineAdder, { extends: "button" });

class PoemRegenner extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", () => {
      $$(".unpinned").forEach((e) => {
        e.parentElement.regen();
      });
    });
  }
}

customElements.define("poem-regenner", PoemRegenner, {extends: "button"});

class PoemLine extends HTMLDivElement {
  constructor() {
    super();
    this.ltp = $("#linetmpl");
    this.connected = false;
  }

  connectedCallback() {
    if (this.connected) {
      return;
    }
    this.appendChild(this.ltp.content.cloneNode(true));
    this.connected = true;
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

customElements.define("poem-line", PoemLine, {extends: "div"});

class Lines extends HTMLDivElement {
  constructor() {
    super();
    this.connected = false;
  }

  connectedCallback() {
    if (this.connected) {
      return;
    }
    for (var i = 0; i < 10; i++) {
      this.add();
    }
    this.connected = true
  }

  add() {
    var ld = document.createElement("div", {is: "poem-line"});
    this.append(ld);
    ld.regen();
  }
}

customElements.define("lines-div", Lines, {extends: "div"});
