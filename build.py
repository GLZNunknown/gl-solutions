import base64, io
from PIL import Image
def uri(path, w):
    im = Image.open(path).convert("RGBA")
    im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(b.getvalue()).decode()
html = open("index.src.html", encoding="utf-8").read()
html = html.replace("__LOGO__", uri("assets/gl-logo-horizontal-negativo.png", 640))
html = html.replace("__ICON__", uri("assets/gl-icone-app.png", 160))
open("index.html", "w", encoding="utf-8").write(html)
print(len(html)//1024, "KB")
