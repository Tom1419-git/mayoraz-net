import os

mojibake_map = {
    "ðŸ’»": "💻",
    "ðŸ›": "🛠️",
    "âš¡": "⚡",
    "ðŸ“š": "📚",
    "â†’": "→",
    "ðŸ“Œ": "📌",
    "ðŸ¤": "🤝",
    "ðŸ’¼": "💼",
    "ðŸŽ“": "🎓",
    "ðŸš€": "🚀",
    "ðŸ”§": "🔧",
    "âœ…": "✅",
    "ðŸ“§": "📧",
    "ðŸ“ž": "📞",
    "ðŸ“": "📍",
    "ðŸ‘¨‍ðŸ’»": "👨‍💻",
    "👨‍💻": "👨‍💻",
    "DǸcouvrez": "Découvrez",
    "compǸtences": "compétences",
    " propos": "À propos",
    "? propos": "À propos",
    "rǸalisations": "réalisations",
    "dǸveloppement": "développement",
    "crǸation": "création",
    "expǸriences": "expériences",
    "expǸrience": "expérience",
    "rǸsultats": "résultats",
    "Ǹquipes": "équipes",
    "dǸveloppǸ": "développé",
    "personnalisǸes": "personnalisées",
    "assemblǸes": "assemblées",
    "diffǸrents": "différents",
    "optimisǸ": "optimisé",
    "optimisǸes": "optimisées",
    "prǸsentes": "présentes",
    "rǸelles": "réelles",
    "spǸcifique": "spécifique",
    "": "à",
    "Y-": "🖥️",
    "Ys": "⚠️",
    "Y\"": "📷",
    "YO?": "🌐",
    "Y'": "💡",
    "Y?\"": "🏓",
    "? Retour": "← Retour",
    "dpannage": "dépannage",
    "Dveloppement": "Développement",
    "concrtiser": "concrétiser",
    "cration": "création",
    "Y\x8e\x93": "🎓",
    "Y\x92\xbc": "💼",
    "Y\x9a\x80": "🚀",
    "Y\x94\xa7": "🔧",
    "Y\x93\x8e": "📌",
}

for root, dirs, files in os.walk(r"A:\SiteWeb"):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            
            original_content = content
            for bad, good in mojibake_map.items():
                content = content.replace(bad, good)
            
            if content != original_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed encoding in {filepath}")
