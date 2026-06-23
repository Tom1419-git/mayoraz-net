var fs = new ActiveXObject("Scripting.FileSystemObject");
var frToEn = eval("(" + fs.OpenTextFile("E:\\Perso\\Site_Web\\media\\locales\\en.js", 1).ReadAll().replace('const frToEn = ', '') + ")");
WScript.Echo("EN OK");
var frToDe = eval("(" + fs.OpenTextFile("E:\\Perso\\Site_Web\\media\\locales\\de.js", 1).ReadAll().replace('const frToDe = ', '') + ")");
WScript.Echo("DE OK");