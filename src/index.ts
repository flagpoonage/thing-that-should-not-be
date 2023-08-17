import { html } from '@arrow-js/core';
import './style.css';
import { leftPanel } from './components/left-panel';

function getRoot() {
  const el = document.getElementById('root');
  if (el) {
    return el;
  }

  const new_el = document.createElement('div');
  new_el.id = 'root';
  document.body.appendChild(new_el);
  return new_el;
}

function init() {
  html`<div class="calculator">${leftPanel}</div>`(getRoot());
}

document.readyState === 'complete'
  ? init()
  : document.addEventListener('DOMContentLoaded', init);
