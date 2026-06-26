const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'public/media/locales/en.js');
let localesContent = fs.readFileSync(localesPath, 'utf8');

const dictRegex = /const frToEn = (\{[\s\S]*?\});/;
const match = localesContent.match(dictRegex);

let frToEn;
try {
    frToEn = eval('(' + match[1] + ')');
} catch(e) {
    console.error("Eval failed", e);
    process.exit(1);
}

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

walk('src/pages', (filePath) => {
    if (filePath.endsWith('.astro')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const [key, value] of Object.entries(frToEn)) {
            // Ignorer certaines clés spécifiques
            if (key.startsWith("tuto_arr_") || key.startsWith("tuto_alias_") || key.startsWith("form_")) continue;
            
            // 1. Textes dans les balises classiques (déjà fait, mais on s'assure que c'est bon)
            const keyEscaped = escapeRegExp(key);
            let rText = new RegExp(`(<[a-zA-Z1-6]+(?: (?!data-i18n)[^>]+)?)>(\\s*${keyEscaped}\\s*<\/[a-zA-Z1-6]+>)`, 'g');
            const attr = key.includes('<') ? 'data-i18n-html' : 'data-i18n';
            
            if (rText.test(content)) {
                content = content.replace(rText, `$1 ${attr}="${key.replace(/"/g, '&quot;')}">$2`);
                modified = true;
            }

            // 2. Attributs aria-label
            let rAria = new RegExp(`(aria-label=")${keyEscaped}(")`, 'g');
            if (rAria.test(content)) {
                content = content.replace(rAria, `$1${key.replace(/"/g, '&quot;')}" data-i18n-aria="${key.replace(/"/g, '&quot;')}"`);
                modified = true;
            }

            // 3. Cas spécifiques où le texte n'est pas le seul élément de la balise (ex: texte + icône)
            // C'est un peu risqué avec un regex global, donc on va chercher manuellement certains éléments
            // que nous venons d'ajouter.
        }

        // Ajout manuel des data-i18n pour les tooltips, etc. où la regex ne match pas
        let manualReplaces = [
            ['>Ma Stack Technique</h2>', ' data-i18n="Ma Stack Technique">Ma Stack Technique</h2>'],
            ['>Infra &amp; Virtualisation</h3>', ' data-i18n="Infra & Virtualisation">Infra &amp; Virtualisation</h3>'],
            ['>Monitoring &amp; Auto.</h3>', ' data-i18n="Monitoring & Auto.">Monitoring &amp; Auto.</h3>'],
            ['>Services &amp; Hébergement</h3>', ' data-i18n="Services & Hébergement">Services &amp; Hébergement</h3>'],
            ['>Dépannage</div>', ' data-i18n="Dépannage">Dépannage</div>'],
            ['>Conseil Technique</div>', ' data-i18n="Conseil Technique">Conseil Technique</div>'],
            ['>📍 Lausanne, Vaud • Apprenti Informatique ETML</p>', ' data-i18n="📍 Lausanne, Vaud • Apprenti Informatique ETML">📍 Lausanne, Vaud • Apprenti Informatique ETML</p>'],
            ['>"À votre disposition pour tous vos besoins informatiques"</p>', ' data-i18n="&quot;À votre disposition pour tous vos besoins informatiques&quot;">"À votre disposition pour tous vos besoins informatiques"</p>'],
            ['>Mon GitHub\n            </a>', ' data-i18n="Mon GitHub">Mon GitHub\n            </a>'],
            ['>Mon LinkedIn\n            </a>', ' data-i18n="Mon LinkedIn">Mon LinkedIn\n            </a>'],
            ['>Grafana</span>', ' data-i18n="Grafana">Grafana</span>'],
            ['>Prometheus</span>', ' data-i18n="Prometheus">Prometheus</span>'],
            ['>n8n</span>', ' data-i18n="n8n">n8n</span>'],
            ['>Jellyfin</span>', ' data-i18n="Jellyfin">Jellyfin</span>'],
            ['>Proxmox</span>', ' data-i18n="Proxmox">Proxmox</span>'],
            ['>Virtualisation de mes serveurs et gestion de l\'infrastructure.</div>', ' data-i18n="Virtualisation de mes serveurs et gestion de l\'infrastructure.">Virtualisation de mes serveurs et gestion de l\'infrastructure.</div>']
        ];

        for (const [search, replace] of manualReplaces) {
            if (content.includes(search) && !content.includes(replace)) {
                content = content.replace(search, replace);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log("Injected into", filePath);
        }
    }
});
