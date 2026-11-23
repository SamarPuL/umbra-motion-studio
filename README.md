# Umbra Motion Studio

[Open the screening room](https://samarpul.github.io/umbra-motion-studio/)

A static film portfolio inspired by [Distaste Studio’s walkthrough](https://www.youtube.com/watch?v=gf_l2e6PPAE). The three fictional worlds, studio identity, generated stills, motion studies, and synthesized ambient soundtracks were created for this project.

## Run locally

Serve the repository root with any static server. For example:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. The site has no build step or runtime service dependencies. Images, fonts and films are served locally. The font licenses are in `assets/fonts`.

## Publish and edit

GitHub Pages serves the root of `main`. Pushing changes to that branch publishes a new version. The same site files can be served from a static Hostinger web root.

The `films` collection at the start of `app.js` contains the study titles, notes and shot names. Media lives in `assets/stills` and `assets/films`. The opening frame also appears in `index.html` so it can paint before JavaScript runs.

The hero scrubs the first shot as the page scrolls. Reduced-motion and data-saving preferences keep the opening still. The darkroom lets visitors edit a three-shot sequence, develop an alternate frame, adjust exposure, and apply print, silver, or bleach grades.
