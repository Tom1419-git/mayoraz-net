#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""n8n Watchdog : surveillance du webhook du formulaire de contact.

Deployment : /opt/n8n-watchdog/n8n_watchdog.py (root), crontab root :
  4-59/15 * * * * /usr/bin/python3 /opt/n8n-watchdog/n8n_watchdog.py >> /opt/n8n-watchdog/watchdog.log 2>&1
Rotation du log : /etc/logrotate.d/n8n-watchdog (weekly, copytruncate).

Controles a chaque passage :
 1. Sonde HTTP silencieuse : POST multipart sur
    https://n8n.mayoraz-net.ch/webhook/contact-form avec le honeypot
    website renseigne. Reponse attendue 429 (node Respond 429, branche
    silencieuse, aucun message Telegram envoye).
      429 : vivant (attendu)
      200 : vivant mais anormal (honeypot contourne ou workflow modifie)
      404 : webhook desenregistre (deseq flag/runtime n8n connu)
      5xx, timeout, refus de connexion : n8n ne repond plus
    Un premier echec est confirme par une seconde sonde 15 s apres
    (anti-blip) avant toute alerte.
 2. Flag active du workflow j7gZ5Hj1rHkKB7Kg dans workflow_entity
    (/opt/n8n/data/database.sqlite). PRAGMA wal_checkpoint(PASSIVE) avant
    lecture (piege WAL n8n). Base illisible : alerte db_lecture.
 3. Sonde HTTP du site public https://mayoraz-net.ch/ (GET avec cache-buster) :
      200 sans headers GitHub : sain ; headers x-github-request-id ou
      x-served-by presents, ou code non 200 : site_anomalie (regression de
      migration possible) ; connexion/timeout/5xx : site_down. Echec confirme
      par une seconde sonde 15 s apres (anti-blip).
 4. /build.json : 200 + JSON avec sha et status ok|degraded, sinon
      site_build_ko (le badge de deploy du footer en depend).

Remontee Uptime Kuma : a chaque passage, push http://127.0.0.1:3001/api/push/
<token> (status=up|down, msg, ping en ms) vers le monitor "Site public
(watchdog)" affiche sur la status page publique (slug home). Token lu dans
/opt/n8n-watchdog/kuma-push.conf (600 root, jamais journalise). Si Kuma est
down, le push echoue silencieusement dans le log (pas d'alerte : Kuma a ses
propres canaux). Le push part aussi en TEST mode (sauf DRY).

Auto-reparation (flag active=0 uniquement, tentee a chaque alerte due) :
  docker exec n8n n8n update:workflow --id=j7gZ5Hj1rHkKB7Kg --active=true
  puis re-lecture du flag. ATTENTION : si le workflow est desactive
  volontairement, retirer d'abord la ligne cron (crontab -e), sinon le
  watchdog le reactivera a chaque passage.

Alertes Telegram : creds dans /opt/prospex/.env (TELEGRAM_BOT_TOKEN,
TELEGRAM_CHAT_ID), jamais affichees ni journalisees. Anti-spam : 1 alerte
max par 60 min par type d'echec, compteur d'echecs consecutifs dans le
message, et un unique message de retablissement au retour a la normale.

Variables d'environnement pour les tests (aucun effet en prod) :
  N8NWD_WEBHOOK_URL : URL de sonde de remplacement
  N8NWD_DB          : chemin de base de remplacement
  N8NWD_STATE       : fichier d'etat de remplacement
  N8NWD_DRY=1       : aucun effet de bord (pas d'envoi Telegram, pas de
                      reparation executee, pas de push Kuma), messages
                      affiches
  N8NWD_SITE_URL / N8NWD_BUILD_URL / N8NWD_KUMA_PUSH_FILE :
                      URLs de sonde site/build.json et fichier push Kuma

Exit : 0 = OK ou alerte envoyee ; 1 = echec constate, alerte dedupliquee ;
2 = creds absentes ; 3 = echec d'envoi Telegram ; 4 = erreur du script.

