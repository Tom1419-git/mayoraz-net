<#
.NOTES 
    *****************************************************************************
    ETML
    Nom du script:  122-Script_projet_InfoLogger.ps1
    Auteur: Thomas Mayoraz, Ervan Lemqadem
    Date:   24.03.2025
    *****************************************************************************
    Modifications
    Date  : 24.03.2025
    Auteur: Thomas Mayoraz
    Raisons: Ajout de la première partie du script qui récolte les informations de la machine locale.
    *****************************************************************************
    Date  : 31.03.2025
    Auteur: Thomas Mayoraz
    Raisons: Ajout des dernières informations manquantes et de la capacité au script de mettre les informations récoltées dans un fichier .log
    *****************************************************************************
    Date  : 31.03.2025
    Auteur: Ervan Lemqadem
    Raisons: Correction de certaines commandes car elles n'étaient pas en format CIM
    *****************************************************************************
    Date  : 11.04.2025
    Auteur: Ervan Lemqadem
    Raisons: Poursuite des corrections CIM
    *****************************************************************************
    Date  : 02.05.2025
    Auteur: Thomas Mayoraz
    Raisons: Ajout de la collecte distante via PSRemoting et automatisation complète par paramètres
    *****************************************************************************
    Date:02.05.2025
    Auteur:Thomas Mayoraz
    Raisons:Incrémentation du script pour outrepasser la boite de dialogue d'authentification fourni par Lemqadem
    *****************************************************************************
    Date:09.05.2025
    Auteur:Mayoraz
    Raisons: incrémentation
    *****************************************************************************
    Date:09.05.2025
    Auteur:Ervan Lemqadem & Thomas Mayoraz
    Raisons: optimisation du script pour être en adéquation au maximum avec le cahier des charges - ajout commentaires
    *****************************************************************************
    Date:16.05.2025
    Auteur: Thomas Mayoraz
    Raisons: Correction des remarques effectués par Monsieur Bertrand Sahli lors de l'évaluation des 80% - ajout commentaires, scriptBlock pour la partie locale également et mise à jour de l'entête
    *****************************************************************************
    Date:19.05.2025
    Auteur: Thomas Mayoraz
    Raisons: correction du code après que M.Sahli nous aie fait la remaque que notre script sortait peu de programmes installés 
    *****************************************************************************
 
 
   
.SYNOPSIS
    InfoLogger - Script de collecte d'informations système, localement ou à distance
 
.DESCRIPTION
    Ce script permet de récolter et de journaliser les informations système d'une machine locale ou distante (via PowerShell Remoting).
 
.PARAMETER mode
    Mode d'exécution : "1" pour local, "2" pour distant. Si non spécifié, il sera demandé.
 
.PARAMETER ipDistant
    Adresse IP ou nom DNS de la machine distante. Obligatoire si mode = 2.
 
.PARAMETER username
    Nom d'utilisateur pour l'accès distant. Obligatoire si mode = 2.

.PARAMETER chemin

    Chemin dans lequel le fichier .log sera enregisré, si non spécifié le chemin sera l'eplacement dans lequel le script se trouve.
 
.OUTPUTS
    Un fichier .log (local ou distant) contenant les informations collectées.
 
.EXAMPLE
    .\122-Script_projet_InfoLogger.ps1 -mode 1
    Exécute le script en local
 
.EXAMPLE
    .\122-Script_projet_InfoLogger.ps1 -mode 2 -ipDistant 192.168.1.100 -username Admin -chemin C:\Users\Admin\Desktop\

    Puis entrez le mot de passe quand il vous sera demandé par le script dans la console.

    Si vous avez spécifié aucun paramètre ceux-ci vous seront demandés au fil de lexécution du script sauf pour le chemin du fichier .log

    Exécute le script sur la machine distante spécifiée puis pacle le fichier .log dans "C:\Users\Admin\Desktop\"


#>

# Définition des paramètres
 
param (
    [ValidateSet("1", "2")]
    [string]$mode,
    [string]$ipDistant,
    [string]$username,
    [string]$chemin
    
)
 
# Si le mode n’est pas précisé, on le demande
if (-not $mode) {
    $mode = Read-Host "Entrez le mode de connexion (1 = local, 2 = distant)"
}
# Si le chemin n'est pas spécifié, on le défini dans le répertoire du script
if (-not $chemin) {
    $chemin =".\"
}
 
# Si mode = 2, demander les infos manquantes
if ($mode -eq "2") {
    if (-not $ipDistant) {
        $ipDistant = Read-Host "Entrez l'adresse IP ou le nom de la machine distante"
    }
    if (-not $username) {
        $username = Read-Host "Entrez le nom d'utilisateur pour la connexion distante"
    }
    
    # Demande le mot de passe de manière sécurisée (remplacer les caractères entrés par des *) pour la connexion distante
        $securePassword = Read-Host "Entrez le mot de passe pour l'utilisateur distant" -AsSecureString

    
}
 
