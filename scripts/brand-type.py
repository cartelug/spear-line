"""Convert the supplied brand fonts into portable SVG outlines for the share card.

Run after changing its text or fonts. Requires fonttools and brotli.
The website itself still uses its original WOFF2 web fonts.
"""
import json
import subprocess
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

root = Path(__file__).resolve().parent.parent

def outline(filename, text, size, tracking=0):
    font = TTFont(root / 'public/assets/fonts' / filename)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    x = 0
    parts = []
    for char in text:
        name = cmap[ord(char)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        path = pen.getCommands()
        if path:
            parts.append(f'<path transform="translate({x:.4f} 0) scale({scale:.7f} {-scale:.7f})" d="{path}"/>')
        x += font['hmtx'][name][0] * scale + tracking
    return {'text': text, 'width': x - tracking, 'paths': ''.join(parts)}

data = {
    'company': outline('sky-text-regular.woff2', 'SPEAR LINE GLOBAL LIMITED', 16, 5),
    'tagline': outline('mtn-brighter-sans-bold.woff2', subprocess.check_output(['node', '--input-type=module', '-e', "import {brand} from './content/site.mjs';process.stdout.write(brand.tagline)"], cwd=root, text=True), 43, -0.6),
    'services': outline('sky-text-regular.woff2', 'VEHICLES   /   SUPPLY   /   LOGISTICS', 18, 3)
}
(root / 'brand/share-type.json').write_text(json.dumps(data, separators=(',', ':')) + '\n')
print('Outlined the supplied Brighter Sans and Sky fonts for the share artwork.')
