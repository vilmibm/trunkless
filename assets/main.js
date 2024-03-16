// nostalgia for a simpler, more complicated time
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const initialLines = 10;

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
    this.setAttribute("style", "min-width:2.3em");
  }
}

class SourceShower extends Button {
  connectedCallback() {
    this.innerText = "?"
    this.setAttribute("title", "show source");
  }

  click() {
    this.closest("div.line").querySelector("p[is=source-text]").toggle()
    if (this.innerHTML.includes("strong")) {
      this.innerHTML = "?";
      this.setAttribute("title", "show source");
    } else {
      this.innerHTML = "<strong>?</strong>";
      this.setAttribute("title", "hide source");
    }
  }
}

class LineRemover extends Button {
  connectedCallback() {
    this.setAttribute("title", "remove line");
  }
  click() {
    const container = this.closest("div.line");
    const gp = container.parentElement;
    container.remove();
    gp.dispatchEvent(reorder);
  }
}

class LinePinner extends Button {
  connectedCallback() {
    this.innerText = "P";
    this.setAttribute("title", "pin line in place");
  }
  click() {
    const l = this.closest("div.line");
    l.classList.toggle("unpinned");
    if (l.classList.contains("unpinned")) {
      this.innerText = "P";
      this.classList.remove("pinned");
      this.setAttribute("title", "pin line in place");
    } else {
      this.classList.add("pinned");
      this.setAttribute("title", "unpin line");
    }
  }
}

class LineUpper extends Button {
  connectedCallback() {
    this.setAttribute("title", "move line up");
  }
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
  connected = false
  connectedCallback() {
    if (this.connected) {
      return;
    }
    this.setAttribute("title", "edit line text");
    this.linetext = this.closest(".line").querySelector(".linetext");
    this.f = $("#line-editor-tmpl").content.firstElementChild.cloneNode(true);
    this.i = this.f.querySelector("input[type=text]");
    this.f.addEventListener("submit", (e) => {
      e.preventDefault();
      this.done();
    })
    this.connected = true;
  }
  done() {
    this.setAttribute("title", "edit line text");
    this.editing = false;
    //this.innerText = "✎";
    this.innerText = "E";
    this.linetext.innerText = this.i.value;
    this.f.remove();
    this.linetext.style.display = "block";
    this.dispatchEvent(edited);
  }
  click() {
    if (this.editing) {
      this.done();
      return;
    }
    this.editing = true;
    this.setAttribute("title", "finish editing");
    this.innerHTML = "<strong>✓</strong>";
    this.linetext.style.display = "none";
    //this.linetext.setAttribute("style", "display:none");
    this.i.value = this.linetext.innerText;
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
  connectedCallback() {
    this.setAttribute("title", "move line down");
  }
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
  connectedCallback() {
    this.setAttribute("title", "regenerate unpinnned lines");
  }
  click() {
    $("div[is=poem-lines]").regenerate();
  }
}

class PoemResetter extends Button {
  connectedCallback() {
    // TODO set title
    this.innerText = "reset";
  }
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
      this.querySelector("div[is=source-text]").edited();
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
      const source = payload.Source
      const sourceName = source.Name.slice(source.Name.indexOf(' '));
      this.querySelector(".source").innerText = sourceName;
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

class SourceText extends HTMLDivElement {
  constructor() {
    super();
  }

  edited() {
    const line = this.parentElement;
    const text = line.querySelector(".linetext").innerText;
    console.log(text);
    const orig = line.originalText;
    if (text == "" || (text != orig && !orig.includes(text))) {
      this.update({"Name": "original"});
    }
  }

  update(source) {
    if (source.Name.startsWith("pg")) {
      const sourceName = source.Name.slice(source.Name.indexOf(' '));
      this.innerText = sourceName;
    } else {
      this.innerText = source.Name;
    }
  }
}

class ThemeToggler extends HTMLAnchorElement {
  constructor() {
    super();
    this.addEventListener("click", this.click);
    this.theme = "dark";
    this.innerText = "◑";
    this.setAttribute("aria-hidden", "true");
    this.style.cursor = "pointer";
  }
  click() {
    if (this.theme == "light") {
      this.theme = "dark";
      $("body").style.backgroundColor = "black";
      $("body").style.backgroundImage = 'url("/bg_dark.gif")';
      $("body").style.color = "white";
      $$("a").forEach((e) => { e.style.color = "white" });
      $$("span.linetext").forEach((e) => { e.style.backgroundColor = "black" });
    } else {
      this.theme = "light";
      $("body").style.backgroundColor = "white";
      $("body").style.backgroundImage = 'url("/bg_light.gif")';
      $("body").style.color = "black";
      $$("a").forEach((e) => { e.style.color = "black" });
      $$("span.linetext").forEach((e) => { e.style.backgroundColor = "white" });
    }
  }
}

class PoemSaver extends HTMLFormElement {
  // oops, you can't copy an image on ff.
  connectedCallback() {
    this.querySelectorAll("input[name=type]").forEach((e) => {
      e.addEventListener("change", (e) => {
        if (e.target.value == "image") {
          this.querySelector("button.copy").setAttribute("disabled", true);
        } else {
          this.querySelector("button").removeAttribute("disabled");
        }
      });
    });
    this.querySelectorAll("button").forEach((e) => {
      e.addEventListener("click", (e) => {
        e.target.classList.add("rainbow");
        e.target.addEventListener("animationend", () => {
          e.target.classList.remove("rainbow")
        });
      });
    });

    const fd = new FormData(this);
    if (fd.get("type") == "image") {
      this.querySelector("button.copy").setAttribute("disabled", true);
    }
    this.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const includeSources = fd.get("sources") == "on";
      const saveType = fd.get("type");
      const text = this.toText(includeSources);
      if (e.submitter.innerText == "copy") {
        if (saveType == "text") {
          this.copyText(text);
        }
      } else {
        if (saveType == "text") {
          this.saveText(text);
        } else {
          this.saveImage(text);
        }
      }
    });
  }

  toText(includeSources) {
    var text = "";
    var sources = "";
    $$(".linetext").forEach((e) => {
      text += e.innerText + "\n";
      sources += e.dataset.source + "\n"
    })
    if (includeSources) {
      text += "\n\nsources:\n" + sources;
    }
    return text;
  }

  copyText(text) {
    navigator.clipboard.writeText(text);
  }

  fname() {
    return `trunkless-poem-${Math.trunc(Date.now()/1000)}`
  }

  saveText(text) {
    const blob = new Blob([text], {type: "text/plain"});
    const dlink = document.createElement("a");
    dlink.download = this.fname() + ".txt";
    dlink.href = window.URL.createObjectURL(blob);
    dlink.addEventListener("click", (e)=>{e.target.remove()});
    dlink.style.display = "none";
    $("body").appendChild(dlink);
    dlink.click();
  }

  saveImage(text) {
    const toSave = document.createElement("p");
    toSave.setAttribute("id", "toSave");
    toSave.style.color = "black";
    toSave.style["font-size"] = "75%";
    toSave.style["max-width"] = "500px";
    toSave.innerText = text;
    $("body").append(toSave);
    html2canvas(document.querySelector("#toSave")).then((canvas) => {
      canvas.toBlob((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = this.fname() + ".png";
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(downloadUrl);
        toSave.remove();
      });
    });
  }
}


const reorder = new CustomEvent("reorder", {bubbles: true});
const edited = new CustomEvent("edited", {bubbles: true});
customElements.define("poem-saver", PoemSaver, { extends: "form" });
customElements.define("theme-toggler", ThemeToggler, { extends: "a" });
customElements.define("source-text", SourceText, { extends: "div" });
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
