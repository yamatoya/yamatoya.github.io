#!/usr/bin/env python3
# coding: utf-8
"""Render deterministic public document covers. No fonts are redistributed.
Set SHARE_FONT to a Japanese TrueType/OpenType font on non-macOS hosts.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, os, sys, unicodedata
payload=json.loads(Path(sys.argv[1]).read_text())
choices=[Path(os.environ['SHARE_FONT'])] if os.environ.get('SHARE_FONT') else []
choices += [p for p in Path('/System/Library/Fonts').glob('*.ttc') if unicodedata.normalize('NFC',p.name)=='ヒラギノ角ゴシック W5.ttc']
choices += [Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')]
font_path=next((p for p in choices if p.is_file()),None)
if not font_path: raise SystemExit('Japanese font not found; set SHARE_FONT to a Japanese font file.')
fonts={size:ImageFont.truetype(str(font_path),size) for size in [18,22,25,28,46,51]}
def wrap(value,font,width):
    lines=[];line=''
    for char in value:
        if char=='\n':lines.append(line);line='';continue
        if line and font.getlength(line+char)>width:lines.append(line);line=char
        else:line+=char
    if line:lines.append(line)
    return lines
for record in payload:
    image=Image.new('RGB',(1200,630),'#f4f7f7');draw=ImageDraw.Draw(image)
    draw.rectangle((0,0,1200,9),fill='#25596d')
    draw.text((74,48),'法令・ガイドライン ビューア',font=fonts[22],fill='#25596d')
    draw.text((74,127),record['category'],font=fonts[22],fill='#647982')
    title=wrap(record['title'],fonts[46],1040)
    for n,line in enumerate(title[:4]):
        if n==3 and len(title)>4:line=line[:-1]+'…'
        draw.text((70,183+n*65),line,font=fonts[46],fill='#24333f')
    draw.line((74,510,1126,510),fill='#cdd9dc',width=1)
    draw.text((74,538),'原文を調べる・比べる・根拠を残す',font=fonts[25],fill='#526873')
    draw.text((908,579),'yamatoya.github.io',font=fonts[18],fill='#647982')
    target=Path(record['file']);target.parent.mkdir(parents=True,exist_ok=True)
    image.save(target,optimize=True)
print(json.dumps({'covers':len(payload),'size':'1200x630'}))
