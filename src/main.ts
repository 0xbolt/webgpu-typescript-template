import './style.css'
import { CanvasResizeObserver, observeCanvasResize } from './utils';
import { stats, params } from './debug';

const app = document.querySelector<HTMLCanvasElement>('#app')!;
const canvas = app.querySelector('canvas')!;

if (!navigator.gpu) throw new Error('WebGPU not supported in this browser.');
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) throw new Error('No appropriate GPUAdapter found.');
const device = await adapter.requestDevice();

const context = canvas.getContext('webgpu')!;
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context?.configure({ device, format: canvasFormat });

import triangleWgsl from './shaders/triangle.wgsl?raw';
const shaderModule = device.createShaderModule({ code: triangleWgsl });

let canvasSizeData = new Float32Array([canvas.width, canvas.height]);
const canvasSizeBuffer = device.createBuffer({
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    size: canvasSizeData.byteLength,
});

const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
        module: shaderModule
    },
    fragment: {
        module: shaderModule, targets: [{ format: canvasFormat }]
    },
});

const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{
        binding: 0,
        resource: { buffer: canvasSizeBuffer },
    }],
});

function render() {
    stats.begin();

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            loadOp: 'clear',
            clearValue: [0, 0, 0, 1],
            storeOp: 'store',
        }],
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(3);
    pass.end();

    const commands = [encoder.finish()];
    device.queue.submit(commands);

    stats.end();
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

observeCanvasResize(canvas, device, (width, height) => {
    render();
})
