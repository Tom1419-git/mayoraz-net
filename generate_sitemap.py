import os
from datetime import datetime

root_dir = os.path.dirname(os.path.abspath(__file__))
base_url = "https://mayoraz-net.ch"

# Excluded files
exclude = ['404.html', 'cv_thomas.html', 'merci.html', 'jeu-trex/index.html']

urls = []

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            rel_path = path.replace(root_dir, '').replace('\\', '/').lstrip('/')
            
            # Check exclusions
            if any(rel_path.endswith(ex) for ex in exclude):
                continue
            
            url = f"{base_url}/{rel_path}"
            # Clean up index.html from URL for better SEO
            if url.endswith('/index.html'):
                url = url[:-10]
                
            priority = "1.0" if url == base_url + "/" else "0.8"
            if 'ctt_montriond' in url:
                priority = "0.7"
                
            urls.append(f"""  <url>
    <loc>{url}</loc>
    <lastmod>{datetime.now().strftime('%Y-%m-%d')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{priority}</priority>
  </url>""")

sitemap = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>"""

with open(os.path.join(root_dir, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap)
print(f"Sitemap generated successfully with {len(urls)} URLs.")
