# StatzPro v11.1-beta — Notas del paquete final

Build OK · 142/142 tests pasan al momento de empaquetar.

## Cambios respecto a v11.0

### 1. Fix de sync — version check al boot
Archivo nuevo: `src/lib/app-version.ts`. Define `APP_VERSION = 'v11.1-beta'` y
corre `runVersionCheck()` como side-effect en su evaluación. En `main.tsx` se
importa PRIMERO, antes que `./lib/store`, para que el wipe de localStorage
suceda **antes** de que zustand re-hidrate.

Cuando la versión guardada en localStorage no coincide con `APP_VERSION`,
se limpian las siguientes claves:
- `handball-pro-v11` (store zustand)
- `hp_last_user_id`
- `hp_tutorial_completed`
- `hp_beta_banner_dismissed`
- `hp_sync_queue`, `hp_pending_events`, `hp_pending_teams`, `hp_pending_players`

Para forzar un reset masivo en el futuro: cambiar la constante `APP_VERSION`
en `app-version.ts`. Todos los clientes que actualicen entrarán fresh.

### 2. Modo Beta
`src/lib/use-plan.ts` ahora exporta:
- `BETA_UNTIL = new Date('2026-08-09T23:59:59-03:00')`
- `usePlan()` retorna también `betaActive: boolean` y `betaUntil: Date`
- `hasCompleteMode(p)` y `hasVideoAndAI(p)` aceptan tanto `Plan` (string) como
  `{ plan: Plan, betaActive?: boolean }`. Si `betaActive` es true, devuelven
  true sin importar el plan.
- `betaDaysLeft()` helper

`pro-gate.tsx` y `live-match-page.tsx` actualizados a la nueva firma.

### 3. Banner Beta
`src/components/beta-banner.tsx`. Renderizado dentro del `<main>` de
`app-shell.tsx`, así aparece en todas las pantallas de `/app/*`.
Dismissible con TTL de 24h (reaparece al día siguiente).

### 4. Sistema de tickets
- `src/features/support/support-page.tsx` (form 5 categorías + lista de mis tickets)
- `src/features/admin/admin-tickets-panel.tsx` (filtros por estado, responder, cambiar status)
- Tab "🎫 Tickets" en `admin-page.tsx`
- Ruta `/app/support` en `app.tsx`
- Link "💬 Soporte" en sidebar
- Opción "🎫 Crear ticket" en el FAB de `support-button.tsx`

**RPCs de Supabase que se usan (verificar que coincidan con tu DB):**
| Lado | RPC | Params |
|---|---|---|
| user | `list_my_tickets()` | — |
| user | `create_support_ticket` | `p_category`, `p_subject`, `p_body` |
| admin | `admin_list_tickets()` | — |
| admin | `admin_reply_ticket` | `p_ticket_id`, `p_reply` |
| admin | `admin_set_ticket_status` | `p_ticket_id`, `p_status` |

Si los nombres reales son distintos, hay que renombrar las llamadas en los
dos archivos de support.

### 5. Fix player picker
`features/live-match/player-picker.tsx` — la sección "➕ Agregar jugador no
registrado" ahora aparece **siempre** debajo del roster, no sólo cuando el
equipo no tiene roster cargado.

### 6. Modos experimentales (Superpower + UI Pro Max)
Toggles en el store (`superpowerMode`, `uiProMax`) — persisten en
localStorage. Se controlan desde la sidebar con el botón "⚙️ Modos".
Componente: `src/components/settings-panel.tsx`.

#### Superpower Mode (`src/features/live-match/superpower-bar.tsx`)
Barra que se inserta arriba del scoreboard cuando el toggle está activo.
Muestra:
- Marcador denso con reloj
- Por equipo: botones `+1` (gol), `ATJ` (atajada), `ERR` (errado),
  `PER` (pérdida), `2'` (exclusión) — un solo tap registra el evento.
- Botón "↶ Deshacer" para borrar el último evento si tap accidental.

Los eventos quedan sin zona/cuadrante/jugador (campos `null`) y con
`quickMode: true`. El coach puede volver luego al timeline a editar
si necesita detalle.

**Decisión consciente:** la barra de superpower **convive** con la UI normal.
No la reemplaza, la suplementa. Si tocás la cancha y el goal grid, seguís
con el flujo completo de siempre. La barra es para los goles obvios donde
no querés perder tiempo en diálogos.

#### UI Pro Max (`src/styles/globals.css`)
Cuando el toggle está activo, se aplica la clase `ui-pro-max` al root del
AppShell. CSS adicional (al final de `globals.css`):
- Tracking sutilmente negativo en títulos
- `font-variant-numeric: tabular-nums` para stats
- Padding lateral mayor en desktop (max-width 80rem)
- Cards: hover con borde primario sutil y box-shadow
- Botones primarios: gradient con brillo en hover
- Sidebar nav: barrita lateral activa más expresiva
- Scoreboard: peso tipográfico extra en numerales grandes

Filosofía: todo bajo `.ui-pro-max` para que no afecte la UI default. Para
expandir, agregá más reglas en la sección "UI PRO MAX" de globals.css.

## Lo que NO se hizo (y por qué)

- **No se tocó la BD de Supabase** — el frontend asume las 6 RPCs de tickets
  ya existen con los nombres convencionales descriptos arriba. Si en tu DB
  los nombres son otros, hay que ajustar las llamadas o renombrar las RPCs.
- **No se tocó el partido GEI BE vs Atlanta** — sigue intacto.
- **No se tocaron los equipos GEI y GEI BE** — siguen intactos.
- **No se modificó el share token** — `uu7xd22fj5ws` sigue válido.
- **No se clonaron repos de terceros** (obra/superpowers, ui-ux-pro-max-skill).
  El diseño de Superpower y UI Pro Max es propio, basado en la descripción
  del producto. Si querés inspirarte de esos repos, son punto de partida
  para iterar — no autoridad final sobre el comportamiento.

## Verificación pre-paquete

```
npm install   ✓ 272 packages, sin vulnerabilidades reportadas
npm run build ✓ 212 modules transformed, sin errores TS
npm run test:run ✓ 142/142 tests pass
```
