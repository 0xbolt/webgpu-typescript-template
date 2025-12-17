export function addFullscreenEventListener(window: Window, element: HTMLElement) {
    window.addEventListener('keydown', event => {
        if (event.key === 'f' || event.key === 'F') {
            if (!document.fullscreenElement) {
                element.requestFullscreen().catch(console.error);
            } else {
                document.exitFullscreen().catch(console.error);
            }
        }
    });
}

export function observeCanvasResize(canvas: HTMLCanvasElement, device: GPUDevice, callback: (width: number, height: number) => void) {
    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            const width = entry.devicePixelContentBoxSize?.[0].inlineSize || entry.contentBoxSize[0].inlineSize * window.devicePixelRatio;
            const height = entry.devicePixelContentBoxSize?.[0].blockSize || entry.contentBoxSize[0].blockSize * window.devicePixelRatio;
            const target = entry.target as HTMLCanvasElement;
            target.width =  Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
            target.height =  Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
            callback(width, height);
        }
    });
    observer.observe(canvas);
    return observer;
}

export class CanvasResizeObserver {
    observer: ResizeObserver;

    constructor(device: GPUDevice, render: () => void) {
        this.observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const width = entry.devicePixelContentBoxSize?.[0].inlineSize || entry.contentBoxSize[0].inlineSize * window.devicePixelRatio;
                const height = entry.devicePixelContentBoxSize?.[0].blockSize || entry.contentBoxSize[0].blockSize * window.devicePixelRatio;
                const canvas = entry.target as HTMLCanvasElement;
                canvas.width =  Math.max(1, Math.min(width, device.limits.maxTextureDimension2D));
                canvas.height =  Math.max(1, Math.min(height, device.limits.maxTextureDimension2D));
            }
            render();
        });
    }

    observe(canvas: HTMLCanvasElement) {
        try {
            this.observer.observe(canvas, { box: 'device-pixel-content-box' });
        } catch {
            this.observer.observe(canvas, { box: 'content-box' });
        }
    }
}

// class ResizableBuffer {
//     buffer: GPUBuffer;

//     constructor(device: GPUDevice, descriptor: GPUBufferDescriptor) {
//         device.createBuffer(descriptor);
//         // device
//         buffer = null;
//     }
// }
