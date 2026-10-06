import json, sys
from PIL import Image
PAL = {
 'O': (34, 24, 44),     # outline (dark plum, not black)
 'H': (30, 28, 46), 'h': (52, 52, 84), 'i': (96, 104, 150),   # hair base / mid / sheen
 'S': (214, 150, 108), 's': (178, 112, 78), 'L': (238, 186, 140), 'b': (226, 128, 110),  # skin
 'E': (34, 24, 44), 'W': (255, 255, 255), 'B': (40, 28, 36),   # eyes / brows
 'M': (60, 38, 40), 'm': (150, 98, 72),  # beard dark / stubble
 'w': (150, 70, 70),   # mouth
 'J': (48, 54, 96), 'j': (74, 82, 136), 'k': (32, 36, 66),   # jacket base / light / shade
 'T': (246, 242, 234), 't': (200, 196, 214),  # shirt
 'N': (22, 20, 34), 'n': (70, 64, 100),  # tie
 'G': (246, 196, 72),  # gold pin
 'P': (38, 40, 66), 'p': (28, 28, 48),   # trousers
 'F': (70, 44, 36), 'f': (110, 72, 56),  # shoes
}
W, H = 28, 42
HEAD = [r.ljust(24,'.') for r in [
"..............OO.O......",
"..........O..OHHOHO.....",
".......OOOHOOHHHHHHO....",
".....OOHHHHHHHHhhHHHO...",
"....OHHHHHhhhhhiihHHO...",
"...OHHHHhhhhiiiihhHHHO..",
"..OHHHHhhhhhhhhhhHHHHO..",
"..OHHHHHHHHHHHHHHHHHHHO.",
".OHHHHHHHHHHHHHHHHHHHHO.",
".OHHHHHHHHSHHHHHSHHHHHO.",
".OHHHHHSSSSSSHSSSSSSHHO.",
".OHHHHSSSSSLLSSSSSSSSHO.",
".OHHhSSSBBBSSSSBBBSSSSO.",
".OHhSSSSSWESSSSWESSSSSO.",
".OHSsSSSSEESSSSEESSSSSO.",
".OHSsSSSSEESSSSEESSSSSO.",
".OHssSbbSSSSSsSSSbbSSO..",
"..OssSSSSSSMMMMSSSSSSO..",
"..OmmSSSSSSSwwSSSSSmO...",
"...OmmmSSSSSMMSSSSmmO...",
"....OOmmmmmMMMmmmOO.....",
"......OOOOOOOOOOO.......",
]]
def blank(): return [['.'] * W for _ in range(H)]
def put(g, x, y, c):
    if 0 <= x < W and 0 <= y < H and c != '.': g[y][x] = c
def stamp(g, rows, ox, oy):
    for y, r in enumerate(rows):
        for x, c in enumerate(r): put(g, ox + x, oy + y, c)
TORSO = [
"..OjTnTjO..",
".OJjTNTjJO.",
"OJJJjNjJGJO",
"OJJJJNJJJJO",
"OkJJJNJJJkO",
"OkJJJJJJJkO",
"OOkkkkkkkOO",
]
ARMS = {  # list of (dx,dy,c) from shoulder
 'down':  [(0,0,'j'),(0,1,'J'),(0,2,'J'),(0,3,'k'),(0,4,'S'),(1,0,'J'),(1,1,'J'),(1,2,'k'),(1,3,'k'),(1,4,'S')],
 'fwd':   [(0,0,'j'),(1,0,'J'),(1,1,'J'),(2,1,'J'),(3,1,'k'),(3,2,'k'),(4,1,'S'),(4,2,'S')],
 'fwd2':  [(0,0,'j'),(1,0,'J'),(2,0,'J'),(3,0,'J'),(4,0,'k'),(1,1,'k'),(2,1,'k'),(3,1,'k'),(4,1,'k'),(5,0,'S'),(5,1,'S'),(6,0,'S')],
 'back':  [(0,0,'j'),(-1,1,'J'),(-1,2,'J'),(-2,2,'k'),(-2,3,'k'),(-3,3,'S'),(-3,4,'S')],
 'swingf':[(0,0,'j'),(1,0,'J'),(1,1,'J'),(1,2,'J'),(2,2,'k'),(2,3,'S'),(3,3,'S')],
 'swingb':[(0,0,'j'),(0,1,'J'),(-1,1,'J'),(-1,2,'k'),(-2,3,'k'),(-2,4,'S'),(-3,4,'S')],
 'up':    [(0,0,'j'),(1,-1,'J'),(1,-2,'J'),(2,-2,'J'),(2,-3,'k'),(2,-4,'S'),(3,-4,'S'),(3,-5,'S')],
 'upb':   [(0,0,'j'),(-1,-1,'J'),(-1,-2,'k'),(-2,-3,'S'),(-2,-4,'S')],
}
LEGS = {  # from hip
 'stand': [(0,0,'P'),(1,0,'P'),(0,1,'P'),(1,1,'P'),(0,2,'P'),(1,2,'p'),(0,3,'P'),(1,3,'p'),(0,4,'F'),(1,4,'F'),(2,4,'F'),(0,5,'F'),(1,5,'f'),(2,5,'F')],
 'fwd':   [(0,0,'P'),(1,0,'P'),(1,1,'P'),(2,1,'P'),(2,2,'P'),(3,2,'p'),(3,3,'P'),(3,4,'F'),(4,4,'F'),(5,4,'F'),(3,5,'F'),(4,5,'f'),(5,5,'F')],
 'mid':   [(0,0,'P'),(1,0,'P'),(1,1,'P'),(2,1,'P'),(1,2,'P'),(2,2,'p'),(1,3,'F'),(2,3,'F'),(3,3,'F'),(1,4,'F'),(2,4,'f'),(3,4,'F')],
 'back':  [(0,0,'P'),(1,0,'P'),(0,1,'P'),(-1,1,'P'),(-1,2,'P'),(-2,2,'p'),(-2,3,'P'),(-3,3,'F'),(-2,4,'F'),(-4,4,'F'),(-3,4,'F'),(-4,3,'F')],
 'lift':  [(0,0,'P'),(1,0,'P'),(1,1,'P'),(2,1,'P'),(2,2,'P'),(1,2,'p'),(1,3,'F'),(2,3,'F'),(3,3,'F')],
 'liftb': [(0,0,'P'),(1,0,'P'),(-1,1,'P'),(0,1,'P'),(-2,1,'P'),(-3,2,'F'),(-2,2,'F'),(-4,2,'F'),(-3,1,'F')],
 'tuck':  [(0,0,'P'),(1,0,'P'),(1,1,'P'),(2,1,'P'),(3,1,'P'),(3,2,'F'),(4,2,'F'),(4,1,'F'),(5,2,'F')],
 'dangle':[(0,0,'P'),(1,0,'P'),(0,1,'P'),(1,1,'p'),(0,2,'P'),(-1,3,'F'),(0,3,'F'),(1,3,'F'),(-1,4,'F'),(0,4,'f')],
}
DARKER = {'P': 'p', 'J': 'k', 'j': 'J', 'F': 'F', 'f': 'F', 'S': 's', 'k': 'k', 'p': 'p'}
def limb(g, base, spec, back=False):
    bx, by = base
    for dx, dy, c in spec: put(g, bx + dx, by + dy, DARKER.get(c, c) if back else c)
