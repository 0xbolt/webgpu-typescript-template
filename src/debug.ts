import Stats from 'stats.js';
import { Pane } from 'tweakpane';

const app = document.querySelector<HTMLCanvasElement>('#app')!;
export const options = app.querySelector<HTMLElement>('#options')!;
let uiHidden = false;

export const params = {
    color: {r: 1, g: 0, b: 0},
    hdr: false,
};

const pane = new Pane({
    title: "Options",
    container: options,
});
pane.addBinding(params, 'color', {
    picker: 'popup',
    color: {type: 'float'},
});
pane.addBinding(params, 'hdr', {
    label: 'HDR',
});

export var stats = new Stats();
stats.showPanel(1);
app.appendChild(stats.dom);

window.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') {
        uiHidden = !uiHidden;
        const display = uiHidden ? 'none' : '';
        options.style.display = display;
        stats.dom.style.display = display;
    }
});