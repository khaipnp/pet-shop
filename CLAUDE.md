# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- Next.js 16 App Router, React 19, TypeScript strict mode.
- Tailwind CSS 4 with shadcn `base-vega`, Base UI, CSS variables, and Lucide icons.
- Prisma 7 with `@prisma/adapter-pg` against PostgreSQL.
- npm is the package manager; `package-lock.json` is authoritative. Docker builds with Node 22.

## Commands

```bash
rtk npm install                 # Install dependencies
rtk cp .env.example .env        # Create local environment file
rtk npx prisma generate         # Regenerate Prisma client after schema changes
rtk npx prisma migrate dev      # Create/apply development migrations
rtk npx prisma studio           # Inspect local database
rtk npm run dev                 # Development server at http://localhost:3000
rtk npm run lint                # ESLint
rtk npx tsc --noEmit            # Type-check without emitting files
rtk npm run build               # Production build
rtk npm run start               # Serve production build
```

`DATABASE_URL` and `JWT_SECRET` are required for normal local operation. DB-backed routes render through Prisma, so keep PostgreSQL reachable when developing or building them.

No test runner, test script, test configuration, or test files currently exist. Therefore no single-test command exists. Until test infrastructure is added, validation consists of lint, type-check, and build. `prisma/seed.ts` exists, but no Prisma seed command is configured in `prisma.config.ts`.

## Architecture

- Application is a single full-stack Next.js App Router deployment. Route pages and layouts live under `src/app`; Route Handlers under `src/app/api` provide mutations and JSON endpoints in the same process.
- Server Components are the primary data layer. Pages such as home, shop, cart, checkout, account, and admin query Prisma directly rather than calling internal APIs.
- Interactive pieces are small client islands colocated with their routes. They keep local UI state, call Route Handlers, then commonly use `router.refresh()` to reload server-rendered data. No Redux, Zustand, React Query, or application-wide context exists.
- Root layout always renders `Header`, page content, and `Footer`. `/admin` adds a nested authenticated layout with sidebar/topbar; it still inherits root chrome.
- Authentication is custom bcrypt + JWT. `src/lib/auth.ts` reads the `auth_token` HTTP-only cookie and resolves the current user from PostgreSQL. There is no middleware; protected pages and Route Handlers perform authorization explicitly.
- `src/lib/prisma.ts` owns the Prisma singleton and PostgreSQL pool. Prisma 7 requires the `PrismaPg` adapter; preserve this adapter pattern when creating DB clients or scripts.
- Core relational flow is defined in `prisma/schema.prisma`: users own one cart and many orders; categories form a self-referencing tree; products belong to categories; order items snapshot product name, price, quantity, and image.
- Cart mutations use `/api/cart`. Checkout recreates prices from persisted cart/product data via `/api/orders`, creates an order, updates stock/sales counters, then clears cart. Bank-transfer confirmation enters through `/api/webhook/sepay` and updates payment status.
- Public storefront routes are `/`, `/shop`, `/shop/[slug]`, `/cart`, `/checkout`, `/account`, and `/auth/*`. Admin routes under `/admin` manage dashboard, products, categories, and orders.
- Shared primitives live in `src/components/ui`; route-specific client components remain beside their pages. Design tokens and Tailwind theme mapping live in `src/app/globals.css`; `cn()` in `src/lib/utils.ts` merges classes.
- `@/*` maps to `src/*`. Next standalone output feeds the multi-stage `Dockerfile`; Compose publishes container port 3000 on host port 3001 and expects pre-existing external networks.

## Environment

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: signing secret; never rely on development fallback in production.
- `JWT_EXPIRES_IN`: optional token lifetime, defaults to `7d`.
- `SEPAY_WEBHOOK_SECRET`: optional in code, but required when accepting real SePay webhooks because missing value skips signature verification.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%). Format flags (-c, -l, -L, -o, -Z) run raw.
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->