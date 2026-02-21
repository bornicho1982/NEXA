'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
    useEffect(() => {
        // @ts-expect-error - workbox is injected by next-pwa/workbox
        if ('serviceWorker' in navigator && typeof window.workbox !== 'undefined') {
            // @ts-expect-error - workaround for missing window.workbox types
            const wb = window.workbox;
            wb.register();
        } else if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered successfully:', registration.scope);
                })
                .catch((error) => {
                    console.error('SW registration failed:', error);
                });
        }
    }, []);

    return null;
}
