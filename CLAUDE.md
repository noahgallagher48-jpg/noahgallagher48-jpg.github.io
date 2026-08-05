# abba-site — operating instructions

This repo is www.abba-photo.com (GitHub Pages user site `noahgallagher48-jpg.github.io`,
custom domain via CNAME). Push to `main` = deploy. Because the domain sits on the user
site, every other project repo serves under it (/interlaken-campscapes/, /camp-kingswood/,
/masliansky-neighborhood-session/, /ceremony-is-medicine/, ...).

## Hard rules
1. **After ANY edit to HTML in this repo, run `python3 build_sitemap.py` before
   pushing.** It regenerates `sitemap.xml` (image entries with alt-text captions) and
   `robots.txt`. A push without it ships a stale sitemap.
2. Every page carries the GoatCounter tag before `</body>`:
   `<script data-goatcounter="https://abbaphoto.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
   New pages get it too. (The account `abbaphoto` is Noah's signup; until it exists the
   tag fails silently.)
3. Images shipped here follow `~/.claude/skills/photo-web-processing/SKILL.md`
   (EXIF strip-then-stack with searchable credits; full-resolution default).
4. Voice rules as everywhere: no em dashes, no bravado, Noah's lines are canon.
5. Outward links use the canonical domain (https://www.abba-photo.com/...), never
   github.io forms.
6. This is Noah's PUBLIC face and indexable. Client-sensitive material never lands here;
   client hubs stay noindex in their own repos.

## Verify after push
Fetch https://www.abba-photo.com/ and https://www.abba-photo.com/sitemap.xml and check
the change landed (Pages builds take about a minute; CDN may cache a few minutes more).
