// nostalgia for a simpler, more complicated time
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const initialLines = 10;

class Button extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", this.click);
  }
}

class LineRemover extends Button {
  click() {
    const container = this.closest("div.line");
    const gp = container.parentElement;
    container.remove();
    gp.dispatchEvent(reorder);
  }
}

class LinePinner extends Button {
  click() {
    const l = this.closest("div.line");
    l.classList.toggle("unpinned");
    if (l.classList.contains("unpinned")) {
      this.innerText = "pin";
    } else {
      this.innerText = "upin";
    }
  }
}

class LineUpper extends Button {
  click() {
    const l = this.closest("div.line");
    const s = l.previousElementSibling;
    s.before(l);
    this.dispatchEvent(reorder);
  }

  checkDisabled() {
    const l = this.closest("div.line");
    if (l.previousElementSibling == null) {
      this.setAttribute("disabled", "yeah");
    } else {
      this.removeAttribute("disabled");
    }
  }
}

class LineDowner extends Button {
  click() {
    const l = this.closest("div.line");
    const s = l.nextElementSibling;
    s.after(l);
    this.dispatchEvent(reorder);
  }

  checkDisabled() {
    const l = this.closest("div.line");
    if (l.nextElementSibling == null) {
      this.setAttribute("disabled", "yeah");
    } else {
      this.removeAttribute("disabled");
    }
  }
}

class LineAdder extends Button {
  click() {
    $("div[is=poem-lines]").add()
  }
}

class PoemRegenner extends Button {
  click() {
    $$(".unpinned").forEach((e) => {
      e.regen();
    });
  }
}

class PoemResetter extends Button {
  click() {
    $("div[is=poem-lines]").reset();
  }
}

class PoemLine extends HTMLDivElement {
  constructor() {
    super();
    this.ltp = $("#linetmpl");
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
      this.querySelector(".linetext").setAttribute("data-source", payload.Source.Name);
    });
  }
}

class PoemLines extends HTMLDivElement {
  constructor() {
    super();
    this.addEventListener("reorder", () => {
      this.querySelectorAll("button[is=line-downer]").forEach((e) => {
       e.checkDisabled();
      });
      this.querySelectorAll("button[is=line-upper]").forEach((e) => {
       e.checkDisabled();
      });
    });
  }

  connectedCallback() {
    this.init();
    addEventListener("beforeunload", (e) => {
      if ($$("div.line:not(.unpinned)").length > 0) {
        e.preventDefault();
      }
    });
  }

  init() {
    for (var i = 0; i < initialLines; i++) {
      this.add();
    }
  }

  reset() {
    this.querySelectorAll("div.line").forEach((e) => {
      e.remove();
    });
    this.init()
  }

  add() {
    var ld = document.createElement("div", {is: "poem-line"});
    ld.classList.add("line"); // div[is=poem-line] isn't working, idk why.
    ld.classList.add("unpinned");
    this.append(ld);
    ld.regen();
    this.dispatchEvent(reorder);
  }
}

const reorder = new CustomEvent("reorder", {bubbles: true});
customElements.define("line-remover", LineRemover, { extends: "button" });
customElements.define("line-pinner", LinePinner, { extends: "button" });
customElements.define("line-upper", LineUpper, { extends: "button" });
customElements.define("line-downer", LineDowner, { extends: "button" });
customElements.define("line-adder", LineAdder, { extends: "button" });
customElements.define("poem-regenner", PoemRegenner, {extends: "button"});
customElements.define("poem-resetter", PoemResetter, {extends: "button"});
customElements.define("poem-line", PoemLine, {extends: "div"});
customElements.define("poem-lines", PoemLines, {extends: "div"});
