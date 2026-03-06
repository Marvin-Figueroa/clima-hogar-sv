# Flujo de CI/CD — clima-hogar-sv

## Visión general

Todo cambio de código sigue este camino antes de llegar a producción:

```
feature/* → (PR + CI) → dev → (deploy automático)  → development
                           → (manual + aprobación) → staging
                           → (manual + aprobación) → production → auto-merge → main
```

Nunca se escribe directamente en `dev` ni en `main` — todo entra por Pull Request o por el workflow de producción.

---

## Ramas

| Rama        | Propósito                                                                       |
| ----------- | ------------------------------------------------------------------------------- |
| `feature/*` | Trabajo activo en una funcionalidad o fix                                       |
| `dev`       | Rama de integración y fuente de todos los deploys                               |
| `main`      | Registro histórico de producción — actualizado automáticamente tras cada deploy |

### Reglas de protección

Tanto `dev` como `main` tienen branch protection rules activas:

- **No se puede hacer push directo** — todo debe venir por PR
- **El CI debe pasar** antes de poder mergear (Lint + Format + Build en verde)
- **No se puede borrar** la rama accidentalmente
- **No se permiten force pushes** (reescribir historial)

---

## Ambientes

| Ambiente      | Rama fuente | ¿Cómo se actualiza?                   | ¿Requiere aprobación? |
| ------------- | ----------- | ------------------------------------- | --------------------- |
| `development` | `dev`       | Automáticamente en cada merge a `dev` | No                    |
| `staging`     | `dev`       | Manualmente desde GitHub Actions UI   | Sí                    |
| `production`  | `dev`       | Manualmente desde GitHub Actions UI   | Sí                    |

Todos los ambientes se alimentan de `dev`. `main` se actualiza automáticamente como registro histórico después de cada deploy exitoso a producción.

Los ambientes están configurados en: **GitHub repo → Settings → Environments**

---

## Workflows de GitHub Actions

### `ci.yml` — Integración continua

**Se dispara en:** Cualquier Pull Request que apunte a `dev` o `main`.

Corre 3 jobs **en paralelo**, cada uno en una máquina virtual Ubuntu independiente:

#### Job: `lint`

```
1. Checkout del código del PR
2. Setup Node.js (versión definida en .nvmrc)
3. npm ci                  ← instala dependencias exactas del lock file
4. npm run lint            ← ESLint valida .astro, .ts, .js
```

Detecta: variables sin usar, uso de `var` en vez de `const`, patrones problemáticos.

#### Job: `format`

```
1. Checkout del código del PR
2. Setup Node.js
3. npm ci
4. npm run format:check    ← Prettier verifica el formato sin modificar archivos
```

Falla si algún archivo no está formateado correctamente. Solución local: `npm run format`.

#### Job: `build`

```
1. Checkout del código del PR
2. Setup Node.js
3. npm ci
4. npm run build           ← astro build compila el sitio completo
```

Atrapa errores de compilación en `.astro`, importaciones inexistentes, TypeScript inválido.

**Si algún job falla:** El PR queda bloqueado — no se puede mergear hasta que todos estén en verde.
**Si los 3 pasan:** El botón de merge se activa en el PR.

---

### `deploy-dev.yml` — Deploy a Development

**Se dispara en:** Cada push a la rama `dev` (es decir, cada merge de PR).

```
1. Checkout de 'dev'
2. Setup Node.js
3. npm ci
4. astro build             ← genera la carpeta dist/
5. Deploy a Netlify DEV    ← usando NETLIFY_SITE_ID_DEV
   production-deploy: false
```

El build se despliega al sitio Netlify del ambiente de development. Netlify lo registra como deploy de preview (no sobreescribe el slot de producción).

---

### `deploy-staging.yml` — Promoción a Staging

**Se dispara en:** Solo manualmente desde **GitHub → Actions → Deploy — Staging → Run workflow**.

Al dispararlo, GitHub solicita un motivo de promoción (campo de texto libre) y luego **pausa el job** esperando aprobación del reviewer configurado en el Environment `staging`.

