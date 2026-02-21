---
name: prisma-database
description: Skill para gestionar la base de datos Prisma + SQLite en NEXA
---

# Skill: Prisma Database

## Descripción

Instrucciones para gestionar la base de datos del proyecto usando Prisma ORM con SQLite.

## Variables de entorno

```env
DATABASE_URL="file:./dev.db"
```

## Comandos principales

### Generar cliente

```bash
npx prisma generate
```

### Crear migración

```bash
npx prisma migrate dev --name <nombre_descriptivo>
```

### Push sin migración (desarrollo rápido)

```bash
npx prisma db push
```

### Ver datos en browser

```bash
npx prisma studio
```

### Reset completo

```bash
npx prisma migrate reset
```

## Schema actual (`prisma/schema.prisma`)

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
  id          String @id @default(cuid())
  loadoutId   String
  itemHash    Int
  instanceId  String?
  bucketHash  Int
  loadout     Loadout @relation(fields: [loadoutId], references: [id], onDelete: Cascade)
}
```

## Patrón de acceso (NEXA)

```typescript
import { prisma } from '@/db/client';

// Leer
const user = await prisma.user.findUnique({
  where: { bungieMembershipId: id }
});

// Crear
const loadout = await prisma.loadout.create({
  data: { userId, name, classType, items: { create: items } },
  include: { items: true }
});

// Actualizar
await prisma.user.update({
  where: { id },
  data: { accessToken: newToken }
});

// Eliminar (cascade a items)
await prisma.loadout.delete({ where: { id } });
```

## Archivos relacionados

- `prisma/schema.prisma` → Schema de la BD
- `src/db/client.ts` → Singleton de Prisma Client

## Buenas prácticas

- Siempre usar `include` cuando necesites relaciones
- Usar transacciones para operaciones que afectan múltiples tablas
- Nunca hardcodear IDs — usar `cuid()` como default
