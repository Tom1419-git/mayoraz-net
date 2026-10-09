#!/usr/bin/env python3
"""Prospex — segmentation des rebonds et opt-outs (santé de la réputation d'envoi).

Répond à une seule question : QUEL segment dégrade le domaine ? Sortie :

  1. taux de rebond par type d'email (osm vérifié vs guessed_green sondé vs …)
     — la métrique qui compte est calculée PARMI LES LEADS RÉELLEMENT ÉCRITS
     (steps day0 'sent'), pas sur tous les lead_id marqués dead à l'import ;
  2. top domaines destinataires qui rebondissent (où ne pas écrire) ;
  3. top domaines en opt-out (où ne plus écrire du tout) ;
  4. verdict + seuils d'action (sunset au-delà de 5 % de rebond).

Usage: python3 bounce_report.py [--db /opt/prospex/prospection.db]
"""
import argparse, sqlite3, sys

SUNSET = 5.0      # au-delà : le segment sort du sourcing (aligné sur volume_gate)
MIN_SENT = 20     # en dessous : pas assez de volume pour conclure

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default="/opt/prospex/prospection.db")
    ap.add_argument("--top", type=int, default=12)
    a = ap.parse_args()
    con = sqlite3.connect(a.db)
    con.row_factory = sqlite3.Row
    c = con.cursor()

    print("1) REBOND PAR TYPE D'EMAIL (parmi les day0 réellement envoyés)")
    rows = c.execute("""
        SELECT l.email_status st, COUNT(DISTINCT l.lead_id) envoye,
               SUM(CASE WHEN l.status='dead' THEN 1 ELSE 0 END) dead,
               ROUND(100.0 * SUM(CASE WHEN l.status='dead' THEN 1 ELSE 0 END)
                     / COUNT(DISTINCT l.lead_id), 1) taux
        FROM leads l
        JOIN steps s ON s.lead_id = l.lead_id AND s.step='day0' AND s.state='sent'
        GROUP BY 1 ORDER BY taux DESC""").fetchall()
    flagged = []
    for r in rows:
        verdict = ""
        if r["envoye"] >= MIN_SENT and (r["taux"] or 0) > SUNSET:
            verdict = "  <-- À RETIRER DU SOURCING"
            flagged.append(r["st"])
        elif r["envoye"] < MIN_SENT:
            verdict = "  (volume insuffisant pour conclure)"
        print(f"   {r['st']:<15} envoyés={r['envoye']:<5} rebonds={r['dead']:<4} {r['taux'] or 0:>5}%{verdict}")

    print("\n2) DOMAINES DESTINATAIRES QUI REBONDISSENT")
    for r in c.execute("""
        SELECT substr(lower(email), instr(lower(email), '@') + 1) dom, COUNT(*) n
        FROM leads WHERE status='dead' AND email LIKE '%@%'
        GROUP BY 1 HAVING n > 1 ORDER BY n DESC LIMIT ?""", (a.top,)):
        print(f"   {r['dom']:<26} {r['n']} rebond(s)")

    print("\n3) DOMAINES EN OPT-OUT (ne plus jamais écrire)")
    for r in c.execute("""
        SELECT substr(lower(email), instr(lower(email), '@') + 1) dom, COUNT(*) n
        FROM optouts GROUP BY 1 HAVING n > 1 ORDER BY n DESC LIMIT ?""", (a.top,)):
        print(f"   {r['dom']:<26} {r['n']} opt-out(s)")

    print("\n4) OPT-OUT PAR TYPE")
    for r in c.execute("""
        SELECT email_status st, COUNT(*) n FROM leads
        WHERE optout=1 OR status='optout' GROUP BY 1 ORDER BY n DESC"""):
        print(f"   {r['st']:<15} {r['n']}")

    print("\nVERDICT")
    if flagged:
        print(f"   Segment(s) à sortir du sourcing (> {SUNSET}% de rebond, volume suffisant) : "
              + ", ".join(flagged))
        print("   → retirer ces types de l'ensemble sûr de enroll_due.py, ou les plafonner.")
    else:
        print("   Aucun segment au-dessus du seuil : régime sain.")
    con.close()
    return 0

if __name__ == "__main__":
    sys.exit(main())
