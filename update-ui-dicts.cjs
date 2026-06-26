const missingTextsEn = {
    "Ma Stack Technique": "My Tech Stack",
    "Infra & Virtualisation": "Infra & Virtualization",
    "Monitoring & Auto.": "Monitoring & Auto.",
    "Services & Hébergement": "Services & Hosting",
    "Dépannage": "Troubleshooting",
    "Conseil Technique": "Tech Consulting",
    "📍 Lausanne, Vaud • Apprenti Informatique ETML": "📍 Lausanne, Vaud • IT Apprentice at ETML",
    "\"À votre disposition pour tous vos besoins informatiques\"": "\"At your service for all your IT needs\"",
    "Voir mon Infrastructure Personnelle": "View my Personal Infrastructure",
    "Voir mes projets en C#": "View my C# projects",
    "Voir mes réalisations de sites web": "View my web development projects",
    "Voir mes configurations PC": "View my PC builds",
    "Voir mes projets divers": "View my miscellaneous projects",
    "Petit quiz sur l'informatique": "Quick IT quiz",
    "Mini-jeu caché Admin Run": "Hidden mini-game Admin Run",
    "En savoir plus sur mon parcours": "Learn more about my background",
    "Me contacter pour un projet": "Contact me for a project",
    "Mon GitHub": "My GitHub",
    "Mon LinkedIn": "My LinkedIn",
    "À Propos de moi": "About Me",
    "Me Contacter": "Contact Me",
    "Une question, un projet ou besoin d'assistance ? N'hésitez pas à me contacter via le formulaire dédié. Je vous répondrai très rapidement.": "A question, a project or need assistance? Feel free to contact me via the dedicated form. I will reply very quickly.",
    "Grafana": "Grafana",
    "Prometheus": "Prometheus",
    "n8n": "n8n",
    "Jellyfin": "Jellyfin",
    "Proxmox": "Proxmox",
    "Virtualisation de mes serveurs et gestion de l'infrastructure.": "Virtualization of my servers and infrastructure management."
};

const missingTextsDe = {
    "Ma Stack Technique": "Mein Tech-Stack",
    "Infra & Virtualisation": "Infra & Virtualisierung",
    "Monitoring & Auto.": "Überwachung & Auto.",
    "Services & Hébergement": "Dienste & Hosting",
    "Dépannage": "Fehlerbehebung",
    "Conseil Technique": "Technische Beratung",
    "📍 Lausanne, Vaud • Apprenti Informatique ETML": "📍 Lausanne, Waadt • IT-Auszubildender an der ETML",
    "\"À votre disposition pour tous vos besoins informatiques\"": "\"Zu Ihren Diensten für alle Ihre IT-Bedürfnisse\"",
    "Voir mon Infrastructure Personnelle": "Meine persönliche Infrastruktur ansehen",
    "Voir mes projets en C#": "Meine C#-Projekte ansehen",
    "Voir mes réalisations de sites web": "Meine Webentwicklungsprojekte ansehen",
    "Voir mes configurations PC": "Meine PC-Builds ansehen",
    "Voir mes projets divers": "Meine diversen Projekte ansehen",
    "Petit quiz sur l'informatique": "Kleines IT-Quiz",
    "Mini-jeu caché Admin Run": "Verstecktes Minispiel Admin Run",
    "En savoir plus sur mon parcours": "Erfahren Sie mehr über meinen Werdegang",
    "Me contacter pour un projet": "Kontaktieren Sie mich für ein Projekt",
    "Mon GitHub": "Mein GitHub",
    "Mon LinkedIn": "Mein LinkedIn",
    "À Propos de moi": "Über Mich",
    "Me Contacter": "Mich Kontaktieren",
    "Une question, un projet ou besoin d'assistance ? N'hésitez pas à me contacter via le formulaire dédié. Je vous répondrai très rapidement.": "Eine Frage, ein Projekt oder benötigen Sie Hilfe? Zögern Sie nicht, mich über das spezielle Formular zu kontaktieren. Ich werde sehr schnell antworten.",
    "Grafana": "Grafana",
    "Prometheus": "Prometheus",
    "n8n": "n8n",
    "Jellyfin": "Jellyfin",
    "Proxmox": "Proxmox",
    "Virtualisation de mes serveurs et gestion de l'infrastructure.": "Virtualisierung meiner Server und Infrastrukturverwaltung."
};

const fs = require('fs');

function mergeDict(filename, newEntries) {
    let content = fs.readFileSync(filename, 'utf8');
    const dictRegex = /const frTo[A-Za-z]+ = \{([\s\S]*?)\};/;
    const match = content.match(dictRegex);
    
    let innerContent = match[1].trim();
    if (innerContent.endsWith(',')) innerContent = innerContent.slice(0, -1);
    
    let newStr = "";
    for (const [k, v] of Object.entries(newEntries)) {
        let keyEscaped = k.replace(/"/g, '\\"');
        let valEscaped = v.replace(/"/g, '\\"');
        newStr += `,\n    "${keyEscaped}": "${valEscaped}"`;
    }
    
    content = content.replace(dictRegex, `const ${filename.includes('en') ? 'frToEn' : 'frToDe'} = {\n    ${innerContent}${newStr}\n};`);
    fs.writeFileSync(filename, content);
    console.log('Updated', filename);
}

mergeDict('public/media/locales/en.js', missingTextsEn);
mergeDict('public/media/locales/de.js', missingTextsDe);
