async function checkHomelabStatus() {
    const textEl = document.getElementById('status-text');
    const indicatorEl = document.getElementById('status-indicator');
    
    if (!textEl || !indicatorEl) return;

    try {
        const res = await fetch('https://status.mayoraz-net.ch/api/status-page/default');
        const data = await res.json();
        
        let allUp = true;
        
        if (data.publicGroupList) {
            for (const group of data.publicGroupList) {
                for (const monitor of group.monitorList) {
                    if (monitor.status !== 1 && monitor.status !== 3) { 
                        allUp = false;
                        break;
                    }
                }
            }
        }

        if (allUp) {
            textEl.textContent = (window.t ? window.t('100% Opérationnel') : '100% Opérationnel');
            indicatorEl.style.backgroundColor = '#10B981';
            indicatorEl.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6)';
            indicatorEl.style.animation = 'pulse-green 2s infinite';
        } else {
            textEl.textContent = (window.t ? window.t('Systèmes Dégradés') : 'Systèmes Dégradés');
            indicatorEl.style.backgroundColor = '#EF4444';
            indicatorEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.6)';
            indicatorEl.style.animation = 'pulse-red 2s infinite';
        }
    } catch (e) {
        console.error("Impossible de récupérer le statut du serveur", e);
        textEl.textContent = (window.t ? window.t('Statut Inconnu') : 'Statut Inconnu');
        indicatorEl.style.backgroundColor = '#6B7280';
        indicatorEl.style.animation = 'none';
    }
}

checkHomelabStatus();
document.addEventListener('astro:page-load', checkHomelabStatus);
