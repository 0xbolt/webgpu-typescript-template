import './style.css'

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

import triangleWgsl from './shaders/triangle.wgsl?raw';
const shaderModule = device.createShaderModule({ code: triangleWgsl });

const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
        module: shaderModule
    },
    fragment: {
        module: shaderModule, targets: [{ format: canvasFormat }]
    },
});

function render() {
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
    pass.draw(3);
    pass.end();

    const commands = [encoder.finish()];
    device.queue.submit(commands);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);
