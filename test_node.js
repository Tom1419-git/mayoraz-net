const fs = require('fs');
try {
    let en = fs.readFileSync('E:\\Perso\\Site_Web\\media\\locales\\en.js', 'utf8');
    en = en.replace('const frToEn = ', '');
    eval('(' + en + ')');
    console.log("EN IS VALID!");
} catch (e) {
    console.log("EN ERROR: " + e.message);
}
try {
    let de = fs.readFileSync('E:\\Perso\\Site_Web\\media\\locales\\de.js', 'utf8');
    de = de.replace('const frToDe = ', '');
    eval('(' + de + ')');
    console.log("DE IS VALID!");
} catch (e) {
    console.log("DE ERROR: " + e.message);
}