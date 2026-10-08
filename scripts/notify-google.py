#!/usr/bin/env python3
"""Soumettre les URLs du sitemap mayoraz-net.ch à l'API Indexing de Google.

Prérequis : PAS-A-PAS.md étapes 1 à 5 (service account + propriétaire GSC).
Usage: python3 soumettre-google.py ~/.secrets/indexing-sa.json [--sitemap https://mayoraz-net.ch/sitemap-0.xml]
En CI : python3 soumettre-google.py --sa-b64-env GCLOUD_INDEXING_SA (JSON en base64, une ligne).
Stdlib uniquement : JWT signé à la main (RS256 via openssl en subprocess), pas de dépendance.

Note : l'API est officiellement pour JobPosting/BroadcastEvent ; usage toléré
pour d'autres pages, rester raisonnable (pages réellement nouvelles/modifiées).
"""
import argparse, base64, json, os, re, subprocess, sys, tempfile, time, urllib.request, urllib.error

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def fetch_sitemap(source: str) -> list:
    """Lit le sitemap d'un fichier local (ex: dist/sitemap-0.xml généré par le build
    CI) ou d'une URL (curl + UA navigateur, anti-bot CF leçon du 08/10 : urllib nu => 403)."""
    if os.path.isfile(source):
        out = open(source, encoding="utf-8").read()
    else:
        out = subprocess.run(
            ["curl", "-s", "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
             "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36", source],
            capture_output=True, text=True, timeout=30).stdout
    urls = re.findall(r"<loc>([^<]+)</loc>", out)
    if not urls:
        sys.exit(f"sitemap vide ou illisible: {source}")
    return urls

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sa_json", nargs="?", help="chemin du JSON du service account (hors repo)")
    ap.add_argument("--sa-b64-env", help="nom de la variable d'env contenant le JSON du SA en base64 (mode CI)")
    ap.add_argument("--sitemap", default="dist/sitemap-0.xml",
                    help="fichier local (généré par le build CI) ou URL")
    ap.add_argument("--type", default="URL_UPDATED", choices=["URL_UPDATED", "URL_DELETED"])
    args = ap.parse_args()

    if args.sa_b64_env:
        import base64
        raw = os.environ.get(args.sa_b64_env, "").strip()
        if not raw:
            sys.exit(f"variable d'env {args.sa_b64_env} absente ou vide")
        sa = json.loads(base64.b64decode(raw))
        fd, args.sa_json = tempfile.mkstemp(suffix=".json")
        with os.fdopen(fd, "w") as f:
            f.write(json.dumps(sa))
        os.chmod(args.sa_json, 0o600)
    elif not args.sa_json:
        sys.exit("fournir sa_json ou --sa-b64-env")
    else:
        sa = json.load(open(args.sa_json, encoding="utf-8"))
    # openssl -sign exige un fichier PEM : extraire private_key du JSON dans un fichier temporaire 600
    fd, pem_path = tempfile.mkstemp(suffix=".pem")  # noqa: F811 (fd réutilisé volontairement)
    with os.fdopen(fd, "w") as f:
        f.write(sa["private_key"])
    os.chmod(pem_path, 0o600)
    now = int(time.time())
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({
        "iss": sa["client_email"],
        "scope": "https://www.googleapis.com/auth/indexing",
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
        os.unlink(pem_path)  # la clé privée extraite ne traîne jamais sur disque
    jwt = f"{header}.{claims}.{b64url(sig)}"

    tok_req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=urllib.parse.urlencode({
            "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
            "assertion": jwt,
        }).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urllib.request.urlopen(tok_req, timeout=30) as r:
        token = json.loads(r.read())["access_token"]
    print("token OK")

    urls = fetch_sitemap(args.sitemap)
    print(f"{len(urls)} URLs à soumettre en {args.type}")
    ok = fail = 0
    for u in urls:
        req = urllib.request.Request(
            "https://indexing.googleapis.com/v3/urlNotifications:publish",
            data=json.dumps({"url": u, "type": args.type}).encode(),
            headers={"Content-Type": "application/json",
                     "Authorization": f"Bearer {token}"})
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                resp = json.loads(r.read())
                print(f"  200 {u}  (notify: {resp.get('urlNotificationMetadata', {}).get('latestUpdate', {}).get('notifyTime', '?')})")
                ok += 1
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as e:
            # HTTPError = refus Google (quota/URL invalide) ; URLError/Timeout = réseau
            # éphémère du runner : le job est continue-on-error, on logue et on continue.
            body = getattr(e, "read", lambda: b"")()[:120]
            print(f"  ECHEC {u}  {type(e).__name__}: {getattr(e, 'code', '')} {body}")
            fail += 1
        time.sleep(0.5)
    print(f"Résumé: {ok} OK, {fail} échec(s)")

if __name__ == "__main__":
    main()
