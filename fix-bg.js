const fs = require('fs');

for (let i = 1; i <= 10; i++) {
  try {
    let f = 'anim' + i + '.json';
    if (!fs.existsSync(f)) continue;
    
    let d = JSON.parse(fs.readFileSync(f));
    let startLen = d.layers.length;
    
    // Aggressive filter
    d.layers = d.layers.filter(l => {
      if (!l.nm) return true;
      let n = l.nm.toLowerCase();
      // Catch "Frame 20 Bg", "Background", "White Solid"
      if (n.includes('background') || /\bbg\b/.test(n) || n.includes('white solid')) {
        return false;
      }
      return true;
    });
    
    // If there's a stubborn white box at the bottom (usually shape layer)
    if (d.layers.length > 0) {
      let bottom = d.layers[d.layers.length - 1];
      if (bottom.ty === 4 && bottom.nm && bottom.nm.toLowerCase().includes('shape layer') && bottom.shapes) {
        let str = JSON.stringify(bottom.shapes);
        if (str.includes('"ty":"rc"') && str.includes(d.w.toString()) && str.includes(d.h.toString())) {
          d.layers.pop();
        }
      }
    }
    
    if (d.layers.length < startLen) {
      fs.writeFileSync(f, JSON.stringify(d));
      console.log('Fixed background in ' + f);
    }
  } catch (e) {
    console.error(e);
  }
}
