#!/usr/bin/env python3
"""Re-soumettre le sitemap à la Search Console (canal de découverte passif).

Chaque déploiement rafraîchit la date de soumission dans GSC : Google re-télécharge
alors plus tôt le sitemap (sans attendre son cycle mensuel, cf. lastDownloaded figé
au 29/06 avant la re-soumission manuelle du 09/10). En complément — pas en
remplacement — des notifications actives URL_UPDATED de notify-google.py.

Stdlib uniquement ; même moteur JWT que notify-google.py (RS256 via openssl),
scope différent : https://www.googleapis.com/auth/webmasters .
PUT https://www.googleapis.com/webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}
(feedpath dans le CHEMIN, URL-encodé — en query string l'API renvoie 404,
leçon du 09/10). 204 = succès ; 400/401/403 = propriété/scope/accès.

Usage local : python3 gsc_sitemaps.py ~/.secrets/indexing-sa.json
Usage CI    : python3 gsc_sitemaps.py --sa-b64-env GCLOUD_INDEXING_SA
"""
import argparse, base64, json, os, subprocess, sys, tempfile, time, urllib.request, urllib.error
import urllib.parse

def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def make_token(sa: dict, scope: str) -> str:
    fd, pem_path = tempfile.mkstemp(suffix=".pem")  # openssl -sign exige un PEM sur disque
    with os.fdopen(fd, "w") as f:
        f.write(sa["private_key"])
    os.chmod(pem_path, 0o600)
    now = int(time.time())
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({
        "iss": sa["client_email"],
        "scope": scope,
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
        return json.loads(r.read())["access_token"]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("sa_json", nargs="?", help="chemin du JSON du service account (hors repo)")
    ap.add_argument("--sa-b64-env", help="nom de la variable d'env contenant le JSON du SA en base64 (mode CI)")
    ap.add_argument("--site", default="sc-domain:mayoraz-net.ch")
    ap.add_argument("--feedpath", default="https://mayoraz-net.ch/sitemap-index.xml")
    args = ap.parse_args()

    if args.sa_b64_env:
        raw = os.environ.get(args.sa_b64_env, "").strip()
        if not raw:
            sys.exit(f"variable d'env {args.sa_b64_env} absente ou vide")
        sa = json.loads(base64.b64decode(raw))
    elif args.sa_json:
        sa = json.load(open(args.sa_json, encoding="utf-8"))
    else:
        sys.exit("fournir sa_json ou --sa-b64-env")

    token = make_token(sa, "https://www.googleapis.com/auth/webmasters")
    print("token OK")

    url = ("https://www.googleapis.com/webmasters/v3/sites/"
           + urllib.parse.quote(args.site, safe="") + "/sitemaps/"
           + urllib.parse.quote(args.feedpath, safe=""))
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, data=b"", headers={
                "Authorization": f"Bearer {token}"}, method="PUT")
            with urllib.request.urlopen(req, timeout=30) as r:
                code = r.status
            break
        except urllib.error.HTTPError as e:
            sys.exit(f"ECHEC PUT {e.code}: {e.read()[:200]}")  # refus Google : pas d'espoir de retry
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if attempt == 3:
                sys.exit(f"ECHEC réseau: {type(e).__name__}: {e}")
            time.sleep(2 * (attempt + 1))  # DNS du runner parfois muet (leçon du 09/10)
    print(f"sitemap re-soumis à GSC ({code}) : {args.feedpath}")

if __name__ == "__main__":
    main()