def frame(hy=0, by=0, armF='down', armB='down', legF='stand', legB='stand', lean=0, head=None):
    g = blank()
    hx = 2 + lean; hyy = 1 + hy
    oy = 22 + by          # torso top
    limb(g, (12 + lean, oy + 7), LEGS[legB], back=True)
    limb(g, (9 + lean, oy + 2), ARMS[armB], back=True)
    limb(g, (11 + lean, oy + 6), [(x, 0, 'P') for x in range(-2, 5)])  # hips
    stamp(g, TORSO, 8 + lean, oy)
    stamp(g, head or HEAD, hx, hyy)
    limb(g, (14 + lean, oy + 7), LEGS[legF])
    limb(g, (16 + lean, oy + 2), ARMS[armF])
    return outline(g)
def outline(g):
    o = [r[:] for r in g]
    for y in range(H):
        for x in range(W):
            if g[y][x] == '.':
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    xx, yy = x + dx, y + dy
                    if 0 <= xx < W and 0 <= yy < H and g[yy][xx] not in '.O':
                        o[y][x] = 'O'; break
    return [''.join(r) for r in o]
BLINK = [r if i not in (13, 14, 15) else (r.replace('W', 'E').replace('E', 'S') if i != 14 else r.replace('W','E')) for i, r in enumerate(HEAD)]
F = {
 'idle0': frame(),
 'idle1': frame(hy=1, by=1),
 'blink': frame(head=BLINK),
 'run0': frame(armF='swingb', armB='swingf', legF='fwd', legB='back', lean=1),
 'run1': frame(hy=-1, by=-1, armF='down', armB='down', legF='mid', legB='liftb', lean=1),
 'run2': frame(hy=-1, by=-1, armF='swingf', armB='swingb', legF='lift', legB='stand', lean=1),
 'run3': frame(armF='swingf', armB='swingb', legF='back', legB='fwd', lean=1),
 'run4': frame(hy=-1, by=-1, armF='down', armB='down', legF='liftb', legB='mid', lean=1),
 'run5': frame(hy=-1, by=-1, armF='swingb', armB='swingf', legF='stand', legB='lift', lean=1),
 'jump': frame(armF='up', armB='upb', legF='tuck', legB='dangle'),
 'fall': frame(armF='fwd', armB='back', legF='dangle', legB='stand'),
 'dash': frame(hy=1, by=1, armF='back', armB='back', legF='back', legB='liftb', lean=2),
 'atk0': frame(armF='up', armB='back', legF='fwd', legB='back'),
 'atk1': frame(armF='fwd2', armB='back', legF='fwd', legB='back', lean=1),
 'wave0': frame(armF='up', armB='down'),
 'wave1': frame(armF='fwd', armB='down'),
}
json.dump({'w': W, 'h': H, 'pal': {k: '#%02x%02x%02x' % v for k, v in PAL.items()}, 'frames': F}, open('sprite.json', 'w'))
names = list(F); sc = 6
img = Image.new('RGB', (len(names) * W * sc, H * sc), (150, 170, 60))
for i, n in enumerate(names):
    for y, r in enumerate(F[n]):
        for x, c in enumerate(r):
            if c != '.':
                for a in range(sc):
                    for b in range(sc): img.putpixel((i * W * sc + x * sc + a, y * sc + b), PAL[c])
img.save('sprite_sheet_preview.png')
img.crop((0, 0, W * sc * 6, H * sc)).save('sprite_sheet_preview_a.png')
img.crop((W * sc * 6, 0, W * sc * 12, H * sc)).save('sprite_sheet_preview_b.png')
