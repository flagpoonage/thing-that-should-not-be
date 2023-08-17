import { html, reactive } from '@arrow-js/core';

const data = reactive({
  value: '',
});

type ArrowInputEvent = InputEvent & {
  target: HTMLInputElement;
};

function onClick(e) {
  debugger;
}

export const leftPanel = html`<div>
  <textarea
    value="${() => data.value}"
    @input="${(e: ArrowInputEvent) => {
      data.value = e.target.value;
    }}"
  ></textarea>
  <div>
    ${data.value}
    <span @click="${onClick}" style="display: block; white-space: pre;"
      >${() => data.value}</span
    >
  </div>
</div>`;
