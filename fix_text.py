import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    fixes = {
        'ÀÀ propos': 'À propos',
        'ÀÀ Propos': 'À Propos',
        'â† Retour': '← Retour',
        'â†’': '→',
        'DǸcouvrez': 'Découvrez',
        'compǸtences': 'compétences',
        'rǸalisations': 'réalisations',
        'dǸveloppement': 'développement',
        'crǸation': 'création',
        'expǸriences': 'expériences',
        'expǸrience': 'expérience',
        'rǸsultats': 'résultats',
        'Ǹquipes': 'équipes',
        'dǸveloppǸ': 'développé',
        'personnalisǸes': 'personnalisées',
        'assemblǸes': 'assemblées',
        'diffǸrents': 'différents',
        'optimisǸ': 'optimisé',
        'optimisǸes': 'optimisées',
        'prǸsentes': 'présentes',
        'rǸelles': 'réelles',
        'spǸcifique': 'spécifique',
        'crǸations': 'créations',
        'reflte': 'reflète',
        '? propos': 'À propos',
        '? Retour': '← Retour',
        '?': 'À',
        '': 'à',
    }
    
    original = content
    for k, v in fixes.items():
        content = content.replace(k, v)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {filepath}')

for r, d, files in os.walk(r'A:\SiteWeb'):
    for f in files:
        if f.endswith('.html'):
            fix_file(os.path.join(r, f))
