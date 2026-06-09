import os
import glob

replacements = {
    "Ã©": "é",
    "Ã¨": "è",
    "Ã\xa0": "à",
    "Ã ": "à",
    "Ã¢": "â",
    "Ãª": "ê",
    "Ã®": "î",
    "Ã´": "ô",
    "Ã§": "ç",
    "Ã€": "À",
    "Ã‰": "É",
    "â€™": "'",
    "â€“": "-",
    "Ã¯": "ï",
    "Ã¼": "ü",
    "Ã»": "û",
}

for root, dirs, files in os.walk(r"A:\SiteWeb"):
    if "ctt_montriond" in root:
        continue
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            for k, v in replacements.items():
                content = content.replace(k, v)
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
