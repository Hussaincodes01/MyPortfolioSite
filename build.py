"""Rebuild index.html from src/. Usage: python3 build.py"""
import base64, pathlib
root = pathlib.Path(__file__).parent
src = root / 'src'
js = (src / 'game.js').read_text(encoding='utf-8')
js = js.replace('/*SPRITE*/null', (src / 'sprite.json').read_text(encoding='utf-8'))
js = js.replace('/*PORTRAIT*/', 'data:image/png;base64,' + base64.b64encode((src / 'portrait.png').read_bytes()).decode())
page = (src / 'page.html').read_text(encoding='utf-8').replace('/*GAME_JS*/', js)
head = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
# move everything before <main> into <head>, the rest into <body>
i = page.index('<main>')
out = head + page[:i] + '</head>\n<body>\n' + page[i:] + '\n</body>\n</html>\n'
(root / 'index.html').write_text(out, encoding='utf-8')
print('wrote index.html', len(out), 'bytes')
