var fs = new ActiveXObject("Scripting.FileSystemObject");
try {
    var enTxt = fs.OpenTextFile("E:\\Perso\\Site_Web\\media\\locales\\en.js", 1, false, -1).ReadAll().replace('const frToEn = ', '');
    // WScript.Echo(enTxt.substring(enTxt.length - 100));
    eval("(" + enTxt + ")");
    WScript.Echo("EN OK");
} catch(e) {
    WScript.Echo("EN ERROR: " + e.message);
}