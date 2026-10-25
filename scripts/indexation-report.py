#!/usr/bin/env python3
"""Relevé d'indexation : Google Search Console + Bing Webmaster Tools.

Écrit un tableau Markdown sur la sortie standard et, en CI, dans le résumé du
run GitHub ($GITHUB_STEP_SUMMARY). Aucune dépendance externe : JWT RS256 signé
avec openssl, appels HTTP en urllib.

Variables d'environnement :
  GCLOUD_INDEXING_SA       JSON du service account en base64 (obligatoire pour Google)
  BING_WEBMASTER_API_KEY   clé API Bing Webmaster Tools (facultatif)
  SITEMAP_URL              défaut : https://mayoraz-net.ch/sitemap-0.xml
  GSC_SITE                 défaut : sc-domain:mayoraz-net.ch
  BING_SITE_URL            défaut : https://mayoraz-net.ch

Usage local :
  python3 scripts/indexation-report.py ~/.secrets/indexing-sa.json [--bing-key XXX]
"""

import argparse
import base64
import datetime
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_SITEMAP = "https://mayoraz-net.ch/sitemap-0.xml"
DEFAULT_GSC_SITE = "sc-domain:mayoraz-net.ch"
DEFAULT_BING_SITE = "https://mayoraz-net.ch"
# Domaine dont on veut savoir s'il est comptabilisé parmi les liens entrants.
WATCHED_BACKLINK = "garage-darbellay"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126 Safari/537.36")


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def fetch_sitemap(url: str) -> list:
    out = subprocess.run(
        ["curl", "-s", "-A", UA, url],
        capture_output=True, text=True, timeout=30).stdout
    urls = re.findall(r"<loc>([^<]+)</loc>", out)
    if not urls:
        sys.exit(f"sitemap vide ou illisible: {url}")
    return urls


def gsc_token(client_email: str, private_key: str) -> str:
    fd, pem_path = tempfile.mkstemp(suffix=".pem")
    with os.fdopen(fd, "w") as f:
        f.write(private_key)
    os.chmod(pem_path, 0o600)
    now = int(time.time())
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({
        "iss": client_email,
        "scope": "https://www.googleapis.com/auth/webmasters.readonly",
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now, "exp": now + 3600,
    }).encode())
    unsigned = f"{header}.{claims}".encode()
    try:
        sig = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", pem_path],
            input=unsigned, capture_output=True, timeout=15).stdout
        assert sig, "signature openssl échouée"
    finally:
        os.unlink(pem_path)
    jwt = f"{header}.{claims}.{b64url(sig)}"
    req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt,
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["access_token"]


