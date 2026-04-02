# Cover Block Parallax Style — Changelog & Summary

## Repository

- **GitHub:** https://github.com/dhanson-wp/cover-block-parallax
- **Latest Release (v1.2.0):** https://github.com/dhanson-wp/cover-block-parallax/releases/tag/v1.2.0
- **Download ZIP:** https://github.com/dhanson-wp/cover-block-parallax/releases/download/v1.2.0/cover-parallax-style.zip
- **All Issues:** https://github.com/dhanson-wp/cover-block-parallax/issues
- **All Pull Requests:** https://github.com/dhanson-wp/cover-block-parallax/pulls?q=is%3Apr+is%3Aclosed
- **README:** https://github.com/dhanson-wp/cover-block-parallax/blob/main/README.md
- **License:** GPL v2 — https://github.com/dhanson-wp/cover-block-parallax/blob/main/LICENSE

---

## What the Plugin Does

Cover Block Parallax Style adds a smooth, GPU-accelerated parallax scrolling effect to the native WordPress Cover block. Instead of a static or fixed background, the background image or video moves at a different rate than the page content as the user scrolls, creating a sense of depth and visual polish — with no custom blocks or shortcodes required.

### Key Features

- **One-click enable** — Toggle "Parallax background" in any Cover block's settings panel
- **Adjustable speed** — Choose from 5 presets (1–5) or dial in a custom value (0.1–1.0)
- **Per-block mobile control** — New in v1.2.0: optionally disable parallax on mobile for individual blocks
- **Accessibility-first** — Automatically respects `prefers-reduced-motion`
- **Performance-optimized** — Uses `requestAnimationFrame`, CSS transforms with GPU acceleration, passive event listeners, and viewport culling
- **Mutually exclusive with fixed background** — Enabling parallax automatically disables WordPress's built-in fixed background, and vice versa
- **Live editor preview** — See the parallax effect in real-time inside the block editor

---

## Changelog

### v1.2.0 — April 2026

9 issues resolved across 7 pull requests. This release focuses on bug fixes, performance improvements, and a new per-block mobile control.

#### Bug Fixes

