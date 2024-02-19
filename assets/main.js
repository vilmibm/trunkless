// nostalgia for a simpler, more complicated time
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const initialLines = 10;
const originalityThresh = 10;

// I am truly sorry
function invoker(methodName) {
  return function(a) {
    return a[methodName]();
  }
}

class Button extends HTMLButtonElement {
  constructor() {
    super();
    this.addEventListener("click", this.click);
    this.setAttribute("style", "min-width:4em");
  }
}

class SourceShower extends Button {
  click() {
    this.closest("div.line").querySelector("p[is=source-text]").toggle()
    if (this.innerText == "see source") {
      this.innerText = "hide source";
    } else {
      this.innerText = "see source";
    }
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
      this.innerText = "unpin";
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

class LineEditor extends Button {
  connectedCallback() {
    this.span = this.closest(".line").querySelector("span.linetext");
    this.f = $("#line-editor-tmpl").content.firstElementChild.cloneNode(true);
    this.i = this.f.querySelector("input[type=text]");
    this.f.addEventListener("submit", (e) => {
      e.preventDefault();
      this.done();
    })
  }
  done() {
    this.editing = false;
    this.innerText = "edit";
    this.span.innerText = this.i.value;
    this.f.remove();
    this.span.setAttribute("style", "display:inline");
    this.dispatchEvent(edited);
  }
  click() {
    if (this.editing) {
      this.done();
      return;
    }
    this.editing = true;
    this.innerText = "done";
    this.span.setAttribute("style", "display:none");
    this.i.value = this.span.innerText;
    this.parentElement.appendChild(this.f);
    this.i.focus();
  }
}

class LineInput extends HTMLInputElement {
  constructor() {
    super();
    this.setAttribute("type", "text");
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
    $("div[is=poem-lines]").regenerate();
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
    this.addEventListener("edited", (e) => {
      e.preventDefault();
      this.querySelector("p[is=source-text]").edited();
    });
  }

  connectedCallback() {
    if (this.connected) {
      return;
    }
    this.appendChild(this.ltp.content.cloneNode(true));
    this.connected = true;
  }

  get source() {
    console.log(this.querySelector("span.linetext"));
    return this.querySelector("span.linetext").dataset.source;
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
      this.originalText = payload.Text;
      this.querySelector("p[is=source-text]").update(payload.Source);
    });
  }
}

class PoemLines extends HTMLDivElement {
  constructor() {
    super();
    this.addEventListener("reorder", () => {
      this.querySelectorAll("button[is=line-downer]").forEach(invoker("checkDisabled"));
      this.querySelectorAll("button[is=line-upper]").forEach(invoker("checkDisabled"));
    });
  }

  connectedCallback() {
    this.init();
    addEventListener("beforeunload", (e) => {
      if (this.querySelectorAll("div.line:not(.unpinned)").length > 0) {
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
    this.querySelectorAll("*").forEach(invoker("remove"));
    this.init();
  }

  add() {
    var ld = document.createElement("div", {is: "poem-line"});
    ld.classList.add("line"); // div[is=poem-line] isn't working, idk why.
    ld.classList.add("unpinned");
    this.append(ld);
    ld.regen();
    this.dispatchEvent(reorder);
  }

  regenerate() {
    this.querySelectorAll(".unpinned").forEach(invoker("regen"));
  }
}

class SourceText extends HTMLParagraphElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute("style", `display: none;`);
  }

  toggle() {
    if (this.style.display == "none") {
      this.style.display = "block";
    } else {
      this.style.display = "none";
    }
  }

  edited() {
    const line = this.parentElement;
    const text = line.querySelector("span.linetext").innerText;
    const orig = line.originalText;
    if (text == "" || (text != orig && !orig.includes(text))) {
      this.update({"Name": "original"});
    }
  }

  update(source) {
    if (source.Name.startsWith("pg")) {
      const fullGutID = source.Name.split(" ", 2)[0];
      const sourceName = source.Name.slice(source.Name.indexOf(' '));
      const gutID = fullGutID.match(/^pg(.+).txt$/)[1];
      console.log(fullGutID, sourceName, gutID);
      const url = `https://www.gutenberg.org/cache/epub/${gutID}/pg${gutID}.txt`;
      this.innerHTML = `
      <span>${sourceName}</span> (<a href="${url}">${fullGutID}</a>)`
    } else {
      this.innerHTML = `<span>${source.Name}</span>`;
    }
  }
}

// TODO show source button

const reorder = new CustomEvent("reorder", {bubbles: true});
const edited = new CustomEvent("edited", {bubbles: true});
customElements.define("source-text", SourceText, { extends: "p" });
customElements.define("source-shower", SourceShower, { extends: "button" });
customElements.define("line-remover", LineRemover, { extends: "button" });
customElements.define("line-pinner", LinePinner, { extends: "button" });
customElements.define("line-editor", LineEditor, { extends: "button" });
customElements.define("line-upper", LineUpper, { extends: "button" });
customElements.define("line-downer", LineDowner, { extends: "button" });
customElements.define("line-adder", LineAdder, { extends: "button" });
customElements.define("poem-regenner", PoemRegenner, {extends: "button"});
customElements.define("poem-resetter", PoemResetter, {extends: "button"});
customElements.define("poem-line", PoemLine, {extends: "div"});
customElements.define("poem-lines", PoemLines, {extends: "div"});
