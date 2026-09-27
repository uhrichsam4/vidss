# python3 tools/board.py out/x.jpg 1 2.2 3.5 ...  -> a contact board of out/still-<beat>.png (4 per row, 360 px tiles)
import sys
from PIL import Image, ImageDraw, ImageFont
out, beats = sys.argv[1], sys.argv[2:]
n = len(beats); cols = min(4, n); rows = (n + cols - 1) // cols; T = 360
im = Image.new('RGB', (cols * T, rows * T)); d = ImageDraw.Draw(im)
f = ImageFont.truetype('assets/fonts/GeistMono-Medium.ttf', 18)
for k, b in enumerate(beats):
    im.paste(Image.open(f'out/still-{b}.png').convert('RGB').resize((T, T)), ((k % cols) * T, (k // cols) * T))
    d.text(((k % cols) * T + 8, (k // cols) * T + 6), f'b{b}', font=f, fill=(255, 106, 43))
im.save(out, quality=88)
