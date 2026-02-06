<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1sB0bdbkGzkWMJ2c2xfbnnpxsenQ3UPa9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

4. To make sure the backend can use all templates as PNGs (converts SVGs to PNG and copies existing PNGs):
   - `npm run export:templates` will populate `backend/templates` with PNG versions of the templates (renders SVGs at a large size for quality).
   - If you can't install native Node binaries (e.g., `sharp`), the backend can rasterize SVGs at runtime if `cairosvg` is installed in your Python environment (`pip install cairosvg`).

Notes for Windows users:
- `sharp` may require Visual Studio Build Tools to compile native binaries. If you want to pre-export SVGs to PNG locally, install the "Desktop development with C++" workload and then run `npm install` followed by `npm run export:templates`.
- Alternatively, install `cairosvg` (`pip install cairosvg`) to enable on-the-fly SVG -> PNG rasterization in the backend without needing `sharp`.
