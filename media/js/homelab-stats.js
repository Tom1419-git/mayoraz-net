document.addEventListener('DOMContentLoaded', () => {
    const statsContainer = document.querySelector('.live-stats-container');
    if (!statsContainer) return;

    const cpuVal = document.getElementById('stat-cpu-val');
    const cpuBar = document.getElementById('stat-cpu-bar');
    const ramVal = document.getElementById('stat-ram-val');
    const ramBar = document.getElementById('stat-ram-bar');
    const diskVal = document.getElementById('stat-disk-val');
    const diskBar = document.getElementById('stat-disk-bar');
    const uptimeVal = document.getElementById('stat-uptime-val');
    const lastUpdate = document.getElementById('stat-last-update');
    const statusDot = document.getElementById('homelab-status-dot');

    // Simulate real data since we don't have an API yet
    let currentCpu = 15;
    let currentRam = 45;
    let currentDisk = 68;

    function getMockData() {
        currentCpu += (Math.random() * 15) - 7;
        if (currentCpu < 2) currentCpu = 2;
        if (currentCpu > 95) currentCpu = 95;

        currentRam += (Math.random() * 2) - 1;
        if (currentRam < 40) currentRam = 40;
        if (currentRam > 80) currentRam = 80;

        return {
            status: 'online',
            cpu: Math.round(currentCpu),
            ram: Math.round(currentRam),
            disk: currentDisk,
            uptime: "45 jours, 12h",
            timestamp: new Date().toLocaleTimeString()
        };
    }

    function updateColor(bar, value) {
        if (value > 85) bar.style.backgroundColor = '#e74c3c';
        else if (value > 65) bar.style.backgroundColor = '#f39c12';
        else bar.style.backgroundColor = 'var(--primary-color)';
    }

    function fetchStats() {
        // En attente d'une vraie API...
        const data = getMockData();

        if (data.status === 'online') {
            statusDot.className = 'status-dot online';
            
            cpuVal.textContent = data.cpu + '%';
            cpuBar.style.width = data.cpu + '%';
            updateColor(cpuBar, data.cpu);

            ramVal.textContent = data.ram + '%';
            ramBar.style.width = data.ram + '%';
            updateColor(ramBar, data.ram);

            diskVal.textContent = data.disk + '%';
            diskBar.style.width = data.disk + '%';
            updateColor(diskBar, data.disk);

            uptimeVal.textContent = data.uptime;
        } else {
            statusDot.className = 'status-dot offline';
        }

        lastUpdate.textContent = data.timestamp;
    }

    fetchStats();
    setInterval(fetchStats, 5000);
});