###################################################################################################################
# Zone de définition des variables communes et du ScriptBlock
$date = Get-Date -Format "dd/MM/yyyy HH:mm:ss"
$ScriptBlock = {
    # Récupération des infos locales
    # Récupération du nom de l'ordinateur
    $NomOrdinateur = $env:COMPUTERNAME
    # Récupération de l'adresse IP
    $AdresseIP = (Get-CimInstance Win32_NetworkAdapterConfiguration | Where-Object IPEnabled).IPAddress | Where-Object {$_ -match '\.'}
    # Récupération de la version du système d'exploitation 
    $VersionOS = (Get-CimInstance Win32_OperatingSystem).Caption + " " + (Get-CimInstance Win32_OperatingSystem).Version
    # Récupération des informatons nécessaires pour les disques
    $EspaceDisque = Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DriveType=3" |
        Select-Object DeviceID,
            @{Name='Total (Go)';Expression={[math]::Round($_.Size / 1GB, 2)}},
            @{Name='Libre (Go)';Expression={[math]::Round($_.FreeSpace / 1GB, 2)}},
            @{Name='Utilisé (Go)';Expression={[math]::Round(($_.Size - $_.FreeSpace) / 1GB, 2)}}
    # Récupération des informations sur la RAM
    $MemoireRAM = Get-CimInstance Win32_ComputerSystem | Select-Object TotalPhysicalMemory
    $MemoireRAM_Go = [math]::Round($MemoireRAM.TotalPhysicalMemory / 1GB, 2)
    # Récupération des applications locales
    $ProgrammesInstalles = Get-CimInstance Win32_InstalledWin32Program | Select-Object Name, Vendor, Version

    # Récupération des informations sur le processeur
    $Processeur = Get-CimInstance Win32_Processor | Select-Object Name, MaxClockSpeed, NumberOfCores
    # Récupération des informations sur les utilisateurs de la machine
    $Users = Get-CimInstance -ClassName Win32_UserAccount | Where-Object { $_.LocalAccount -eq $true } | Select-Object Name, FullName, SID

    return [PSCustomObject]@{
        NomOrdinateur = $NomOrdinateur
        AdresseIP = $AdresseIP
        VersionOS = $VersionOS
        EspaceDisque = $EspaceDisque
        MemoireRAM_Go = $MemoireRAM_Go
        ProgrammesInstalles = $ProgrammesInstalles
        Processeur = $Processeur
        Users = $Users
    }
}
###################################################################################################################
# Partie locale
if ($mode -eq "1") {
    # Définition du fichier .log local
    $LogFile = "$chemin-122-LogFile-LOCAL.log"
    
# Exécute le bloc de script spécifié en local, et stocke le résultat
$resultat = Invoke-Command -ScriptBlock $ScriptBlock
    # Mise en page de ce qui sera affiché
    $logData = @"
----------------------------------------------------
Log date : $date

Nom de l'ordinateur : $($resultat.NomOrdinateur)
Adresse IP : $($resultat.AdresseIP)
Version du Systeme d'Exploitation : $($resultat.VersionOS)
 
Espace Disque :
$($resultat.EspaceDisque | Format-Table -AutoSize | Out-String)
 
Memoire RAM totale : $($resultat.MemoireRAM_Go) Go
 
Liste des programmes installes :
$($resultat.ProgrammesInstalles | Format-Table -AutoSize | Out-String)
 
Informations sur le processeur :
$($resultat.Processeur | Format-Table -AutoSize | Out-String)
 
Utilisateurs :
$($resultat.Users | Format-Table -AutoSize | Out-String)
----------------------------------------------------
"@
    # Affichage des informations récoltées
    Write-Host $logData
    # Création du fichier .log enregistrement des informations dans celui-ci
    $logData | Out-File -Append -Encoding UTF8 $LogFile
    # écriture d'un message de confirmation
    Write-Host "Les informations ont été enregistrées dans $LogFile"
}
 
###################################################################################################################
# Partie distante
elseif ($mode -eq "2") {
    #Définition du fichier .log distant
    $LogFile = "$chemin-122-LogFile-DISTANT.log"
 
    # Création des identifiants à partir des paramètres
    $cred = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

 
    try {
        # Essai de connexion à la machine distante via PS Remoting
        $session = New-PSSession -ComputerName $ipDistant -Credential $cred -Authentication Default -ErrorAction Stop
        # Exécute le bloc de script spécifié à distance via la session PowerShell distante, et stocke le résultat
        $resultat = Invoke-Command -Session $session -ScriptBlock $ScriptBlock
        # Ferme et supprime la session PowerShell distante 
        Remove-PSSession -Session $session
        # Mise en page de ce qui sera affiché
        $logData = @"
----------------------------------------------------
Log date : $date
 
Nom de l'ordinateur : $($resultat.NomOrdinateur)
Adresse IP : $($resultat.AdresseIP)
Version du Systeme d'Exploitation : $($resultat.VersionOS)
 
Espace Disque :
$($resultat.EspaceDisque | Format-Table -AutoSize | Out-String)
 
Memoire RAM totale : $($resultat.MemoireRAM_Go) Go
 
Liste des programmes installes :
$($resultat.ProgrammesInstalles | Format-Table -AutoSize | Out-String)
 
Informations sur le processeur :
$($resultat.Processeur | Format-Table -AutoSize | Out-String)
 
Utilisateurs :
$($resultat.Users | Format-Table -AutoSize | Out-String)
----------------------------------------------------
"@
        # Affiche les informations dans la console 
        Write-Host $logData
        # Crée le fichier .log avec les informations collectées 
        $logData | Out-File -Append -Encoding UTF8 $LogFile
        # Affiche un messae de confirmation 
        Write-Host "Les informations de la machine distante ont été enregistrées dans $LogFile"
    }
    # Si la connection distante échoue se message s'affiche
    catch {
        Write-Error "Erreur lors de la connexion distante : $_"
    }
    # Fin du script
}