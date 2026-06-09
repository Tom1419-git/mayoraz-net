import os

path = r"A:\SiteWeb\sites-web\intro-sites-webs.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add email to footer
if 'contact@mayoraz-net.ch' not in content:
    content = content.replace(
        '<a href="../sitemap.xml">Plan du site</a>\n            </nav>',
        '<a href="../sitemap.xml">Plan du site</a>\n                <a href="mailto:contact@mayoraz-net.ch">contact@mayoraz-net.ch</a>\n            </nav>'
    )

# 2. Add portfolio site card
portfolio_card = """                <a class='site-card' href='../index.html'>
                    <div class="site-header">
                        <span class="site-icon">👨‍💻</span>
                        <div>
                            <h3 class="site-title">Portfolio Personnel</h3>
                            <p class="site-url">mayoraz-net.ch</p>
                            <p class="project-date">Juin 2026</p>
                        </div>
                    </div>
                    <p class="site-description">
                        Mon propre site web vitrine et portfolio professionnel. Conçu de A à Z pour présenter mes services informatiques, mes réalisations et faciliter la prise de contact grâce à un design moderne, réactif et optimisé.
                    </p>
                    <div class="site-tech">
                        <span class="tech-tag">HTML5</span>
                        <span class="tech-tag">CSS3</span>
                        <span class="tech-tag">JavaScript</span>
                        <span class="tech-tag">Turnstile</span>
                    </div>
                </a>

                <div class="add-site-card">"""

if 'Portfolio Personnel' not in content:
    content = content.replace('                <div class="add-site-card">', portfolio_card)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("intro-sites-webs.html updated successfully!")
