#!/usr/bin/env python3
"""Regenerates sitemap.xml (with image entries) and robots.txt for
www.abba-photo.com. Run after ANY edit to the site's HTML, before pushing:

    python3 build_sitemap.py

The sitemap is what invites Google to index the photographs without waiting to
be crawled. It lists every indexable page in this repo (pages marked noindex
are skipped) and, per page, every image the page shows, with the alt text as
the image caption. Thumb-tier duplicates of a present-tier image are collapsed
to the present URL. Client hub PAGES stay out of this on purpose (they are
noindex by design); their image FILES appear here only because an indexable
page shows them.
"""
import glob
import html
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://www.abba-photo.com"

def pages():
    for p in sorted(glob.glob(os.path.join(HERE, "*.html"))):
        src = open(p).read()
        if re.search(r'name=["\']?robots["\']?[^>]*noindex', src, re.I):
            continue
        yield os.path.basename(p), src

def images(src):
    seen, out = set(), []
    for m in re.finditer(r'<img[^>]*\bsrc="([^"]+)"[^>]*>', src):
        tag, url = m.group(0), m.group(1)
        if url.startswith("/"):
            url = BASE + url
        if not url.startswith(BASE):
            continue  # never list off-domain images
        # collapse thumb tier to the present tier of the same frame
        url = url.replace("/img/thumb/", "/img/present/")
        if url in seen:
            continue
        seen.add(url)
        alt = re.search(r'\balt="([^"]*)"', tag)
        out.append((url, alt.group(1) if alt else ""))
    return out

def build():
    urls = []
    for name, src in pages():
        loc = BASE + "/" + ("" if name == "index.html" else name)
        imgs = images(src)
        block = [f"  <url>\n    <loc>{loc}</loc>"]
        for u, cap in imgs:
            block.append("    <image:image>")
            block.append(f"      <image:loc>{html.escape(u)}</image:loc>")
            if cap:
                block.append(f"      <image:caption>{html.escape(cap)}</image:caption>")
            block.append("    </image:image>")
        block.append("  </url>")
        urls.append("\n".join(block))
        print(f"{name}: {len(imgs)} images")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
           '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
           + "\n".join(urls) + "\n</urlset>\n")
    open(os.path.join(HERE, "sitemap.xml"), "w").write(xml)
    open(os.path.join(HERE, "robots.txt"), "w").write(
        "User-agent: *\nAllow: /\n\nSitemap: " + BASE + "/sitemap.xml\n")
    print("wrote sitemap.xml + robots.txt")

if __name__ == "__main__":
    build()