```
1. Pausa → espera aprobación manual
2. Checkout de la rama 'dev' (sempre toma dev, no main)
3. Setup Node.js
4. npm ci + astro build
5. Deploy a Netlify STAGING ← usando NETLIFY_SITE_ID_STAGING
   production-deploy: false
```

**¿Cuándo promover a staging?** Cuando `dev` tiene un conjunto de features listas para validación final antes de ir a producción.

---

### `deploy-prod.yml` — Deploy a Production

**Se dispara en:** Solo manualmente desde **GitHub → Actions → Deploy — Production → Run workflow**.

Al dispararlo, GitHub solicita un motivo de promoción y luego **pausa el job** esperando aprobación del reviewer configurado en el Environment `production`.

```
1. Pausa → reviewer recibe notificación en GitHub
2. Reviewer aprueba en: repo → Actions → workflow en espera → Review deployments
3. Checkout de la rama 'dev' (siempre toma dev como fuente)
4. Setup Node.js
5. npm ci + astro build
6. Deploy a Netlify PROD     ← usando NETLIFY_SITE_ID_PROD
   production-deploy: true   ← marca como deploy de producción en Netlify
7. Auto-merge de dev → main  ← registra en main exactamente lo que está en prod
```

`production-deploy: true` indica a Netlify que este build es el canónico de producción — actualiza el dominio personalizado.

> **Nota:** Para que el auto-merge funcione, ve a **Settings → Actions → General → Workflow permissions** y activa **"Read and write permissions"**. Además, en la branch protection de `main`, habilita **"Allow specified actors to bypass required pull request reviews"** y agrega `github-actions[bot]`.

---

## Secrets de GitHub Actions

Configurados en: **GitHub repo → Settings → Secrets and variables → Actions**

| Secret                    | Descripción                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `NETLIFY_AUTH_TOKEN`      | Token personal de acceso a Netlify (User settings → Applications) |
| `NETLIFY_SITE_ID_DEV`     | Site ID del sitio Netlify del ambiente development                |
| `NETLIFY_SITE_ID_STAGING` | Site ID del sitio Netlify del ambiente staging                    |
| `NETLIFY_SITE_ID_PROD`    | Site ID del sitio Netlify del ambiente production                 |

Los secrets nunca aparecen en los logs de los workflows — GitHub los enmascara automáticamente.

---

## El flujo completo día a día

```
# 1. Crear rama desde dev
git checkout dev
git pull origin dev
git checkout -b feature/nombre-feature

# 2. Codear, hacer commits
git add -A
git commit -m "feat: descripción del cambio"

# 3. Subir rama a GitHub
git push origin feature/nombre-feature

# 4. Abrir PR en GitHub: feature/nombre-feature → dev
#    El CI corre automáticamente (lint + format + build)

# 5. CI verde → hacer merge del PR
#    deploy-dev.yml corre automáticamente

# 6. Verificar en el sitio dev de Netlify

# 7. Cuando esté listo para staging:
#    GitHub → Actions → Deploy — Staging → Run workflow → aprobar

# 8. Verificar en el sitio staging de Netlify

# 9. Cuando esté listo para producción:
#    GitHub → Actions → Deploy — Production → Run workflow → aprobar
#    El workflow deploya y luego hace auto-merge de dev → main
```

---

## Ciclo de corrección cuando el CI falla

Si el CI reporta un error en el PR:

```
# Ver el error en GitHub (pestaña Checks del PR)
# Corregir localmente en tu rama

git add -A
git commit -m "fix: corregir error de lint/format/build"
git push origin feature/nombre-feature

# El CI corre automáticamente sobre el nuevo commit
# No necesitas cerrar ni reabrir el PR
```

---

## Versión de Node.js

La versión de Node.js está fijada en `.nvmrc` en el root del proyecto.

- **Localmente:** `nvm use` al entrar al proyecto (lee `.nvmrc` automáticamente)
- **En CI/CD:** todos los workflows leen `.nvmrc` via `node-version-file: '.nvmrc'`

Esto garantiza que el entorno local y el de GitHub Actions usan exactamente la misma versión.
