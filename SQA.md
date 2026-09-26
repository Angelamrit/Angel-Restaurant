# Speed and software quality

Speed is the highest design priority, with accessibility, security and correctness required for release. Preserve the restaurant's typography, imagery and booking path while removing unnecessary browser work.

## Release targets

| Area | Required evidence |
| --- | --- |
| Loading | LCP <= 2.5 s at the 75th percentile of real visits, separately for mobile and desktop |
| Responsiveness | INP <= 200 ms at the 75th percentile |
| Visual stability | CLS <= 0.1 at the 75th percentile |
| Media | The requested hero video autoplays muted while visible and pauses when hidden or offscreen; only the selected slideshow/dish image is mounted |
| Accessibility | WCAG 2.2 AA review, keyboard navigation, dialog focus containment/return, visible focus, reduced motion, contrast and readable zoom |
| Responsive design | No horizontal overflow at 390 px and 1440 px; manual review at 320 px and 200% zoom before release |
| Correctness | Lint, TypeScript, unit tests, browser workflow tests and production build pass |
| Security | Guarded admin mutations, origin checks, validated uploads/input, no public secrets; verify deployed headers |

Core Web Vitals thresholds: [Google PageSpeed Insights documentation](https://developers.google.com/speed/docs/insights/v5/about). Local browser tests are regression checks, not proof of field performance or complete WCAG conformance. Use production builds for timing and compare at least three cold-load mobile runs under the same network/CPU settings. Record transferred JS, CSS, fonts and images by route; fail review on unexplained growth. Establish numeric transfer budgets from that baseline before adding more visual features.

## Framework and dependency policy

- Keep the existing Next.js/React application for its server rendering, image optimization, admin routes and database integration. This is not a claim that it is the smallest framework; reconsider architecture only with equivalent-workflow measurements and a migration plan.
- Prefer semantic HTML, native scrolling/dialogs, CSS and small browser observers. No new animation, scrolling, carousel or UI framework without demonstrating why native capabilities are insufficient and measuring the added transfer/runtime cost.
- Keep content on the server and client components limited to interactions. Avoid polling and continuous animation loops. Reserve image space and provide responsive sizes.
- Keep essential content visible before hydration and when JavaScript fails. The hero video is the client's autoplay exception; start it muted when visible, respect reduced motion, and pause it when hidden/offscreen. Slideshow progression starts on user intent.

## Inspection findings — 23 September 2026

Implemented: removed Lenis and its perpetual animation loop from the site, removed the mounted cursor overlay, replaced scroll/pointer-driven decoration with a brief offscreen entrance observer, removed pre-hydration hiding and delayed hero entrances, stopped ambient animation, kept an optimized poster behind the client-requested muted autoplay video, mounted only selected slideshow/dish images, and used a native gallery dialog for keyboard focus containment.

Existing strengths: optimized image component, self-hosted framework fonts, semantic page structure, skip link, reduced-motion styles, server validation, administrator authorization, origin checks, error routes and existing menu lifecycle tests.

Remaining review items:

- The streamed menu loading boundary currently requires JavaScript to reveal the completed menu. Homepage and visit information have separate no-JavaScript regression coverage; a complete no-JavaScript menu fallback remains open.

- Homepage/menu are force-dynamic and public menu queries are only deduplicated within a request. Measure database latency in the deployment region before introducing caching; invalidation must preserve immediate admin menu updates.
- CSP is report-only. Audit production third-party scripts and reports before enforcing it.
- Global styles, multiple font weights and decorative CSS remain optimization candidates. Measure production route transfer before splitting or removing them.
- Full automated contrast auditing, real-device/browser coverage, deployed Core Web Vitals and production enquiry delivery still require verification. The browser regression suite does not certify these.

## Checks

Motion refinement: finite CSS/Web Animations API effects use 260–480 ms durations, small translations and a maximum 120 ms stagger. No animation dependency was added. The focused `luxury-motion.spec.ts` browser check passed for immediate content, opt-in media, settled animations, menu navigation, mobile overflow and reduced motion. Lint, TypeScript and the production build also passed for this refinement. This focused result does not resolve the earlier full-suite findings below.

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`. Browser tests use an isolated seeded database. `tests/browser/sqa.spec.ts` covers public route overflow, content without JavaScript, hero autoplay and gallery keyboard containment/return. Screenshots are saved under ignored `test-results/` for visual review.

### Verification status

- Five unit tests passed. Final lint and TypeScript checks passed after the keyboard/CSS cleanup.
- In the earlier opt-in implementation, nine public routes passed at both 390 px and 1440 px with no page errors or horizontal overflow; the header scroll regression passed. Autoplay changes need a fresh browser run.
- The first browser run caught gallery focus wrapping and outdated animation-class assertions, now corrected. Their final rerun could not complete: the test server and test runner exhausted host memory. The no-JavaScript menu limitation remains documented above.
- The existing admin lifecycle test failed when restoring a dish's availability, leaving an extra test dish that caused a later count assertion to fail. Reproduce on a healthy host using the isolated test database; this is unresolved, not a passing workflow.
- The final production build passed, including generation of all 19 static outputs. Earlier attempts ran out of disk space and encountered an incomplete generated test type file during concurrent regeneration. A production performance baseline has not been measured.
- Generated project caches were cleared and isolated test compiler persistence disabled. The machine also reported paging-file exhaustion. Free disk/memory before rerunning; do not interpret these host failures as production performance measurements.
