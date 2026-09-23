# abba-site — operating instructions

This repo is www.abba-photo.com. Push to `main` = deploy.

## Hosting: Cloudflare Pages (from 2026-09-23; GitHub Pages before that)
Cloudflare Pages project `abba-photo`, connected to this repo on GitHub. Every push to `main`
runs `bash _cf/assemble.sh` and publishes the `_site/` it builds. The published site is this
repo at the root plus each project repo at its own path (`/interlaken-campscapes/`,
`/camp-kingswood/`, `/ramah-rockies-guide/`, `/masliansky-neighborhood-session/`,
`/ceremony-is-medicine/`, `/media-team-field-guide/`, `/cyj-field-guide/`, `/family-2026/`),
exactly the layout GitHub Pages served. The list of project repos lives in `_cf/assemble.sh`;
a new project repo is added there. A push to a project repo alone does not redeploy; push
anything to this repo (or press "Retry deployment" in the Cloudflare dashboard) to pick it up.
`_*` folders are not published (the same rule GitHub's Jekyll applied), `*.md` and
`build_sitemap.py` are not published, and no file over 25 MiB is published (Cloudflare's limit).
`functions/[[path]].js` is a safety net for the move: any path Cloudflare does not have is
fetched from the old GitHub Pages site. Delete it once GitHub Pages is switched off.
`_cf/_routes.json` keeps image folders away from that function; `_cf/_headers` sets two headers.
DNS for the domain: Cloudflare zone abba-photo.com (was NS1 via Squarespace). Google Workspace
MX records for noah@abba-photo.com must always survive a DNS change.

## Hard rules
1. **After ANY edit to HTML in this repo, run `python3 build_sitemap.py` before
   pushing.** It regenerates `sitemap.xml` (image entries with alt-text captions) and
   `robots.txt`. A push without it ships a stale sitemap.
2. Every page carries the GoatCounter tag before `</body>`:
   `<script data-goatcounter="https://abba-photo.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
   New pages get it too. (Account live since 2026-09-01 at abba-photo.goatcounter.com; the dashboard is behind Noah's login.)

3. Images shipped here follow `~/.claude/skills/photo-web-processing/SKILL.md`
   (EXIF strip-then-stack with searchable credits; full-resolution default).
4. Voice rules as everywhere: no em dashes, no bravado, Noah's lines are canon.
5. Outward links use the canonical domain (https://www.abba-photo.com/...), never
   github.io forms.
6. **Never cut off heads (Noah, 2026-09-16).** Any photograph with a person in it that the site crops (the home and services heroes, work-page slideshows, cards) keeps the whole head in frame at phone portrait and desktop wide alike. Set `object-position` per frame, render both widths before pushing, and if a frame cannot hold the head at both, it goes in a grid, not a hero.
7. This is Noah's PUBLIC face and indexable. Client-sensitive material never lands here;
   client hubs stay noindex in their own repos.

## Verify after push
Fetch https://www.abba-photo.com/ and https://www.abba-photo.com/sitemap.xml and check
the change landed (Pages builds take about a minute; CDN may cache a few minutes more).