- **Default speed mismatch between editor and frontend** ([#11](https://github.com/dhanson-wp/cover-block-parallax/issues/11), [PR #14](https://github.com/dhanson-wp/cover-block-parallax/pull/14))
  The editor defaulted `parallaxSpeed` to `0.3`, but the frontend fallback was `0.5`. If the data attribute was missing, the frontend rendered a different speed than what the editor showed. Both now default to `0.3`.

- **Parallax never activated if page loaded on a narrow viewport** ([#7](https://github.com/dhanson-wp/cover-block-parallax/issues/7), resolved by [PR #19](https://github.com/dhanson-wp/cover-block-parallax/pull/19))
  The mobile check ran once at load time and exited the entire script early, so resize and scroll listeners were never registered. Resizing from narrow to wide would never initialize parallax. Fixed by moving the mobile check into the per-block initialization logic instead of using it as an early script exit.

- **Resize handler removed scroll listener but never re-added it** ([#8](https://github.com/dhanson-wp/cover-block-parallax/issues/8), resolved by [PR #19](https://github.com/dhanson-wp/cover-block-parallax/pull/19))
  When resizing to mobile, the scroll listener was removed. Resizing back to desktop called `initParallax()` but never re-attached the scroll listener, breaking parallax after any mobile-to-desktop transition. The rewritten resize handler now properly reinitializes all state.

- **Editor iframe detection polled indefinitely** ([#9](https://github.com/dhanson-wp/cover-block-parallax/issues/9), [PR #16](https://github.com/dhanson-wp/cover-block-parallax/pull/16))
  The editor used `setTimeout` polling to find `iframe[name="editor-canvas"]` with no retry limit. If the iframe name changed in a future WordPress update, this would loop forever. Now capped at 60 retries (30 seconds) for iframe search and 15 retries (3 seconds) for setup, with console warnings on exhaustion.

#### Enhancements

- **Per-block "Disable on mobile" toggle** ([#4](https://github.com/dhanson-wp/cover-block-parallax/issues/4), [PR #19](https://github.com/dhanson-wp/cover-block-parallax/pull/19))
  Previously, parallax was globally disabled on all blocks at mobile widths (≤768px). Now, parallax works on mobile by default, and a new "Disable on mobile" toggle in the settings panel lets users opt out on a per-block basis. Blocks with this toggle enabled fall back to a static background on mobile while other parallax blocks on the same page remain active.

- **Increased background oversizing from 130% to 140%** ([#3](https://github.com/dhanson-wp/cover-block-parallax/issues/3), [PR #18](https://github.com/dhanson-wp/cover-block-parallax/pull/18))
  At maximum speed (1.0), the 130% background height left zero margin for sub-pixel rounding, risking hairline gaps at the top or bottom of the cover block. Increased to 140% (the standard for production parallax libraries like Rellax, GSAP ScrollTrigger, and Locomotive Scroll) with the offset multiplier updated from 0.15 to 0.20. Negligible performance impact since compositing is GPU-accelerated.

- **Frontend script moved to footer** ([#6](https://github.com/dhanson-wp/cover-block-parallax/issues/6), [PR #17](https://github.com/dhanson-wp/cover-block-parallax/pull/17))
  `frontend.js` was enqueued with `$in_footer = false`, making it render-blocking in the `<head>`. Since the script already handles `DOMContentLoaded` gracefully, it now loads in the footer, improving page load performance.

#### DevOps & Repo Hygiene

- **Moved build-only dependencies to devDependencies** ([#10](https://github.com/dhanson-wp/cover-block-parallax/issues/10), [PR #12](https://github.com/dhanson-wp/cover-block-parallax/pull/12))
  `@babel/runtime` (bundled at build time by `@wordpress/scripts`) and `@wordpress/icons` (provided by WordPress at runtime) were incorrectly listed in `dependencies`. Moved to `devDependencies` where they belong.

- **Track source files, ignore build output** ([#5](https://github.com/dhanson-wp/cover-block-parallax/issues/5), [PR #13](https://github.com/dhanson-wp/cover-block-parallax/pull/13))
  The `src/` directory was tracked but `build/` (minified output) was also committed. This is backwards for open-source development — source should be tracked and build artifacts ignored. Build output is now gitignored; contributors run `npm run build` to generate it.

- **Fixed Plugin URI** — The plugin header pointed to the wrong GitHub org. Now correctly links to `https://github.com/dhanson-wp/cover-block-parallax`.

---

### v1.1.0 — Initial Public Release

- **Speed control feature** ([PR #1](https://github.com/dhanson-wp/cover-block-parallax/pull/1))
  Added adjustable parallax speed with two modes: a simple 1–5 preset slider and a custom input (0.1–1.0 with 0.05 step). Includes a settings toggle button to switch between modes.

### v1.0.0 — MVP

- Initial release with parallax background toggle for the Cover block
- GPU-accelerated CSS transforms with `will-change` and `backface-visibility`
- `requestAnimationFrame`-based scroll handling
- Accessibility support via `prefers-reduced-motion`
- Mobile disable at ≤768px
- Live editor preview via iframe MutationObserver
- Mutual exclusivity with WordPress's built-in fixed background option

---

## Technical Architecture (for reference)

The plugin extends the native `core/cover` block using WordPress hooks — no custom blocks are registered. It adds two custom attributes (`hasParallaxScroll`, `parallaxSpeed`, and as of v1.2.0, `parallaxHideOnMobile`) via the `blocks.registerBlockType` filter, injects editor UI via `editor.BlockEdit`, and serializes data attributes to the saved HTML via `blocks.getSaveContent.extraProps`.

The parallax effect uses a three-layer DOM approach:
1. **Background layer** — Positioned absolute, sized 140% of the container, offset by -20% to center, animated via `translateY()`
2. **Gradient overlay** — z-index 1, between background and content
3. **Content layer** — z-index 2, position relative, normal document flow

The frontend script (1.4KB minified) uses `requestAnimationFrame` throttling, passive event listeners, and viewport culling to minimize performance impact.

---

## File Structure

```
cover-parallax-style/
├── cover-parallax-style.php    — Plugin entry point, asset enqueuing
├── src/
│   ├── index.js               — Editor: attributes, controls, preview (485 lines)
│   ├── frontend.js            — Frontend: parallax scroll effect (149 lines)
│   └── style.scss             — Styles for both editor and frontend
├── build/                     — Compiled output (gitignored, generated by npm run build)
├── package.json               — NPM config and build scripts
├── webpack.config.js          — Custom entry points for wp-scripts
├── README.md
└── LICENSE
```
