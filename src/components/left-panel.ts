import { html, reactive } from '@arrow-js/core';

export type CaretPosition = {
  offsetNode: Node;
  offset: number;
  getClientRect: HTMLElement['getBoundingClientRect'];
};

export type CaretPositionInDisplay = {
  line: {
    element: HTMLDivElement;
    index: number;
    nodeIndex: number;
  };
  node: {
    element: Node;
    index: number;
    offset: number;
  };
};

export type ActualDocument = Document & {
  caretPositionFromPoint: (x: number, y: number) => CaretPosition;
};

const data = reactive({
  mouse_selection: null as null | {
    start: CaretPositionInDisplay;
    end: CaretPositionInDisplay;
  },
  value: '',
});

type ArrowInputEvent = InputEvent & {
  target: HTMLInputElement;
};

let text_area = null as null | HTMLTextAreaElement;
let display_area = null as null | HTMLPreElement;

function getInputEl() {
  if (text_area) {
    return text_area;
  }

  const el = document.getElementById('tttsnb-editor-input');

  if (!(el instanceof HTMLTextAreaElement)) {
    return null;
  }

  text_area = el;

  return text_area;
}

function getDisplayEl() {
  if (display_area) {
    return display_area;
  }

  const el = document.getElementById('tttsnb-editor-display');

  if (!(el instanceof HTMLPreElement)) {
    return null;
  }

  display_area = el;

  return display_area;
}

let treewalker = null as null | TreeWalker;

function getDisplayTreeWalker() {
  if (treewalker) {
    return treewalker;
  }

  const display = getDisplayEl();

  if (!display) {
    return;
  }

  treewalker = document.createTreeWalker(display, NodeFilter.SHOW_TEXT);
  return treewalker;
}

function textNodesOf(el: Node) {
  const a = [] as Node[],
    walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);

  let n;
  while ((n = walk.nextNode())) a.push(n);
  return a;
}

function getLineParent(el: Node) {
  const p = el.parentElement;
  if (!p) {
    return null;
  }

  if (p instanceof HTMLDivElement && p.className === 'tttsnb-editor-line') {
    return p;
  }

  return getLineParent(p);
}

function getCaretPositionInDisplay(x: number, y: number) {
  const input = getInputEl();
  const display = getDisplayEl();
  const walker = getDisplayTreeWalker();

  if (!input || !display || !walker) {
    return;
  }

  const next = (document as ActualDocument).caretPositionFromPoint(x, y);

  const display_nodes = textNodesOf(display);

  const idx_in_total = display_nodes.indexOf(next.offsetNode);
  const line = getLineParent(next.offsetNode);

  if (!line) {
    return;
  }

  const line_nodes = textNodesOf(line);

  const line_idx = Number(line.dataset.lidx);
  const idx_in_line = line_nodes.indexOf(next.offsetNode);

  return {
    line: {
      element: line,
      index: line_idx,
      nodeIndex: idx_in_line,
    },
    node: {
      element: next.offsetNode,
      index: idx_in_total,
      offset: next.offset,
    },
  };
}

function checkReverse(
  start: CaretPositionInDisplay,
  end: CaretPositionInDisplay,
) {
  if (start.line.index > end.line.index) {
    return true;
  }

  if (end.line.index > start.line.index) {
    return false;
  }

  if (start.line.nodeIndex > end.line.nodeIndex) {
    return true;
  }

  if (end.line.nodeIndex > start.line.nodeIndex) {
    return false;
  }

  if (start.node.offset > end.node.offset) {
    return true;
  }

  return false;
}

function getTextIndex(nodes: Node[], nodeStart: number, offset: number) {
  let x = 0 as number | null;
  let i = 0;

  while (x !== null) {
    if (i === nodeStart) {
      x += offset;
      break;
    }

    const next_node = nodes[i];

    if (!next_node) {
      x = null;
      continue;
    }

    x += (next_node.textContent ?? '').length;
    i += 1;
  }

  return x ?? -1;
}

window.addEventListener('mouseup', () => {
  const d = data.mouse_selection;
  console.log(d);
  data.mouse_selection = null;

  const input = getInputEl();

  if (input) {
    input.focus();
  }
});

function editorDisplay() {
  window.addEventListener('mouseup', () => {
    onMouseUp();
  });

  function onMouseUp() {
    const d = data.mouse_selection;
    console.log(d);
    data.mouse_selection = null;

    const input = getInputEl();

    if (input) {
      input.focus();
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!data.mouse_selection) {
      return;
    }

    const ex = e.clientX;
    const ey = e.clientY;

    window.requestAnimationFrame(() => {
      const display = getDisplayEl();
      const input = getInputEl();
      if (!data.mouse_selection || !display || !input) {
        return;
      }

      const caret = getCaretPositionInDisplay(ex, ey);

      if (!caret) {
        return;
      }

      const actual_nodes = textNodesOf(display);
      const isReverse = checkReverse(data.mouse_selection.start, caret);

      const normalized_selection = {
        start_at: isReverse ? caret : data.mouse_selection.start,
        end_at: isReverse ? data.mouse_selection.start : caret,
      };

      const startIndex =
        getTextIndex(
          actual_nodes,
          normalized_selection.start_at.node.index,
          normalized_selection.start_at.node.offset,
        ) + normalized_selection.start_at.line.index;

      const endIndex =
        getTextIndex(
          actual_nodes,
          normalized_selection.end_at.node.index,
          normalized_selection.end_at.node.offset,
        ) + normalized_selection.end_at.line.index;

      input.setSelectionRange(
        startIndex,
        endIndex,
        isReverse ? 'backward' : 'forward',
      );

      input.focus();

      data.mouse_selection.end = caret;
    });
  }

  function onMouseDown(e: MouseEvent) {
    getDisplayTreeWalker();
    const input = getInputEl();
    const display = getDisplayEl();
    const caret = getCaretPositionInDisplay(e.clientX, e.clientY);
    if (!caret || !input || !display) {
      return;
    }

    const actual_nodes = textNodesOf(display);

    const startIndex =
      getTextIndex(actual_nodes, caret.node.index, caret.node.offset) +
      caret.line.index;

    input.setSelectionRange(startIndex, startIndex, 'none');

    input.focus();

    data.mouse_selection = { start: caret, end: caret };
  }

  function renderLines() {
    return data.value.split('\n').map(line);
  }

  return html`<pre
    id="tttsnb-editor-display"
    class="display"
    @mouseup="${onMouseUp}"
    @mousemove="${onMouseMove}"
    @mousedown="${onMouseDown}">
${renderLines}</pre
  >`;
}
function tabcheck() {}

export const leftPanel = html`<div>
  <textarea
    id="tttsnb-editor-input"
    @keydown="${tabcheck}"
    style="width: 400px; height: 200px;"
    value="${() => data.value}"
    @input="${(e: ArrowInputEvent) => {
      data.value = e.target.value;
    }}"></textarea
  ><div>${editorDisplay()}</div></div
>`;

function line(a: string, i: number) {
  const words = a
    ? a.split(' ').map((v, i, x) => word(v, i === x.length - 1))
    : '';

  return html`<div
    class="tttsnb-editor-line"
    data-lidx="${i}"
    data-empty="${!words}"
    .key="${a}"
    >${words}</div
  >`;
}

function word(w: string, final = false) {
  const rgb = (() => {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgb(${r},${g},${b})`;
  })();
  return html`<span style="color: ${rgb};">${w}</span>${final ? '' : ' '}`;
}
