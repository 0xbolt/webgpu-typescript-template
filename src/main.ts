console.log("Helllo!!!!");

import './style.css'
import { addFullscreenEventListener } from './utils';
import { stats, PARAMS } from './options';

const app = document.querySelector<HTMLCanvasElement>('#app')!;
const canvas = app.querySelector('canvas')!;

if (!navigator.gpu) throw new Error('WebGPU not supported in this browser.');
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error('No appropriate GPUAdapter found.');
const device = await adapter.requestDevice();

canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

const context = canvas.getContext('webgpu')!;
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context?.configure({ device, format: canvasFormat });

console.log("Helllo!!!!");

const sampleCount = 4;

// Build pipeline

import triangleWgsl from './shaders/triangle.wgsl?raw';
const shaderModule = device.createShaderModule({ code: triangleWgsl });

console.log("Helllo!!!!");

let canvasSizeData = new Uint32Array([canvas.width, canvas.height]);
const canvasSizeBuffer = device.createBuffer({
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    size: canvasSizeData.byteLength,
});
device.queue.writeBuffer(canvasSizeBuffer, 0, canvasSizeData);

console.log("Helllo!!!!");
console.log("Helllo!!!!");

const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
        module: shaderModule
    },
    fragment: {
        module: shaderModule, targets: [{ format: canvasFormat }]
    },
    // multisample: {
    //     count: 4
    // },
});

console.log("Helllo2!!!!");

const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
        binding: 0,
        resource: canvasSizeBuffer,
    }],
});

console.log("Helllo2!!!!");

// const msaaTexture = device.createTexture({
//   size: [canvas.width, canvas.height],
//   sampleCount,
//   format: canvasFormat,
//   usage: GPUTextureUsage.RENDER_ATTACHMENT,
// });
// const msaaView = msaaTexture.createView();

function render() {
    stats.begin();

    // const canvasSizeData = new Uint32Array([canvas.width, canvas.height]);
    // device.queue.writeBuffer(canvasSizeBuffer, 0, canvasSizeData);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            // view: msaaView,
            // resolveTarget: context.getCurrentTexture().createView(),
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            clearValue: [0, 0, 0, 1],
            storeOp: 'store',
        }],
    });

    pass.setPipeline(pipeline);
    // pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    const commands = [encoder.finish()];
    device.queue.submit(commands);
    stats.end();
    console.log('Hello!');
    requestAnimationFrame(render);
}
requestAnimationFrame(render);
render()
console.log('Hello!');

// const observer = new ResizeObserver(entries => {
//     for (const entry of entries) {
//         const width = entry.devicePixelContentBoxSize?.[0].inlineSize || entry.contentBoxSize[0].inlineSize * window.devicePixelRatio;
//         const height = entry.devicePixelContentBoxSize?.[0].blockSize || entry.contentBoxSize[0].blockSize * window.devicePixelRatio;
//         const canvas = entry.target as HTMLCanvasElement;
//         canvas.width =  Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
//         canvas.height =  Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
//     }
// })
// try {
//     observer.observe(canvas, { box: 'device-pixel-content-box' });
//   } catch {
//     observer.observe(canvas, { box: 'content-box' });
//   }
// observer.observe(canvas);


// window.visualViewport?.addEventListener("resize", () => {
//     console.log("scale", window.visualViewport?.scale);
// });