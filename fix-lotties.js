const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

for (let i = 1; i <= 10; i++) {
  const lottieFile = `anim${i}.lottie`;
  const zipFile = `anim${i}.zip`;
  const tempDir = `temp_anim${i}`;
  const outJson = `anim${i}.json`;

  if (!fs.existsSync(lottieFile)) continue;

  try {
    // 1. Extract
    fs.copyFileSync(lottieFile, zipFile);
    execSync(`powershell -Command "Expand-Archive -Path '${zipFile}' -DestinationPath '${tempDir}' -Force"`);

    // 2. Find JSON
    let jsonPath = null;
    const findJson = (dir) => {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isDirectory()) {
          findJson(fp);
        } else if (f.endsWith('.json') && !f.includes('manifest')) {
          jsonPath = fp;
        }
      }
    };
    findJson(tempDir);

    if (jsonPath) {
      let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // 3. Inline images
      if (data.assets) {
        for (let asset of data.assets) {
          if (asset.p && !asset.p.startsWith('data:')) {
            // It's an image
            const imgPath = path.join(tempDir, asset.u || '', asset.p);
            if (fs.existsSync(imgPath)) {
              const ext = path.extname(imgPath).replace('.', '') || 'png';
              const base64 = fs.readFileSync(imgPath, 'base64');
              asset.p = `data:image/${ext};base64,${base64}`;
              asset.u = ''; // Clear path
            }
          }
        }
      }

      // 4. Remove background layers
      if (data.layers) {
        data.layers = data.layers.filter(layer => {
          if (layer.ty === 1) return false; // Solid layer
          if (layer.nm) {
            const name = layer.nm.toLowerCase();
            if (name.includes('background') || name === 'bg' || name.includes('solid')) {
              return false; // Named background
            }
          }
          return true;
        });

        // Heuristic: remove bottom-most layer if it's just a comp-sized rectangle
        const bottomLayer = data.layers[data.layers.length - 1];
        if (bottomLayer && bottomLayer.ty === 4) {
           const str = JSON.stringify(bottomLayer.shapes || []);
           if (str.includes('"ty":"rc"') && str.includes('"ty":"fl"')) {
               if (str.includes(data.w.toString()) && str.includes(data.h.toString())) {
                   data.layers.pop(); // Remove background
               } else if (bottomLayer.nm && bottomLayer.nm.toLowerCase().includes('shape layer') && str.length < 500) {
                   data.layers.pop(); // Remove basic shape layer at bottom
               }
           }
        }
      }

      // 5. Save
      fs.writeFileSync(outJson, JSON.stringify(data));
      console.log(`Processed ${outJson}`);
    }

    // Cleanup
    fs.rmSync(zipFile, { force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });

  } catch (err) {
    console.error(`Error processing ${i}:`, err.message);
  }
}
