// Load initial data
chrome.storage.local.get(["requiredTasks", "allowedUrls", "completed", "total", "settingsLockedUntil"],
    ({ requiredTasks, allowedUrls, completed, total, settingsLockedUntil }) => {

        document.getElementById("completed").innerText = completed || 0;
        document.getElementById("total").innerText = total || 0;

        document.getElementById("required-input").value = requiredTasks || "";

        renderAllowedList(allowedUrls || []);
        checkLockStatus(settingsLockedUntil);
    }
);


// Save required tasks
document.getElementById("save-required").addEventListener("click", () => {
    const value = parseInt(document.getElementById("required-input").value);

    if (!value || value < 1) {
        alert("Please enter a valid number.");
        return;
    }

    const lockTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now

    chrome.storage.local.set({ 
        requiredTasks: value,
        settingsLockedUntil: lockTime
    }, () => {
        alert("Required tasks saved! Settings are now locked for 24 hours.");
        checkLockStatus(lockTime);
    });
});

function checkLockStatus(lockedUntil) {
    const input = document.getElementById("required-input");
    const btn = document.getElementById("save-required");
    const msg = document.getElementById("lock-msg");

    if (lockedUntil && Date.now() < lockedUntil) {
        // Locked
        input.disabled = true;
        btn.disabled = true;
        btn.style.opacity = "0.6";
        btn.style.cursor = "not-allowed";
        
        const remainingHours = Math.ceil((lockedUntil - Date.now()) / (1000 * 60 * 60));
        msg.innerText = `🔒 Settings locked. You can change this again in ~${remainingHours} hours.`;
        msg.style.display = "block";
    } else {
        // Unlocked
        input.disabled = false;
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        msg.style.display = "none";
    }
}


// Add new URL
document.getElementById("add-url").addEventListener("click", () => {
    const url = document.getElementById("url-input").value.trim();
    if (!url) return;

    chrome.storage.local.get(["allowedUrls"], ({ allowedUrls }) => {
        const updated = allowedUrls ? [...allowedUrls, url] : [url];

        chrome.storage.local.set({ allowedUrls: updated }, () => {
            renderAllowedList(updated);
            document.getElementById("url-input").value = "";
        });
    });
});


// Render URL list
function renderAllowedList(urls) {
    const list = document.getElementById("allowed-list");
    list.innerHTML = "";

    urls.forEach((url, index) => {
        const li = document.createElement("li");
        li.className = "hx-list-item";

        li.innerHTML = `
            <span>${url}</span>
            <button data-index="${index}" 
                    class="hx-btn-danger">
                Delete
            </button>
        `;

        list.appendChild(li);
    });

    // delete listeners
    document.querySelectorAll("button[data-index]").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = e.target.getAttribute("data-index");

            chrome.storage.local.get(["allowedUrls"], ({ allowedUrls }) => {
                allowedUrls.splice(idx, 1);
                chrome.storage.local.set({ allowedUrls }, () => {
                    renderAllowedList(allowedUrls);
                });
            });
        });
    });
}
