const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('src/pages', (filePath) => {
    if (filePath.endsWith('.astro')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix scripts
        content = content.replace(/<script>/g, '<script is:inline>');
        content = content.replace(/<script type="application\/ld\+json">/g, '<script type="application/ld+json" is:inline>');
        
        // Fix pre tags
        content = content.replace(/<pre>/g, '<pre is:raw>');
        
        // Fix inline styles that might have { }
        // The error was specifically in a pre tag for tutoriels
        
        fs.writeFileSync(filePath, content);
        console.log('Fixed', filePath);
    }
});
