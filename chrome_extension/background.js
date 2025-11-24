let completed = 0;
let total = 0;
let allowedUrls = [];
let requiredTasks = null;

// Initialize state from storage
chrome.storage.local.get(
  ["completed", "total", "allowedUrls", "requiredTasks"],
  (data) => {
    completed = data.completed ?? 0;
    total = data.total ?? 0;
    allowedUrls = data.allowedUrls || [];
    requiredTasks = data.requiredTasks ?? null;

    chrome.storage.local.set({
      completed,
      total,
      allowedUrls,
      requiredTasks
    });
  }
);

// Keep in sync when other scripts update storage
chrome.storage.onChanged.addListener((changes) => {
  if (changes.completed) completed = changes.completed.newValue ?? 0;
  if (changes.total) total = changes.total.newValue ?? 0;
  if (changes.allowedUrls) allowedUrls = changes.allowedUrls.newValue || [];
  if (changes.requiredTasks) requiredTasks = changes.requiredTasks.newValue ?? null;
});

// Helper: normalize hostname
function cleanHost(rawUrl) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
  } catch {
    return "";
  }
}

// Main blocking logic
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = details.url;

  // Only http/https
  if (!url.startsWith("http://") && !url.startsWith("https://")) return;

  const hostname = cleanHost(url);

  // Always allow HabitX site
  if (hostname === "habit-builder-rho.vercel.app") return;

  // If no tasks known yet, don't block
  if (total === 0) return;

  // Check allowed URLs
  const isAllowed = allowedUrls.some((item) => {
    const allowedHost = cleanHost(item);
    if (!allowedHost) return false;
    return hostname === allowedHost || hostname.endsWith("." + allowedHost);
  });

  if (isAllowed) return;

  // Determine required tasks: user-set or fallback to all
  const needed = requiredTasks && requiredTasks > 0 ? requiredTasks : total;

  // If not enough tasks done, redirect to blocker page
  if (completed < needed) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("blocker.html")
    });
  }
});
