class MyHighlighter {
  constructor() {
    this.matchRegEx;
  }

  setRegEx = (input) => {
    let re = '\\b(' + input + ')\\b';
    this.matchRegExp = new RegExp(re, 'gi');
    return this.matchRegExp;
  };

  createHighlight = (node, pos, keyword, freq, origRgba) => {
    let span = document.createElement('span');
    let bgColor;

    if (freq == 1) {
      bgColor = origRgba;
    } else if (freq > 1 || freq < 6) {
      const [r, g, b, a] = origRgba.match(/[\d\.]+/g);
      const newRgba = `rgba(${r}, ${g}, ${b},` + a * freq + ')';
      bgColor = newRgba;
    }

    span.className = 'highlighted' + ' ' + keyword;
    span.style.backgroundColor = bgColor;

    let highlighted = node.splitText(pos);
    highlighted.splitText(keyword.length);
    let highlightedClone = highlighted.cloneNode(true);

    span.appendChild(highlightedClone);
    highlighted.parentNode.replaceChild(span, highlighted);

    let btn = document.createElement('button');
    btn.className = 'highlighted_closeBtn';
    span.appendChild(btn);

    if (span.parentNode.className == 'highlighted' + ' ' + keyword) {
      const word = span.textContent;
      span.parentNode.textContent = word;
      span.remove();
      return;
    }
  };

  apply = (node, keywords, wordData, colorData) => {
    let skip = 0;

    if (node === undefined) {
      null;
    }

    if (3 === node.nodeType) {
      for (let i = 0; i < keywords.length; i++) {
        let keyword = keywords[i];
        this.setRegEx(keyword); // set this.matchRegEx
        let freq = wordData[keyword];
        let pos = node.data.toLowerCase().search(this.matchRegExp);

        if (0 <= pos) {
          this.createHighlight(node, pos, keyword, freq, colorData[keyword]);
          skip = 1;
        }
      }
    } else if (
      1 === node.nodeType &&
      !/(script|style|textarea)/i.test(node.tagName) &&
      node.childNodes
    ) {
      for (let i = 0; i < node.childNodes.length; i++) {
        i += this.apply(node.childNodes[i], keywords, wordData, colorData);
      }
    } else if (undefined === node.nodeType) {
      null;
    }
    return skip;
  };

  remove = (node) => {
    let span;

    if (node.querySelector('span.highlighted')) {
      while ((span = node.querySelector('span.highlighted'))) {
        span.outerHTML = span.innerHTML;
      }
      // remove closeBtns
      let closeBtns = node.querySelectorAll('button.highlighted_closeBtn');
      closeBtns = Array.prototype.slice.call(closeBtns);
      closeBtns.forEach((btn) => btn.remove());
    } else return;
  };
}

const myHighLighter = new MyHighlighter();
