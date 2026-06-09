// media/js/terminal.js

document.addEventListener('DOMContentLoaded', () => {
    const terminalHtml = `
        <div id="hacker-terminal">
            <div class="terminal-header">
                <div class="terminal-controls">
                    <div class="term-btn close" id="term-close"></div>
                    <div class="term-btn min"></div>
                    <div class="term-btn max"></div>
                </div>
                <div class="terminal-title">thomas@portfolio:~</div>
                <div></div>
            </div>
            <div class="terminal-body" id="term-body">
                <div class="terminal-output" id="term-output">
<div>Bienvenue dans le terminal système.</div>
<div>Tapez 'help' ou '?' pour voir la liste des commandes.</div>
                </div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt">thomas@portfolio:~$</span>
                    <input type="text" class="terminal-input" id="term-input" autocomplete="off" spellcheck="false" autofocus>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', terminalHtml);

    const term = document.getElementById('hacker-terminal');
    const termInput = document.getElementById('term-input');
    const termOutput = document.getElementById('term-output');
    const termBody = document.getElementById('term-body');
    const termClose = document.getElementById('term-close');

    let isTerminalOpen = false;
    let isCommandRunning = false;

    // Toggle terminal on Shift + F10
    document.addEventListener('keydown', (e) => {
        if (e.shiftKey && e.key === 'F10') {
            e.preventDefault();
            toggleTerminal();
        }
    });

    termClose.addEventListener('click', toggleTerminal);

    function toggleTerminal() {
        isTerminalOpen = !isTerminalOpen;
        if (isTerminalOpen) {
            term.classList.add('show');
            setTimeout(() => termInput.focus(), 100);
        } else {
            term.classList.remove('show');
        }
    }

    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !isCommandRunning) {
            const cmd = termInput.value.trim();
            termInput.value = '';
            processCommand(cmd);
        }
    });

    function printLine(text, isHtml = false) {
        const div = document.createElement('div');
        if (isHtml) div.innerHTML = text;
        else div.textContent = text;
        termOutput.appendChild(div);
        termBody.scrollTop = termBody.scrollHeight;
    }

    async function processCommand(cmd) {
        printLine(`thomas@portfolio:~$ ${cmd}`);
        
        if (!cmd) return;

        const args = cmd.split(' ');
        const mainCmd = args[0].toLowerCase();

        switch (mainCmd) {
            case 'help':
            case '?':
                printLine(`Commandes disponibles :`);
                printLine(`  help, ?    - Affiche ce message d'aide`);
                printLine(`  whoami     - Affiche les informations sur l'utilisateur actuel`);
                printLine(`  ping       - Envoie des paquets ICMP à un hôte réseau (ex: ping google.com)`);
                printLine(`  skills     - Liste les compétences techniques`);
                printLine(`  clear      - Efface l'écran du terminal`);
                printLine(`  exit       - Ferme le terminal`);
                break;
            
            case 'whoami':
                printLine(`Nom : Thomas Mayoraz`);
                printLine(`Rôle : Apprenti Informaticien`);
                printLine(`Spécialités : Système, Réseaux, Infrastructure, Support`);
                printLine(`Localisation : ETML, Lausanne, Suisse`);
                break;

            case 'skills':
                printLine(`=> OS : Windows Server, Linux (Debian, Ubuntu), macOS`);
                printLine(`=> Réseau : Cisco, Routage, Switching, VLAN, VPN`);
                printLine(`=> Virtualisation : VMware, Hyper-V, Proxmox`);
                printLine(`=> Scripting : PowerShell, Bash, Python`);
                printLine(`=> Web : HTML, CSS, JS, C#`);
                break;

            case 'clear':
                termOutput.innerHTML = '';
                break;

            case 'exit':
                toggleTerminal();
                break;

            case 'ping':
                const target = args[1] || 'google.com';
                await simulatePing(target);
                break;

            default:
                printLine(`bash: ${mainCmd}: commande introuvable`);
                break;
        }
    }

    // Ping simulation
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function simulatePing(target) {
        isCommandRunning = true;
        termInput.disabled = true;

        // Fake IP generation based on target
        let ip = "142.250.179." + (Math.floor(Math.random() * 200) + 10);
        if (target.includes("mayoraz-net")) ip = "194.163.155.101";
        
        printLine(`Envoi d'une requête 'ping' sur ${target} [${ip}] avec 32 octets de données :`);
        await sleep(500);

        let times = [];
        for (let i = 0; i < 4; i++) {
            const time = 10 + Math.floor(Math.random() * 15);
            times.push(time);
            printLine(`Réponse de ${ip} : octets=32 temps=${time} ms TTL=117`);
            await sleep(1000);
        }

        const min = Math.min(...times);
        const max = Math.max(...times);
        const avg = Math.round(times.reduce((a, b) => a + b) / 4);

        printLine(``);
        printLine(`Statistiques Ping pour ${ip}:`);
        printLine(`    Paquets : envoyés = 4, reçus = 4, perdus = 0 (perte 0%),`);
        printLine(`Durée approximative des boucles en millisecondes :`);
        printLine(`    Minimum = ${min}ms, Maximum = ${max}ms, Moyenne = ${avg}ms`);

        isCommandRunning = false;
        termInput.disabled = false;
        termInput.focus();
    }
});
