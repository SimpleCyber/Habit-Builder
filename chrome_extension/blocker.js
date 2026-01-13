  chrome.storage.local.get(["completed", "total"], ({ completed, total }) => {
    const c = completed ?? 0;
    const t = total ?? 0;
    document.getElementById("hx-progress-text").textContent = `${c} / ${t}`;
  });

  // Apply Theme
chrome.storage.local.get("theme", ({ theme }) => {
  if (theme === 'dark') {
      document.body.classList.add('dark-mode');
  }
});

function openOrFocus(url) {
  chrome.tabs.query({ url: url + "*" }, (tabs) => {
    // Exact match or simple pattern match
    // For extension pages, we might need strict equality or check content
    const existing = tabs.find(t => t.url.startsWith(url) || t.url === url);
    if (existing && existing.id) {
      chrome.tabs.update(existing.id, { active: true });
      chrome.windows.update(existing.windowId, { focused: true });
    } else {
      chrome.tabs.create({ url });
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hx-open-habitx").addEventListener("click", () => {
    // For HabitX, we look for any page on the domain generally, or specific home
    openOrFocus("https://habit-builder-rho.vercel.app/");
  });

  document.getElementById("hx-open-settings").addEventListener("click", () => {
    openOrFocus(chrome.runtime.getURL("settings.html"));
  });
});