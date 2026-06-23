var fs = new ActiveXObject("Scripting.FileSystemObject");
try {
    eval(fs.OpenTextFile("E:\\Perso\\Site_Web\\media\\locales\\en.js", 1, false, -1).ReadAll());
    eval(fs.OpenTextFile("E:\\Perso\\Site_Web\\media\\locales\\de.js", 1, false, -1).ReadAll());
    WScript.Echo("Both valid");
} catch(e) {
    WScript.Echo("Error: " + e.message);
}