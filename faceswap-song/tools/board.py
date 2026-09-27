# python3 tools/board.py out/x.jpg 1 2.5 ...  -> contact board of out/s-<t>.png (4 per row)
import sys
from PIL import Image, ImageDraw, ImageFont
out, ts = sys.argv[1], sys.argv[2:]
cols = min(4, len(ts)); rows = (len(ts) + cols - 1) // cols; TW, TH = 480, 270
im = Image.new('RGB', (cols * TW, rows * TH)); d = ImageDraw.Draw(im); f = ImageFont.truetype('assets/fonts/GeistMono-Medium.ttf', 16)
for k, t in enumerate(ts):
    x, y = (k % cols) * TW, (k // cols) * TH; im.paste(Image.open(f'out/s-{t}.png').convert('RGB').resize((TW, TH)), (x, y)); d.text((x + 6, y + 4), f'{t}s', font=f, fill=(255, 90, 31))
im.save(out, quality=88)
