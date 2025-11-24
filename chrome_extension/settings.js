// Load initial data
chrome.storage.local.get(["requiredTasks", "allowedUrls", "completed", "total"],
    ({ requiredTasks, allowedUrls, completed, total }) => {

        document.getElementById("completed").innerText = completed || 0;
        document.getElementById("total").innerText = total || 0;

        document.getElementById("required-input").value = requiredTasks || "";

        renderAllowedList(allowedUrls || []);
    }
);


// Save required tasks
document.getElementById("save-required").addEventListener("click", () => {
    const value = parseInt(document.getElementById("required-input").value);

    if (!value || value < 1) {
        alert("Please enter a valid number.");
        return;
    }

    chrome.storage.local.set({ requiredTasks: value }, () => {
        alert("Required tasks saved!");
    });
});


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
