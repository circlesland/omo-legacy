import { css } from "lit-element";

export const dragStyle = css`
  :host(.omo-drag) {
    background: #3fbe79;
    opacity: 0.4;
    transform: scale(0.8);
  }

  :host {
    overflow: hidden;
    position: relative;
    display: block;
    transition: all 0.4s;
    width:100%;
  }

  :host slot {
    position: relative;
    display: block;
  }

  :host(.over) slot::before {
    content: " ";
    position: absolute;
    top: 0;
    left: 10px;
    bottom: 0;
    right: 10px;
    background: rgba(0, 255, 0, 0.8);
    z-index: 1001;
    border: 3px dashed red;
    border-radius: 5px;
  }

  :host(.over)::after {
    position: absolute;
    content: " ";
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 255, 0, 0.6);
    border: 3px dashed red;
    border-radius: 5px;
    z-index: 1000;
  }

  :host::before {
    content: " ";
    position: absolute;
    right: 0;
    top: 0;

    width: 15px;
    height: 15px;
    z-index: 1000;

    border-radius: 50%;
    background: lightgray;
  }
  [draggable] {
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    /* Required to make elements draggable in old WebKit */
    -khtml-user-drag: element;
    -webkit-user-drag: element;
  }
`;
