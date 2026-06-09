import os
import re

def update_file(path, is_index=False):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # 1. Update footer to add email
    # Look for <footer> ... </nav> ... </footer>
    if 'contact@mayoraz-net.ch' not in content:
        # For index.html
        content = re.sub(
            r'(<footer>\s*.*?<nav.*?>.*?<a href=\'?contact/contact\.html\'?>Contact</a>)(.*?</nav>\s*</footer>)',
            r'\1\n        <a href="mailto:contact@mayoraz-net.ch">contact@mayoraz-net.ch</a>\2',
            content,
            flags=re.DOTALL
        )
        # For other files
        content = re.sub(
            r'(<footer>\s*.*?<nav.*?>.*?<a href=\'?\.\./contact/contact\.html\'?>Contact</a>)(.*?</nav>\s*</footer>)',
            r'\1\n                <a href="mailto:contact@mayoraz-net.ch">contact@mayoraz-net.ch</a>\2',
            content,
            flags=re.DOTALL
        )
        
    if is_index:
        # 2. Remove red banner
        content = re.sub(r'<h2 style="color: red;">.*?Site web en cours de.*?</h2>\s*<p style="text-align: center;color: red;">.*?</p>', '', content, flags=re.DOTALL)
        
        # 3. Add GitHub link
        github_html = """        <p class="tagline">"À votre disposition pour tous vos besoins informatiques"</p>
        <div class="social-links" style="margin-top: 20px;">
            <a href="https://github.com/Tom1419-git" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; background: #24292e; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: background 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <svg height="24" width="24" viewBox="0 0 16 16" fill="white">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
                Mon GitHub
            </a>
        </div>"""
        
        if 'github.com/Tom1419-git' not in content:
            content = content.replace('<p class="tagline">"À votre disposition pour tous vos besoins informatiques"</p>', github_html)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


files = [
    (r"A:\SiteWeb\index.html", True),
    (r"A:\SiteWeb\a-propos\a-propos.html", False),
    (r"A:\SiteWeb\contact\contact.html", False),
    (r"A:\SiteWeb\contact\merci.html", False)
]

for filepath, is_idx in files:
    if os.path.exists(filepath):
        update_file(filepath, is_idx)
        print(f"Updated {filepath}")
    else:
        print(f"Not found: {filepath}")
