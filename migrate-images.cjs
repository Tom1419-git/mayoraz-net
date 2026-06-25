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
        let modified = false;

        // Calculate relative path to assets
        const depth = filePath.split(path.sep).length - 3; // src/pages/index.astro -> 0, src/pages/contact/index.astro -> 1
        const assetPrefix = depth === 0 ? '../assets/img/' : '../../assets/img/';

        // Add imports if needed
        if (content.includes('portrait.webp') || content.includes('pc-setup1.webp')) {
            if (!content.includes('astro:assets')) {
                content = content.replace('---', `---
import { Image } from 'astro:assets';`);
            }
            if (content.includes('portrait.webp') && !content.includes('portraitImg')) {
                content = content.replace('import { Image }', `import { Image } from 'astro:assets';\nimport portraitImg from '${assetPrefix}portrait.webp';`);
            }
            if (content.includes('pc-setup1.webp') && !content.includes('setup1Img')) {
                content = content.replace('import { Image }', `import { Image } from 'astro:assets';\nimport setup1Img from '${assetPrefix}builds-pc/pc-setup1.webp';\nimport setup2Img from '${assetPrefix}builds-pc/pc-setup2.webp';\nimport setup3Img from '${assetPrefix}builds-pc/pc-setup3.webp';`);
            }
        }

        // Replace portrait
        if (content.includes('<img src="/media/img/portrait.webp"')) {
            content = content.replace(
                /<img src="\/media\/img\/portrait\.webp"([^>]*)>/g,
                '<Image src={portraitImg}$1 />'
            );
            modified = true;
        }

        // Replace pc setups
        if (content.includes('<img src="/media/img/builds-pc/pc-setup1.webp"')) {
            content = content.replace(/<img src="\/media\/img\/builds-pc\/pc-setup1\.webp"([^>]*)>/g, '<Image src={setup1Img}$1 />');
            content = content.replace(/<img src="\/media\/img\/builds-pc\/pc-setup2\.webp"([^>]*)>/g, '<Image src={setup2Img}$1 />');
            content = content.replace(/<img src="\/media\/img\/builds-pc\/pc-setup3\.webp"([^>]*)>/g, '<Image src={setup3Img}$1 />');
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log('Optimized images in', filePath);
        }
    }
});