def gsc_inspect(token: str, site: str, url: str) -> dict:
    req = urllib.request.Request(
        "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
        data=json.dumps({"inspectionUrl": url, "siteUrl": site}).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {token}"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            idx = json.loads(r.read()).get("inspectionResult", {}).get("indexStatusResult", {})
            return {
                "verdict": idx.get("verdict", "?"),
                "state": idx.get("indexingState", ""),
                "crawl": (idx.get("lastCrawlTime") or "")[:10] or "—",
            }
    except urllib.error.HTTPError as e:
        return {"verdict": f"HTTP{e.code}", "state": "", "crawl": "—"}
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return {"verdict": f"ERR:{type(e).__name__}", "state": "", "crawl": "—"}


def bing_info(key: str, site: str, url: str) -> dict:
    """GetUrlInfo de l'API Bing Webmaster : renvoie l'état d'un URL dans l'index."""
    query = urllib.parse.urlencode({"apikey": key, "siteUrl": site, "url": url})
    req = urllib.request.Request(
        f"https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo?{query}",
        headers={"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read()).get("d") or {}
            if not data:
                return {"state": "absent", "crawl": "—"}
            return {
                "state": "indexée",
                "crawl": (data.get("LastCrawledDate") or "")[:10] or "—",
            }
    except urllib.error.HTTPError as e:
        return {"state": f"HTTP{e.code}", "crawl": "—"}
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return {"state": f"ERR:{type(e).__name__}", "crawl": "—"}


def bing_links(key: str, site: str, max_pages: int = 5) -> dict:
    """Liens entrants connus de Bing (GetLinkCounts puis GetUrlLinks)."""

    def call(ep: str, **params):
        query = urllib.parse.urlencode({"apikey": key, **params})
        req = urllib.request.Request(
            f"https://ssl.bing.com/webmaster/api.svc/json/{ep}?{query}",
            headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read()).get("d")

    out = {"pages": 0, "links": 0, "sources": [], "error": ""}
    try:
        data = call("GetLinkCounts", siteUrl=site, page="1") or {}
        items = list(data.get("Links") or [])
        for p in range(2, min(int(data.get("TotalPages") or 0), max_pages) + 1):
            more = call("GetLinkCounts", siteUrl=site, page=str(p)) or {}
            items += list(more.get("Links") or [])
        out["pages"] = len(items)
        out["links"] = sum(int(i.get("Count") or 1) for i in items)

        # Détail des sources : une requête par page cible, tolérante à l'échec.
        for item in items[:max_pages]:
            url = item.get("Url")
            if not url:
                continue
            try:
                for link in call("GetUrlLinks", siteUrl=site, url=url, page="1") or []:
                    ref = link.get("Url") or link.get("ReferrerUrl") or ""
                    if ref:
                        out["sources"].append(ref)
            except urllib.error.HTTPError as e:
                out["error"] = f"sources HTTP{e.code}"
            except (urllib.error.URLError, TimeoutError, OSError):
                out["error"] = "sources inaccessibles"
    except urllib.error.HTTPError as e:
        out["error"] = f"HTTP{e.code}"
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        out["error"] = f"ERR:{type(e).__name__}"
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("sa_json", nargs="?", help="JSON du service account (hors CI)")
    ap.add_argument("--sa-b64-env", default="GCLOUD_INDEXING_SA")
    ap.add_argument("--bing-key", default=os.environ.get("BING_WEBMASTER_API_KEY", ""))
    ap.add_argument("--sitemap", default=os.environ.get("SITEMAP_URL", DEFAULT_SITEMAP))
    ap.add_argument("--gsc-site", default=os.environ.get("GSC_SITE", DEFAULT_GSC_SITE))
    ap.add_argument("--bing-site", default=os.environ.get("BING_SITE_URL", DEFAULT_BING_SITE))
    args = ap.parse_args()

    # Service account : fichier local ou variable d'environnement en base64.
    sa = None
    if args.sa_json:
        sa = json.load(open(args.sa_json, encoding="utf-8"))
    else:
        raw = os.environ.get(args.sa_b64_env, "").strip()
        if raw:
            sa = json.loads(base64.b64decode(raw))

    urls = fetch_sitemap(args.sitemap)
    print(f"{len(urls)} URLs dans le sitemap", file=sys.stderr)

    token = None
    if sa:
        token = gsc_token(sa["client_email"], sa["private_key"])
    else:
        print(f"Google : variable {args.sa_b64_env} absente, relevé Google ignoré", file=sys.stderr)

    rows = []
    for url in urls:
        g = gsc_inspect(token, args.gsc_site, url) if token else {"verdict": "n/a", "state": "", "crawl": "—"}
        b = bing_info(args.bing_key, args.bing_site, url) if args.bing_key else None
        rows.append((url, g, b))
        time.sleep(0.3)

    def label(verdict: str) -> str:
        return {"PASS": "✅ indexée", "NEUTRAL": "⏳ pas encore"}.get(verdict, f"⚠️ {verdict}")

    indexed = sum(1 for _, g, _ in rows if g["verdict"] == "PASS")
    lines = []
    lines.append(f"## Indexation — {datetime.date.today().isoformat()}")
    lines.append("")
    lines.append(f"**Google : {indexed}/{len(rows)} pages indexées.**")
    if args.bing_key:
        bing_ok = sum(1 for _, _, b in rows if b and b["state"] == "indexée")
        lines.append(f"**Bing : {bing_ok}/{len(rows)} pages indexées.**")
    else:
        lines.append("**Bing : relevé non configuré** (clé API Bing Webmaster absente).")
    lines.append("")
    header = "| Page | Google | Dernier crawl |"
    sep = "|---|---|---|"
    if args.bing_key:
        header = "| Page | Google | Dernier crawl | Bing |"
        sep = "|---|---|---|---|"
    lines += [header, sep]
    for url, g, b in rows:
        path = urllib.parse.urlparse(url).path or "/"
        line = f"| `{path}` | {label(g['verdict'])} | {g['crawl']} |"
        if args.bing_key:
            line += f" {('✅ indexée' if b['state'] == 'indexée' else '⏳ ' + b['state'])} |"
        lines.append(line)
    if args.bing_key:
        bl = bing_links(args.bing_key, args.bing_site)
        tracked = any(WATCHED_BACKLINK in s for s in bl["sources"])
        lines += ["", "### Liens entrants (Bing)", ""]
        if bl["error"] and bl["pages"] == 0:
            lines.append(f"**Relevé indisponible : {bl['error']}.**")
        elif bl["pages"] == 0:
            lines.append("**Aucun lien entrant connu de Bing à ce jour.**")
        else:
            lines.append(f"**{bl['links']} lien(s) entrant(s) sur "
                         f"{bl['pages']} page(s).**")
            for src in sorted(set(bl["sources"]))[:10]:
                lines.append(f"- {src}")
            if bl["error"]:
                lines.append(f"_{bl['error']}_")
        lines += ["", f"Lien {WATCHED_BACKLINK} : "
                  f"{'✅ comptabilisé' if tracked else '⏳ pas encore comptabilisé'}"]

    lines.append("")
    lines.append("_Relevé automatique hebdomadaire. Google : API URL Inspection ; "
                 "Bing : API Webmaster (indexation et liens entrants). "
                 "Le rapport Liens de Search Console n'a pas d'API : il reste à "
                 "consulter à la main._")

    report = "\n".join(lines)
    print(report)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write(report + "\n")

    # Google en échec total = relevé inutilisable, on le signale.
    if token and indexed == 0 and all(g["verdict"].startswith(("ERR", "HTTP")) for _, g, _ in rows):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
