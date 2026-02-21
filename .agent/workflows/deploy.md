---
description: Proceso de deploy y verificación antes de subir cambios
---

# Deploy y Verificación

## Pre-deploy checklist

### 1. Lint

// turbo

```bash
npm run lint
```

### 2. Build

// turbo

```bash
npm run build
```

### 3. Verificar variables de entorno

Asegurar que `.env.example` tiene todas las variables necesarias:

```
BUNGIE_API_KEY=
BUNGIE_CLIENT_ID=
BUNGIE_CLIENT_SECRET=
BUNGIE_REDIRECT_URL=
DATABASE_URL=
SESSION_SECRET=
NEXT_PUBLIC_APP_URL=
OLLAMA_HOST=
OLLAMA_MODEL=
```

### 4. Verificar base de datos

// turbo

```bash
npx prisma db push
```

### 5. Test manual

- [ ] Landing page carga correctamente
- [ ] Login con Bungie funciona
- [ ] Dashboard muestra datos
- [ ] Inventario se carga
- [ ] Loadouts CRUD funcionan
- [ ] Build optimizer devuelve resultados
- [ ] AI Advisor responde (si Ollama está activo)

## Deploy (según plataforma)

### Vercel

```bash
npx vercel --prod
```

### Self-hosted

```bash
npm run build
npm run start
```

### Docker (futuro)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["npm", "start"]
```
