import { State } from './state'
import { colors, setVisible, createEl } from './util'
import { files, ranks } from './types'
import { createElement as createSVG } from './svg'
import { Elements, Geometry, Notation } from './types'

export default function wrap(element: HTMLElement, s: State, relative: boolean): Elements {

  // .cg-wrap (element passed to Chessground)
  //   cg-helper (12.5%)
  //     cg-container (800%)
  //       cg-board
  //       svg
  //       coords.ranks
  //       coords.files
  //       piece.ghost

  element.innerHTML = '';

  // ensure the cg-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling chessground
  // for a slight performance improvement! (avoids recomputing style)
  element.classList.add('cg-wrap');

  colors.forEach(c => element.classList.toggle('orientation-' + c, s.orientation === c));
  element.classList.toggle('manipulable', !s.viewOnly);

  const helper = createEl('cg-helper');
  element.appendChild(helper);
  const container = createEl('cg-container');
  helper.appendChild(container);

  const extension = createEl('extension');
  container.appendChild(extension);
  const board = createEl('cg-board');
  container.appendChild(board);

  let svg: SVGElement | undefined;
  if (s.drawable.visible && !relative) {
    svg = createSVG('svg');
    svg.appendChild(createSVG('defs'));
    container.appendChild(svg);
  }

  if (s.coordinates) {
    const orientClass = s.orientation === 'black' ? ' black' : '';
    const shogi = (s.geometry === Geometry.dim9x9 || s.geometry === Geometry.dim5x5);
    if (shogi) {
        container.appendChild(renderCoords(ranks.slice(1, s.dimensions.height + 1).reverse(), 'files' + orientClass));
        container.appendChild(renderCoords(ranks.slice(1, s.dimensions.width + 1).reverse(), 'ranks' + orientClass));
    } else if (s.notation === Notation.JANGGI) {
        container.appendChild(renderCoords((['0']).concat(ranks.slice(1, 10).reverse()), 'ranks' + orientClass));
        container.appendChild(renderCoords(ranks.slice(1, 10), 'files' + orientClass));
    } else {
        container.appendChild(renderCoords(ranks.slice(1, s.dimensions.height + 1), 'ranks' + orientClass));
        container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + orientClass));
    }
  }

  let ghost: HTMLElement | undefined;
  if (s.draggable.showGhost && !relative) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return {
    board,
    container,
    ghost,
    svg
  };
}

function renderCoords(elems: any[], className: string): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  for (let i in elems) {
    f = createEl('coord');
    f.textContent = elems[i];
    el.appendChild(f);
  }
  return el;
}
