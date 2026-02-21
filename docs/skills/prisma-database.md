# Skill: Prisma Database

## Slug

`prisma-database`

## Propósito

Referencia de la gestión de base de datos con Prisma ORM + SQLite en NEXA: schema actual, comandos principales, patrones de acceso, y buenas prácticas.

## Roles que la usan

- R1 — Arquitectura (schema, cliente singleton)
- R3 — Backend y API (User model, session)
- R5 — Inventory & Loadouts (Loadout, LoadoutItem models)

## Inputs

| Input | Tipo | Fuente |
|-------|------|--------|
| `DATABASE_URL="file:./dev.db"` | Env var | R1 Arquitectura |
| `prisma/schema.prisma` | Schema file | Repo |

## Outputs

| Output | Tipo | Destino |
|--------|------|---------|
| Referencia de Prisma para implementadores | Documentación | R1, R3, R5 roles |

## Archivos tocados

### Crea

```
(ninguno — este skill es referencia, no produce archivos)
```

### Modifica

```
(ninguno)
```

## Procedimiento

### 1. Comandos principales

| Comando | Propósito |
|---------|-----------|
| `npx prisma generate` | Generar cliente tipado |
| `npx prisma migrate dev --name <nombre>` | Crear migración |
| `npx prisma db push` | Push sin migración (dev rápido) |
| `npx prisma studio` | Ver datos en browser |
| `npx prisma migrate reset` | Reset completo de DB |

### 2. Schema actual

```prisma
model User {
  id                    String   @id @default(cuid())
  bungieMembershipId    String   @unique
  bungieDisplayName     String?
  accessToken           String
  refreshToken          String?
  tokenExpiresAt        DateTime
  membershipType        Int
  destinyMembershipId   String
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  loadouts              Loadout[]
}

model Loadout {
  id          String       @id @default(cuid())
  userId      String
  name        String
  description String?
  classType   Int
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  user        User         @relation(fields: [userId], references: [id])
  items       LoadoutItem[]
}

model LoadoutItem {
  id          String  @id @default(cuid())
  loadoutId   String
  itemHash    Int
  instanceId  String?
  bucketHash  Int
  loadout     Loadout @relation(fields: [loadoutId], references: [id], onDelete: Cascade)
}
```

### 3. Patrón de acceso (singleton)

```typescript
// src/lib/db/index.ts — Prisma singleton
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4. Operaciones comunes

```typescript
import { prisma } from '@/lib/db';

// Leer usuario
const user = await prisma.user.findUnique({
  where: { bungieMembershipId: id }
});

// Crear loadout con items
const loadout = await prisma.loadout.create({
  data: { userId, name, classType, items: { create: items } },
  include: { items: true }
});

// Actualizar tokens
await prisma.user.update({
  where: { id },
  data: { accessToken: newToken, tokenExpiresAt: newExpiry }
});

// Eliminar loadout (cascade a items)
await prisma.loadout.delete({ where: { id } });
```

### 5. Archivos relacionados

| Archivo | Propósito |
|---------|-----------|
| `prisma/schema.prisma` | Schema de la BD |
| `src/lib/db/index.ts` | Singleton de Prisma Client |
| `prisma/migrations/` | Migraciones generadas |

## Checks de validación

- [ ] `npx prisma generate` sin errores
- [ ] `npx prisma db push` sin errores
- [ ] `npx prisma studio` abre y muestra tablas
- [ ] Import `import { prisma } from '@/lib/db'` funciona en route handlers

## Fallback si falla

| Fallo | Causa probable | Solución |
|-------|----------------|----------|
| "Cannot find module '@prisma/client'" | Cliente no generado | `npx prisma generate` |
| "Database does not exist" | DB no inicializada | `npx prisma db push` |
| "Unique constraint failed" | Dato duplicado | Verificar lógica de upsert |
| "Foreign key constraint failed" | Referencia a registro inexistente | Verificar integridad de datos |
| "Migration failed" | Schema incompatible con datos | `npx prisma migrate reset` (borra datos) |

## Notas

- Referencia agent original: `.agent/skills/prisma-database/SKILL.md`
- Import correcto: `import { prisma } from '@/lib/db'` (NO `@/db/client`)
- Siempre usar `include` cuando necesites relaciones
- Usar transacciones para operaciones multi-tabla
- Nunca hardcodear IDs — usar `cuid()` como default
