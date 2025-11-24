// Open Settings Page
document.getElementById('open-settings').addEventListener('click', () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("settings.html")
    });
});

// Load statistics continuously
function loadStats() {
    chrome.storage.local.get(["completed", "total"], ({ completed, total }) => {
        const c = completed ?? 0;
        const t = total ?? 0;

        document.getElementById("s-completed").innerText = c;
        document.getElementById("s-total").innerText = t;
    });
}

loadStats();
setInterval(loadStats, 500);
