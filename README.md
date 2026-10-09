# Guizhou heritage gallery

A walkable 3D exhibition in the browser for two intangible cultural heritage crafts of Guizhou: **Anshun batik** and the **Miao sister-flute** (姊妹箫). Built during a university summer social-practice program in 2023, so that people who will never visit Anshun can still walk the room.

You walk a character through the hall in third or first person, stop at batik panels and video installations, and click a work to read about it. The hall, the character and the exhibits are glTF/FBX models; the batik panels use scanned textures with normal maps.

## How it works

- **Movement and collision.** A capsule collider moves against an octree built from the hall geometry, and a fan of short raycasts (0°, 45°, 90°, 135°, 180°) stops the character before walls. `three-mesh-bvh` accelerates the raycasts.
- **Interaction.** A click raycast picks the exhibit under the cursor and opens its description. When a raycast finds a video screen in reach, an on-screen hint appears and a key press plays it.
- **Look.** HDR environment lighting, area and spot lights per exhibit, a mirror floor (`Reflector.ts`), and a post-processing pass with depth of field and object outlines.
- **Loading.** Draco-compressed geometry and a loading manager that holds the scene until assets are ready.

| File | Role |
|---|---|
| `main.ts` | Scene setup, model loading, game loop |
| `characterControls_v2.1.ts` | Third-person controller and animation blending |
| `interactions_v1.ts` | Raycast collision, picking and video triggers |
| `materials.ts`, `lights.ts`, `postprocess.ts` | Materials, lighting, render passes |
| `Constraints.ts` | Exhibit metadata |

## Run it

```bash
npm install
npm run dev
```

Then open the local URL Vite prints. Use WASD to walk, the mouse to look and click, and follow the on-screen hints to play videos.

The `public/` folder holds several hundred MB of models, textures and video, so the first clone is large.

## Repository layout

| Path | What's there |
|---|---|
| `*.ts`, `index.html`, `style.css` | The app (Vite project at the repo root) |
| `public/` | Assets the app loads at runtime |
| `assets-src/` | Source and spare assets the app does not load: the Blender file for the sister-flute model, an alternative HDR, loading animations, unused texture sets |
| `legacy/` | Earlier versions of the entry point and character controller, kept for reference |

`npm run build` writes the production bundle to `dist/`, which is not tracked.

## Project notes

- Built in August and September 2023 for the BUPT summer social practice. I led the project and wrote the code. Batik works are credited to the Anshun Batik Museum.
- Exhibit descriptions in `Constraints.ts` are placeholders in this snapshot.

## Stack

TypeScript, Three.js, three-mesh-bvh, postprocessing, GSAP, dat.GUI, Vite.
