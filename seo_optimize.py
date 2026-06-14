import os
import re

def optimize_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If it's a ping-pong site page
    if 'ctt_montriond' in filepath:
        if '<meta name="keywords"' not in content:
            meta_keywords = '<meta name="keywords" content="ping pong, tennis de table, lausanne, montriond, ouchy, club sportif, sport, vaud, tournoi, entrainement">'
            content = re.sub(r'(<meta name="description".*?>)', r'\1\n    ' + meta_keywords, content)
        if '<meta name="robots"' not in content:
            meta_robots = '<meta name="robots" content="index, follow">'
            content = re.sub(r'(<title>.*?</title>)', r'\1\n    ' + meta_robots, content)
            
    # For portfolio pages
    else:
        if '<meta name="robots"' not in content and '404' not in filepath:
            meta_robots = '<meta name="robots" content="index, follow">'
            content = re.sub(r'(<title>.*?</title>)', r'\1\n    ' + meta_robots, content)

    # Ensure canonical URL exists for SEO (very good practice)
    if '<link rel="canonical"' not in content and '404' not in filepath:
        # Determine URL
        rel_path = filepath.replace(root_dir, '').replace('\\', '/')
        if rel_path == '/index.html':
            canonical = 'https://mayoraz-net.ch/'
        elif rel_path.endswith('/index.html'):
            canonical = f'https://mayoraz-net.ch{rel_path.replace("index.html", "")}'
        else:
            canonical = f'https://mayoraz-net.ch{rel_path}'
            
        canonical_tag = f'<link rel="canonical" href="{canonical}">'
        content = re.sub(r'(<meta name="description".*?>)', r'\1\n    ' + canonical_tag, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

root_dir = os.path.dirname(os.path.abspath(__file__))
count = 0
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            optimize_html(path)
            count += 1
print(f"Optimized SEO tags for {count} HTML files.")
