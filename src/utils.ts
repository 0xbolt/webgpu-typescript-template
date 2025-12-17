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
