$replacements = [ordered]@{
    "Ã©" = "é"
    "Ã¨" = "è"
    ("Ã" + [char]0x00A0) = "à"
    "Ã¢" = "â"
    "Ãª" = "ê"
    "Ã®" = "î"
    "Ã´" = "ô"
    "Ã§" = "ç"
    "Ã€" = "À"
    "Ã‰" = "É"
    "â€™" = "'"
    "â€“" = "-"
    "Ã¯" = "ï"
    "Ã¼" = "ü"
    "Ã»" = "û"
    "Ã " = "à"
}

$files = Get-ChildItem -Recurse -Filter *.html | Where-Object { $_.FullName -notmatch "ctt_montriond" }
$utf8NoBom = New-Object System.Text.UTF8Encoding $False

foreach ($f in $files) {
    $c = [System.IO.File]::ReadAllText($f.FullName, $utf8NoBom)
    foreach ($key in $replacements.Keys) {
        $c = $c.Replace($key, $replacements[$key])
    }
    [System.IO.File]::WriteAllText($f.FullName, $c, $utf8NoBom)
}
