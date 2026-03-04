# GitHub Copilot Instructions — clima-hogar-sv

## Project Context

This is an **Astro 5** static site for a Salvadoran air conditioning services company.
Stack: Astro · Tailwind CSS · Netlify (hosting + forms) · GitHub Actions (CI/CD).

The site is a single-page, scroll-based layout targeting Spanish-speaking audiences in El Salvador.
Performance, SEO, and accessibility are top priorities (target: Lighthouse ≥95/100/100).

## Branch & Environment Strategy

| Branch                  | Environment   | Deploy target                      |
| ----------------------- | ------------- | ---------------------------------- |
| `feature/*`             | —             | PR → `dev` only                    |
| `dev`                   | `development` | Auto-deploy on merge               |
| `dev` → manual approval | `staging`     | Manual promotion gate              |
| `main`                  | `production`  | Manual promotion gate from staging |

## Coding Conventions

- Language: **Spanish** for UI copy, **English** for code, comments, and commit messages.
- Component files: PascalCase (e.g., `Header.astro`, `HeroSection.astro`).
- Tailwind only — no custom CSS files unless strictly necessary.
- Prefer Astro components over framework components (React/Vue) unless interactivity demands it.
- Images: always use Astro's `<Image />` component for automatic WebP + lazy loading.
- Forms: use Netlify Forms (`data-netlify="true"`) — no backend required.
- Commits follow **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`, `test:`.

## Site Sections (implemented as individual Astro components)

1. Header (fixed, responsive hamburger menu)
2. Hero (full-bleed image, headline, 2 CTAs)
3. Services (3 cards: Installation, Maintenance, Emergency Repair)
4. Why Choose Us (4 pillars with icons)
5. Gallery (responsive grid + lightbox)
6. About Us (2-column: photo + text)
7. Quote Form (Netlify Form with honeypot)
8. Contact (tel: links, Google Maps embed)
9. Footer

## Design Principles (from frontend-design skill)

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.
Implement real working code with exceptional attention to aesthetic details and creative choices.

**Design thinking before coding:**

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Commit to a bold aesthetic direction — refined, trustworthy, and professional for a service business. Warm, approachable, not corporate-cold.
- **Differentiation**: What makes this UNFORGETTABLE?

**CRITICAL**: Choose a clear conceptual direction and execute with precision.

**Aesthetics guidelines:**

- **Typography**: Choose distinctive, characterful fonts. Avoid Inter/Roboto/Arial. Pair a display font for headlines with a refined body font.
- **Color**: Commit to a cohesive palette via CSS variables. Consider blues, whites, and warm accents (trust, cool air, El Salvador warmth).
- **Motion**: CSS-only animations preferred. Page load staggered reveals. Meaningful hover states.
- **Spatial Composition**: Generous whitespace, asymmetry where appropriate, grid-breaking hero elements.
- **Backgrounds**: Gradient meshes or noise textures for depth — avoid flat solid backgrounds.

NEVER use generic AI aesthetics: purple gradients on white, predictable card layouts, cookie-cutter design.

## Astro-Specific Notes

- Use `.astro` files for all static/presentational components.
- `src/layouts/Layout.astro` is the base layout — extend it for all pages.
- Frontmatter (`---`) block handles imports and data; template below the second `---`.
- For interactivity, prefer `<script>` tags with vanilla JS inside `.astro` files before reaching for a framework.
- `public/` folder is served as-is — put fonts, images, and robots.txt here.
- `src/assets/` for images that need Astro's `<Image />` optimization.
