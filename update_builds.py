import os
import re

path = r"A:\SiteWeb\builds-pc\intro-buildpc.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the red warning banner
content = re.sub(r'<h2>.*?Attention - Les configuration ci-dessous sont présentes à titre d\'exemple.*?</h2>', '', content, flags=re.DOTALL)

# Replace the builds grid
new_grid = """
            <div class="builds-grid">
                <div class="build-card">
                    <div class="build-image">
                        <img src="../media/img/builds-pc/pc-setup1.jpg" alt="Mon Setup Actuel" />
                    </div>
                    <div class="build-content">
                        <div class="build-header">
                            <h3 class="build-title">Mon Setup Actuel</h3>
                            <p class="build-subtitle">Configuration personnelle</p>
                            <span class="build-status">ACTIF</span>
                        </div>
                        <p class="build-description">
                            Ma machine principale quotidienne, optimisée pour le développement, la productivité et le gaming fluide. Équipée des dernières technologies AMD pour des performances optimales sans compromis.
                        </p>
                        <ul class="build-specs">
                            <li><span class="spec-label">Processeur</span> AMD Ryzen 7 7700X</li>
                            <li><span class="spec-label">Carte Graphique</span> AMD Radeon RX 6750 XT</li>
                            <li><span class="spec-label">Mémoire Vive</span> 32 Go DDR5</li>
                            <li><span class="spec-label">Stockage Principal</span> 1 To NVMe SSD</li>
                            <li><span class="spec-label">Stockage Secondaire</span> 128 Go SSD</li>
                        </ul>
                    </div>
                </div>
            </div>
"""

# Find the start of builds-grid and replace it
# The original has <div class="builds-grid"> ... and ends before </main>
content = re.sub(r'<div class="builds-grid">.*?</main>', new_grid + '\n        </main>', content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("intro-buildpc.html updated successfully!")