Miroir local : n8n_watchdog.py a la racine du repo site-web.
"""

import json
import os
import shutil
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

WORKFLOW_ID = "j7gZ5Hj1rHkKB7Kg"
DB_PATH = os.environ.get("N8NWD_DB", "/opt/n8n/data/database.sqlite")
WEBHOOK_URL = os.environ.get(
    "N8NWD_WEBHOOK_URL", "https://n8n.mayoraz-net.ch/webhook/contact-form")
PROSPEX_ENV = "/opt/prospex/.env"
STATE_FILE = os.environ.get("N8NWD_STATE", "/opt/n8n-watchdog/state.json")
SITE_URL = os.environ.get("N8NWD_SITE_URL", "https://mayoraz-net.ch/")
BUILD_JSON_URL = os.environ.get("N8NWD_BUILD_URL",
                                "https://mayoraz-net.ch/build.json")
KUMA_PUSH_FILE = os.environ.get("N8NWD_KUMA_PUSH_FILE",
                                "/opt/n8n-watchdog/kuma-push.conf")
DRY = os.environ.get("N8NWD_DRY", "") == "1"

PROBE_TIMEOUT = 25       # secondes
CONFIRM_DELAY = 15       # secondes entre sonde initiale et confirmation
REALERT_SECONDS = 3600   # re-alerte au plus toutes les heures par type

PROBE_FIELDS = {
    "name": "Watchdog",
    "email": "watchdog@mayoraz-net.ch",
    "message": "sonde watchdog (honeypot actif, ignorer)",
    "website": "spamtrap-watchdog",
}

_TEST_ENVS = ("N8NWD_WEBHOOK_URL", "N8NWD_DB", "N8NWD_STATE",
              "N8NWD_SITE_URL", "N8NWD_BUILD_URL", "N8NWD_KUMA_PUSH_FILE")
TEST = DRY or any(os.environ.get(k) for k in _TEST_ENVS)
PREFIX = "[n8n Watchdog TEST] " if TEST else "[n8n Watchdog] "


def utc():
    return time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())


def log(msg):
    print(f"{utc()} UTC {msg}", flush=True)


def probe_once(url):
    """POST multipart honeypot. Renvoie (status, err), status None si KO."""
    boundary = "n8nwd" + uuid.uuid4().hex
    parts = []
    for key, value in PROBE_FIELDS.items():
        parts.append(
            f"--{boundary}\r\n"
            f"Content-Disposition: form-data; name=\"{key}\"\r\n"
            f"\r\n{value}\r\n")
    body = "".join(parts) + f"--{boundary}--\r\n"
    req = urllib.request.Request(url, data=body.encode("utf-8"), method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    req.add_header("User-Agent", "n8n-watchdog/1.0 (mayoraz-net.ch)")
    try:
        with urllib.request.urlopen(req, timeout=PROBE_TIMEOUT) as resp:
            return resp.status, ""
    except urllib.error.HTTPError as exc:
        return exc.code, ""
    except Exception as exc:  # URLError, TimeoutError, conn reset, ...
        return None, f"{type(exc).__name__}: {exc}"[:220]


def classify(status, err):
    """Renvoie (type_echec, detail) ou (None, None) si sonde saine."""
    if status is None:
        return "n8n_down", f"connexion impossible : {err}"
    if status == 429:
        return None, None
    if status == 200:
        return ("probe_anomalie",
                "HTTP 200 sur la sonde honeypot : la branche Respond 429 n'a "
                "pas repondu (honeypot contourne ou workflow modifie), chaque "
                "sonde produit maintenant un vrai message Telegram du "
                "formulaire")
    if status == 404:
        return ("webhook_404",
                "HTTP 404 : webhook desenregistre (deseq flag/runtime n8n "
                "connu)")
    if 500 <= status <= 599:
        return "n8n_down", f"HTTP {status} sur la sonde (n8n en erreur)"
    return "probe_anomalie", f"HTTP {status} inattendu sur la sonde"


GH_HEADERS = ("x-github-request-id", "x-served-by")


def probe_site():
    """GET / avec cache-buster. Renvoie (status, headers, err, ping_ms)."""
    url = SITE_URL + ("&" if "?" in SITE_URL else "?") + \
        "cb=" + str(int(time.time() * 1000))
    req = urllib.request.Request(url, method="GET")
    req.add_header("User-Agent", "n8n-watchdog/1.0 (mayoraz-net.ch)")
    req.add_header("Cache-Control", "no-cache")
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=PROBE_TIMEOUT) as resp:
            headers = {k.lower(): v for k, v in resp.headers.items()}
            return resp.status, headers, "", (time.time() - t0) * 1000
    except urllib.error.HTTPError as exc:
        headers = {k.lower(): v for k, v in exc.headers.items()}
        return exc.code, headers, "", (time.time() - t0) * 1000
    except Exception as exc:
        detail = f"{type(exc).__name__}: {exc}"[:200]
        return None, {}, detail, (time.time() - t0) * 1000


def classify_site(status, headers, err):
    """Renvoie (type_echec, detail) ou (None, None) si site sain."""
    if status is None:
        return "site_down", f"connexion impossible : {err}"
    if status != 200:
        return "site_anomalie", f"HTTP {status} sur {SITE_URL} (attendu 200)"
    gh = [h for h in GH_HEADERS if h in headers]
    if gh:
        return ("site_anomalie",
                "HTTP 200 mais headers GitHub presents (" + ", ".join(gh) +
                ") : l apex ne serait plus servi par Cloudflare Workers")
    return None, None


def check_build_json():
    """GET /build.json : 200 + JSON sha/status ok|degraded. None si sain."""
    req = urllib.request.Request(BUILD_JSON_URL, method="GET")
    req.add_header("User-Agent", "n8n-watchdog/1.0 (mayoraz-net.ch)")
    try:
        with urllib.request.urlopen(req, timeout=PROBE_TIMEOUT) as resp:
            code, raw = resp.status, resp.read(65536)
    except urllib.error.HTTPError as exc:
        return f"HTTP {exc.code} sur {BUILD_JSON_URL} (attendu 200)"
    except Exception as exc:
        return (f"lecture de {BUILD_JSON_URL} impossible : "
                f"{type(exc).__name__}: {exc}")[:220]
    try:
        data = json.loads(raw.decode("utf-8", "replace"))
    except Exception as exc:
        return f"/build.json : JSON invalide ({type(exc).__name__})"
    if not isinstance(data, dict):
        return "/build.json : JSON inattendu (objet attendu)"
    if "sha" not in data or data.get("status") not in ("ok", "degraded"):
        return "/build.json : champs sha/status absents ou inattendus"
    return None


def read_kuma_push_url():
    try:
        with open(KUMA_PUSH_FILE, encoding="utf-8") as handle:
            url = handle.read().strip()
        return url or None
    except Exception:
        return None


def kuma_push(site_ok, msg, ping_ms):
    if DRY:
        log(f"KUMA_PUSH_DRY status={'up' if site_ok else 'down'} msg={msg} "
            f"ping={int(ping_ms)}ms")
        return
    url = read_kuma_push_url()
    if not url:
        log("KUMA_PUSH_SKIP (fichier kuma-push.conf absent ou vide)")
        return
    status = "up" if site_ok else "down"
    params = urllib.parse.urlencode(
        {"status": status, "msg": msg, "ping": str(int(ping_ms))})
    req = urllib.request.Request(url + "?" + params)
    req.add_header("User-Agent", "n8n-watchdog/1.0 (mayoraz-net.ch)")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            log(f"KUMA_PUSH_{status.upper()} HTTP {resp.status} "
                f"ping={int(ping_ms)}ms")
    except Exception as exc:
        log(f"KUMA_PUSH_KO {type(exc).__name__}: {exc}"[:200])


def read_active_flag():
    if not os.path.exists(DB_PATH):
        raise RuntimeError(f"base absente : {DB_PATH}")
    con = sqlite3.connect(DB_PATH, timeout=10)
    try:
        con.execute("PRAGMA busy_timeout=10000")
        con.execute("PRAGMA wal_checkpoint(PASSIVE)")
        row = con.execute(
            "SELECT active FROM workflow_entity WHERE id = ?",
            (WORKFLOW_ID,)).fetchone()
    finally:
        con.close()
    if row is None:
        raise RuntimeError(
            f"workflow {WORKFLOW_ID} introuvable dans workflow_entity")
    return int(row[0])


def run_checks():
    failures = {}
    status, err = probe_once(WEBHOOK_URL)
    ftype, _ = classify(status, err)
    if ftype is not None:
        time.sleep(CONFIRM_DELAY)
        status2, err2 = probe_once(WEBHOOK_URL)
        ftype2, fdetail2 = classify(status2, err2)
        if ftype2 is not None:  # echec confirme ; blip transitoire ecarte sinon
            failures[ftype2] = fdetail2
    try:
        flag = read_active_flag()
    except Exception as exc:
        failures["db_lecture"] = (
            f"lecture de la base impossible : {type(exc).__name__}: "
            f"{exc}")[:220]
    else:
        if flag != 1:
            failures["active_flag"] = f"flag active={flag} en base (attendu 1)"
    # sonde site public (anti-blip identique)
    s_status, s_headers, s_err, ping_ms = probe_site()
    s_type, _ = classify_site(s_status, s_headers, s_err)
    if s_type is not None:
        time.sleep(CONFIRM_DELAY)
        s_status2, s_headers2, s_err2, ping_ms2 = probe_site()
        s_type2, s_detail2 = classify_site(s_status2, s_headers2, s_err2)
        if s_type2 is not None:
            failures[s_type2] = s_detail2
    # build.json (inutile si le site est deja declare down)
    if "site_down" not in failures:
        build_err = check_build_json()
        if build_err:
            failures["site_build_ko"] = build_err
    return failures, ping_ms


def repair_flag():
    """Reactive le workflow si son flag est retombe a 0. Renvoie une note."""
    cmd = ["docker", "exec", "n8n", "n8n", "update:workflow",
           f"--id={WORKFLOW_ID}", "--active=true"]
    if DRY:
        return ("DRY : reparation non executee (commande : docker exec n8n "
                "n8n update:workflow --id=... --active=true)")
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
        out = ((proc.stdout or "") + " " + (proc.stderr or "")).strip()
        out = " ".join(out.split())[:300]
        flag = read_active_flag()
        if flag == 1:
            return (f"reparation executee et verifiee (flag active=1). "
                    f"sortie : {out}")
        return f"reparation executee mais flag active={flag} apres. sortie : {out}"
    except Exception as exc:
        return f"reparation impossible : {type(exc).__name__}: {exc}"[:220]


def load_env_file(path):
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def telegram_send(text):
    env = load_env_file(PROSPEX_ENV)
    token = env.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = env.get("TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat:
        log("TELEGRAM_SKIP creds absentes dans /opt/prospex/.env")
        return 2
    if DRY:
        log("TELEGRAM_DRY message qui aurait ete envoye :\n" + text)
        return 0
    data = urllib.parse.urlencode(
        {"chat_id": chat, "text": text[:4000]}).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage", data=data)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            code = resp.getcode()
    except Exception as exc:
        log(f"TELEGRAM_KO {type(exc).__name__}: {exc}")
        return 3
    log(f"TELEGRAM_OK {code}")
    return 0


def load_state():
    try:
        with open(STATE_FILE, encoding="utf-8") as handle:
            st = json.load(handle)
        if isinstance(st, dict) and isinstance(st.get("types"), dict):
            st.setdefault("incident_open", False)
            st.setdefault("fail_runs", 0)
            st.setdefault("last_fail_types", [])
            return st
    except Exception:
        pass
    return {"incident_open": False, "fail_runs": 0,
            "last_fail_types": [], "types": {}}


def save_state(st):
    os.makedirs(os.path.dirname(STATE_FILE) or ".", exist_ok=True)
    tmp = STATE_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as handle:
        json.dump(st, handle, ensure_ascii=False)
    shutil.move(tmp, STATE_FILE)


def build_alert_text(failures, st, repair_note):
    lines = [
        f"{PREFIX}ALERTE : webhook du formulaire de contact (mayoraz-net.ch)",
        f"Heure : {utc()} UTC",
        "Probleme(s) :",
    ]
    for ftype, fdetail in failures.items():
        lines.append(f"- {ftype} : {fdetail}")
    lines.append(
        f"Passages en echec consecutifs : {st.get('fail_runs', 0)} "
        "(echec confirme par une seconde sonde 15 s apres)")
    if repair_note:
        lines.append(f"Auto-reparation du flag : {repair_note}")
    lines.append(
        "Diagnostic : ssh root@100.70.222.73 puis docker ps, "
        "docker logs n8n --tail 50")
    lines.append(
        "Reactivation manuelle si besoin : docker exec n8n n8n "
        f"update:workflow --id={WORKFLOW_ID} --active=true")
    lines.append("Re-alerte : dans 60 min maximum si le probleme persiste.")
    return "\n".join(lines)


def main():
    failures, ping_ms = run_checks()
    site_failures = [t for t in failures if t.startswith("site_")]
    kuma_push(not site_failures,
              "OK" if not site_failures else sorted(site_failures)[0],
              ping_ms)
    st = load_state()
    now = time.time()

    for ftype in list(st["types"]):
        if ftype not in failures:
            st["types"].pop(ftype, None)

    if not failures:
        was_open = bool(st.get("incident_open"))
        prev_runs = int(st.get("fail_runs", 0))
        prev_types = ", ".join(st.get("last_fail_types") or []) or "?"
        st["incident_open"] = False
        st["fail_runs"] = 0
        st["last_fail_types"] = []
        st["types"] = {}
        save_state(st)
        if was_open:
            text = (
                f"{PREFIX}Retabli : le webhook du formulaire repond de "
                f"nouveau.\nHeure : {utc()} UTC\nApres {prev_runs} "
                f"passage(s) en echec (types : {prev_types}).\n"
                "Verification : sonde n8n 429 OK, site public 200 OK, "
                "flag active=1.")
            rc = telegram_send(text)
            log("CHECK_OK retabli, notification " +
                ("envoyee" if rc == 0 else f"echouee rc={rc}"))
            return rc
        log("CHECK_OK sonde OK, flag active=1")
        return 0

    st["fail_runs"] = int(st.get("fail_runs", 0)) + 1
    due_types = []
    for ftype in failures:
        meta = st["types"].setdefault(ftype, {"last_alert_ts": 0.0})
        if now - float(meta["last_alert_ts"]) >= REALERT_SECONDS:
            due_types.append(ftype)

    repair_note = None
    if "active_flag" in due_types:
        repair_note = repair_flag()
        if "verifiee (flag active=1)" in repair_note:
            failures.pop("active_flag")
            st["types"]["active_flag"] = {"last_alert_ts": now}
            due_types.remove("active_flag")

    if failures and due_types:
        st["incident_open"] = True
        st["last_fail_types"] = sorted(failures)
        log("CHECK_KO " + " | ".join(
            f"{ftype}: {fdetail}" for ftype, fdetail in failures.items()))
        rc = telegram_send(build_alert_text(failures, st, repair_note))
        if rc == 0:
            for ftype in due_types:
                st["types"][ftype]["last_alert_ts"] = now
        save_state(st)
        return rc
    if failures:
        st["incident_open"] = True
        st["last_fail_types"] = sorted(failures)
        save_state(st)
        log("CHECK_KO (re-alerte pas encore due) " + ", ".join(failures))
        return 1

    # plus aucun echec : le flag a ete repare avec succes
    st["incident_open"] = False
    st["fail_runs"] = 0
    st["last_fail_types"] = []
    st["types"] = {}
    save_state(st)
    text = (
        f"{PREFIX}Auto-reparation effectuee.\n"
        "Le flag active du workflow formulaire etait retombe a 0 : "
        "re-active et re-verifie a 1.\n"
        f"Heure : {utc()} UTC\nIncident clos.")
    rc = telegram_send(text)
    log("CHECK_OK apres auto-reparation du flag")
    return rc


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as exc:
        log(f"CHECK_ERREUR {type(exc).__name__}: {exc}")
        sys.exit(4)
