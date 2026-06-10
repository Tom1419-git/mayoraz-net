import os

site_url = "https://mayoraz-net.ch"
sitemap_path = r"A:\SiteWeb\sitemap.xml"

urls = []
for root, dirs, files in os.walk(r'A:\SiteWeb'):
    # Ignore CTT montriond (it's just a demo project, or we can keep it, let's keep it but index.html only)
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, r'A:\SiteWeb').replace('\\', '/')
            
            # Clean URLs: if index.html, we just use the directory path
            if file == 'index.html':
                if rel_path == 'index.html':
                    url = f"{site_url}/"
                else:
                    dir_path = os.path.dirname(rel_path)
                    url = f"{site_url}/{dir_path}/"
            else:
                url = f"{site_url}/{rel_path}"
            
            # Filter out some paths if we want to noindex them, but sitemap is fine
            if 'jeu-trex' not in url and 'status' not in url and '404' not in url:
                urls.append(url)

# Add JSON API endpoint
urls.append(f"{site_url}/api/cv.json")

xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

for url in sorted(urls):
    xml_content.append(f'  <url><loc>{url}</loc></url>')

xml_content.append('</urlset>')

with open(sitemap_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(xml_content))

print("Sitemap generated successfully.")
