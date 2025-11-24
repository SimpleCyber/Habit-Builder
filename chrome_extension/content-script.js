function getTaskStats() {
    const tasks = document.querySelectorAll(".task-card");
    if (!tasks || tasks.length === 0) return;

    let completed = 0;
    let total = tasks.length;

    tasks.forEach(task => {
        const flame = task.querySelector(".lucide-flame");
        if (flame && flame.classList.contains("fill-orange-500")) {
            completed++;
        }
    });

    chrome.runtime.sendMessage({
        type: "TASK_UPDATE",
        completed,
        total
    });

    chrome.storage.local.set({ completed, total });
}


// Mutation observer (reactive updates)
const observer = new MutationObserver(() => getTaskStats());
observer.observe(document.body, { childList: true, subtree: true });


// Fast poll (fallback)
setInterval(getTaskStats, 300);

// Trigger on tab focus
window.addEventListener("focus", getTaskStats);

// Trigger when visible again
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) getTaskStats();
});

// Lazy load scenarios
window.addEventListener("scroll", getTaskStats);

// Boot-up repeated sync
setTimeout(getTaskStats, 500);
setTimeout(getTaskStats, 1500);
setTimeout(getTaskStats, 3000);
