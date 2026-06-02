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

      // 3. Inline images ONLY
      if (data.assets) {
        for (let asset of data.assets) {
          if (asset.p && !asset.p.startsWith('data:')) {
            const imgPath = path.join(tempDir, asset.u || '', asset.p);
            if (fs.existsSync(imgPath)) {
              const ext = path.extname(imgPath).replace('.', '') || 'png';
              const base64 = fs.readFileSync(imgPath, 'base64');
              asset.p = `data:image/${ext};base64,${base64}`;
              asset.u = '';
            }
          }
        }
      }

      // NO BACKGROUND REMOVAL! Just save!
      fs.writeFileSync(outJson, JSON.stringify(data));
      console.log(`Restored ${outJson}`);
    }

    // Cleanup
    fs.rmSync(zipFile, { force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });

  } catch (err) {
    console.error(`Error processing ${i}:`, err.message);
  }
}
