# ItsWare redesign

Apple-style redesign concept for [itsware.com](https://itsware.com).

## Run locally

```bash
node serve.mjs
```

Then open http://localhost:4817.

## Structure

- `site/index.html`: the homepage
- `site/assets/css/style.css`, `site/assets/js/main.js`: styles and motion (GSAP, ScrollTrigger, Lenis, vendored in `assets/vendor`)
- `site/assets/img`: imagery, logos and video from the current itsware.com
- `site/assets/gen`: new imagery generated with Higgsfield (Nano Banana 2.1)
- `site/assets/fonts`: Maison Neue
