// Apply Theme
chrome.storage.local.get("theme", ({ theme }) => {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    }
});

// Open Settings Page
document.getElementById('open-settings').addEventListener('click', () => {
    const url = chrome.runtime.getURL("settings.html");
    
    chrome.tabs.query({ url: url }, (tabs) => {
        const existing = tabs.find(t => t.url === url);
        if (existing && existing.id) {
            chrome.tabs.update(existing.id, { active: true });
            chrome.windows.update(existing.windowId, { focused: true });
        } else {
            chrome.tabs.create({ url });
        }
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
