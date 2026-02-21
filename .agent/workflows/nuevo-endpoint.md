---
description: Cómo crear un nuevo endpoint API en NEXA
---

# Nuevo Endpoint API — Paso a paso

## 1. Crear el Route Handler

Crear `src/app/api/<endpoint>/route.ts`

## 2. Plantilla base

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
    try {
        // 1. Verificar autenticación
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        // 2. Lógica de negocio
        // const data = await miServicio.obtenerDatos(session);

        // 3. Responder
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error("[API/<endpoint>]", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Parsear body
        const body = await req.json();

        // Validar inputs
        if (!body.requiredField) {
            return NextResponse.json({ error: "Missing requiredField" }, { status: 400 });
        }

        // Lógica...
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API/<endpoint>]", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Server error" },
            { status: 500 }
        );
    }
}
```

## 3. Verificar

// turbo

```bash
npm run build
```

## Checklist

- [ ] Auth guard con `getSession()`
- [ ] Validación de inputs
- [ ] Try/catch con logging
- [ ] Mensajes de error descriptivos
- [ ] Sin fugas de datos sensibles
