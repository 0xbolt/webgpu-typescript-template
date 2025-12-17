import './style.css'
import { observeCanvasResize } from './utils';
import { stats, params, brightnessBinding } from './debug';

const app = document.querySelector<HTMLCanvasElement>('#app')!;
const canvas = app.querySelector('canvas')!;

if (!navigator.gpu) throw new Error('WebGPU not supported in this browser.');
const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
if (!adapter) throw new Error('No appropriate GPUAdapter found.');

const device = await adapter.requestDevice({
    requiredFeatures: ['float32-filterable', 'bgra8unorm-storage'],
});

const context = canvas.getContext('webgpu')!;
const hdrFormat: GPUTextureFormat = 'rgba16float';
// const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
const canvasFormat = hdrFormat;
const colorSpace: PredefinedColorSpace = 'srgb';
context?.configure({ device, colorSpace, format: canvasFormat, toneMapping: { mode: 'extended' } });

console.log(context.getCurrentTexture().format);

import triangleWgsl from './shaders/triangle.wgsl?raw';
const shaderModule = device.createShaderModule({ code: triangleWgsl });

let canvasSizeData = new Float32Array([canvas.width, canvas.height]);
const canvasSizeBuffer = device.createBuffer({
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
    size: canvasSizeData.byteLength,
});

const brightnessData = new Float32Array([1.0]);
const brightnessBuffer = device.createBuffer({
    size: brightnessData.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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
    }, {
        binding: 1,
        resource: { buffer: brightnessBuffer },
    }],
});

let time: number = 0;
let lastFrameTime: number | null = null;

function render(frameTime: number) {
    frameTime *= 1e-3;
    if (lastFrameTime === null) lastFrameTime = frameTime;
    const deltaTime = frameTime - lastFrameTime;
    lastFrameTime = frameTime;
    time += deltaTime;

    stats.begin();

    params.brightness = 0.75 + 1.25 * (1 + Math.cos(1.1 * Math.PI * time)) / 2;
    brightnessBinding.refresh();
    brightnessData[0] = params.brightness;
    device.queue.writeBuffer(brightnessBuffer, 0, brightnessData);

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
    canvasSizeData[0] = width;
    canvasSizeData[1] = height;
    device.queue.writeBuffer(canvasSizeBuffer, 0, canvasSizeData);
    // render();
})
