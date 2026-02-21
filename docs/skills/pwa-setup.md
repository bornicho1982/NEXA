# Skill: PWA Setup

## Slug

`pwa-setup`

## Propósito

Configurar la app como Progressive Web App instalable: manifest.json completo, iconos reales, service worker con estrategia de caché segura, y registro mediante Client Component.

## Roles que la usan

- R1 — Arquitectura y Configuración

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| Nombre y branding de la app | Decisión de producto | R2 Producto |
| `next.config.ts` existente | Config | Repo |
| `src/app/layout.tsx` existente | TSX | Repo |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| `public/manifest.json` válido | JSON | Browser |
| `public/icons/icon-192.png` | Image | PWA |
| `public/icons/icon-512.png` | Image | PWA |
| `public/sw.js` con cache strategy | JS | Browser |
| `src/components/pwa/ServiceWorkerRegistrar.tsx` | Component | App |

## Archivos tocados

### Crea

```
public/manifest.json
public/icons/icon-192.png
public/icons/icon-512.png
public/sw.js
src/components/pwa/ServiceWorkerRegistrar.tsx
```

### Modifica

```
src/app/layout.tsx            — <link rel="manifest">, <ServiceWorkerRegistrar />
next.config.ts                — headers para Service-Worker-Allowed
```

## Procedimiento

### 1. Crear `public/manifest.json`

```json
{
  "name": "NEXA — Destiny 2 Companion",
  "short_name": "NEXA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0e17",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### 2. Generar iconos

Crear imagen base y generar `public/icons/icon-192.png` y `public/icons/icon-512.png`. Deben ser PNG rasterizados.

### 3. Crear `public/sw.js` (Service Worker)

Implementar estrategias de caché diferenciadas:

- **Static Assets** (`/icons/*`, `/manifest.json`, CSS/JS bundles): **Cache-First**
- **Navigational HTML** (`/`, `/inventory`, `/builds`): **Network-First** (con fallback a cache si offline)
- **API Pública** (`/api/manifest/*`): **Stale-While-Revalidate**
- **API Autenticada/Privada** (`/api/auth/*`, `/api/inventory/*`, `/api/loadouts/*`): **Network-Only**
  - **CRÍTICO:** NUNCA cachear respuestas que contengan datos de usuario o tokens.

```javascript
// public/sw.js (ejemplo simplificado)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // API Autenticada -> Network Only
  if (url.pathname.startsWith('/api/auth') || url.pathname.startsWith('/api/inventory')) {
    return; // Browser default (network)
  }
  
  // ... lógica de caché para assets estáticos y manifest
});
```

### 4. Crear componente de registro (`src/components/pwa/ServiceWorkerRegistrar.tsx`)

```tsx
'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.workbox !== undefined) {
      const wb = window.workbox;
      wb.register();
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg))
        .catch(err => console.error('SW register failed:', err));
    }
  }, []);

  return null;
}
```

### 5. Integrar en `src/app/layout.tsx`

```tsx
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
```

## Checks de validación

```bash
npm run build
npm run dev
# En Chrome DevTools > Application > Service Workers: verificar registrado activo
# En Chrome DevTools > Network: verificar que /api/auth/* NO viene de ServiceWorker
```

- [ ] `manifest.json` parseable sin errores en DevTools
- [ ] Iconos cargan correctamente (no 404)
- [ ] Service worker registrado mediante el Client Component
- [ ] Endpoints autenticados (`/api/auth`) NO son interceptados por caché
- [ ] Lighthouse PWA score > 80

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| Manifest no se carga | Path incorrecto o MIME type | Verificar que está en `public/` |
| SW no se registra | HTTPS requerido | Usar localhost o `next dev --experimental-https` |
| Error `window is not defined` | Componente no es cliente | Asegurar `'use client'` al inicio |
| Datos privados en caché | Mala configuración de SW | Revisar regex de exclusión en `sw.js` |

## Notas

- Usar `Module augmentation` si se requiere tipar `window.workbox` en TS.
- El componente `ServiceWorkerRegistrar` debe ser `null` en renderizado (no UI).
