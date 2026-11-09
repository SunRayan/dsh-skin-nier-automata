import sys, json
from PIL import Image

def dominant(path, k=8):
    im = Image.open(path).convert("RGB")
    im.thumbnail((240, 240))
    q = im.quantize(colors=k, method=Image.MEDIANCUT)
    pal = q.getpalette()
    counts = sorted(q.getcolors(), reverse=True)
    total = sum(c for c, _ in counts)
    out = []
    for cnt, idx in counts:
        r, g, b = pal[idx*3:idx*3+3]
        out.append({"hex": "#%02x%02x%02x" % (r, g, b), "share": round(cnt/total*100, 1),
                    "rgb": [r, g, b]})
    return out

for p in sys.argv[1:]:
    print("==", p)
    for c in dominant(p):
        print("  %s  %5.1f%%" % (c["hex"], c["share"]))
