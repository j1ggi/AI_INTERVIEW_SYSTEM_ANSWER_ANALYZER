# Design System: MockVue (Google Stitch Semantic Specification)

## 1. Visual Theme & Atmosphere
MockVue follows an architectural, engineering-grade software aesthetic inspired by Google Stitch, Linear, and modern developer tooling.
- **Atmosphere:** Daily App Balanced (Density: 5/10, Variance: 7/10, Motion: 5/10).
- **Mood:** Clinical, confident, distraction-free, and tactile. Built for high-stakes technical assessment, viva examinations, and placement preparation.
- **Spatial Separation:** Strict planar zones with hairline structural dividers (`1px border`) rather than heavy multi-layered glassmorphism or floating neon blurs.

## 2. Color Palette & Functional Roles
- **Canvas Base (Dark):** `#090A0F` — Deep carbon off-black. Never pure `#000000`.
- **Canvas Base (Light):** `#F8FAFC` — Crisp slate white.
- **Surface Elevation 1 (Card/Container):** `#11141E` (Dark) / `#FFFFFF` (Light).
- **Surface Elevation 2 (Elevated/Dropdown/Popover):** `#171B28` (Dark) / `#F1F5F9` (Light).
- **Structural Hairline Border:** `rgba(255, 255, 255, 0.08)` (Dark) / `rgba(15, 23, 42, 0.08)` (Light).
- **Active Structural Border:** `rgba(255, 255, 255, 0.16)` (Dark) / `rgba(15, 23, 42, 0.16)` (Light).
- **Primary Text:** `#F1F5F9` (Dark) / `#0F172A` (Light) — High-contrast, sharp optical legibility.
- **Secondary Text:** `#94A3B8` (Dark) / `#64748B` (Light) — Subdued editorial guidance.
- **Muted Text / Metadata:** `#64748B` (Dark) / `#94A3B8` (Light).
- **Singular Brand Accent:** **Precision Cobalt** (`#2563EB` dark / `#1D4ED8` hover) — Saturation calibrated to 78%. Replaces generic purple/neon AI glows with focused developer-grade clarity.
- **Semantic Emerald (Success / Passes / 80%+):** `#10B981` (Dark) / `#059669` (Light).
- **Semantic Amber (Needs Work / Warning):** `#F59E0B` (Dark) / `#D97706` (Light).
- **Semantic Rose (Critical / Violations):** `#EF4444` (Dark) / `#DC2626` (Light).

## 3. Typography Architecture
- **Display & Section Headers:** `Plus Jakarta Sans` — Tight tracking (`-0.03em`), optical weight hierarchy (700/800 bold), high-contrast solid text. No rainbow gradient fills on main headlines.
- **Body & Form Descriptions:** `Plus Jakarta Sans` (400/500) — Relaxed line height (`1.6`), max 65 characters per line for reading comfort.
- **Mono / Metrics / Numerical Data:** `JetBrains Mono` — Mandatory for all scores, timers, percentages, rubric weights, code snippets, question badges, and system telemetry.
- **Banned:** `Inter` for primary display headings, generic serif fonts (`Times New Roman`, `Georgia`), comic or playful scripts.

## 4. Component Stylings & Interaction
- **Tactile Buttons:**
  - Solid 1px structural border with subtle inset shadow.
  - Active press feedback: `active:translate-y-[1px]` tactile depression.
  - Primary button: Solid Precision Cobalt (`bg-blue-600 hover:bg-blue-500 text-white shadow-sm`). No neon outer glow or diffuse purple drop shadow.
  - Secondary button: Ghost hairline (`bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-200`).
- **Cards & Containers:**
  - Micro-rounded corners (`rounded-xl` or `rounded-2xl`).
  - Subtle hairline border (`border border-white/[0.08]`).
  - Strict 2-column or 3-column asymmetric bento layouts rather than identical 3-box rows.
  - Deep layout structures use top-border dividers (`border-t border-white/[0.08]`) to avoid nested card-inside-card syndrome.
- **Micro Badges:**
  - Compact `font-mono text-xs font-medium px-2 py-0.5 rounded-md border`.
  - Desaturated colored indicator dots (2px × 2px) to denote status.
- **Skeletal Loaders:**
  - Dimension-accurate pulsing bars (`bg-white/[0.06] animate-pulse rounded-md`). Banned generic spinning daisy wheels.
- **Inputs & Controls:**
  - Dark background (`bg-[#0B0D14]`), hairline border (`border-white/[0.1]`), focus ring in Precision Cobalt (`focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30`).

## 5. Layout & Spatial Principles
- **Hero Section:** Asymmetric split structure. Left: authoritative value proposition with inline technical tags, concrete metric, single primary CTA. Right: live interactive interview simulator with terminal telemetry and real-time rubric inspector.
- **Feature Showcase:** Asymmetrical Bento Grid with differentiated aspect ratios (e.g. 2/3 vs 1/3 card weight, code terminal, live anti-cheat camera preview) instead of 3 identical horizontal cards.
- **Interview Cockpit:** Clean split layout — Left: question prompt, timer, domain tags, microphone activity meter; Right: answer composition with real-time word counter, audio visualizer, anti-cheat proctoring indicator, and submit action.
- **Mobile Behavior:** Full responsive collapse below 768px with single column flow and minimum 44px tap targets.

## 6. Anti-Patterns (Explicitly Banned)
- ❌ **No emojis** anywhere in the product UI (replace with precise Lucide SVG icons).
- ❌ **No purple/pink neon outer glow shadows** (`shadow-glow`, neon button glows).
- ❌ **No 3 equal horizontal cards** in feature sections.
- ❌ **No AI copywriting clichés** ("Elevate", "Seamless", "Unleash your potential", "Next-Gen AI magic").
- ❌ **No pure `#000000`** backgrounds (use Charcoal `#090A0F`).
- ❌ **No centered hero with dark gradient blob background**.
- ❌ **No fake round numbers** (`99.9% success rate`). Real architectural metrics only.
- ❌ **No spinning daisy wheel loaders**.
