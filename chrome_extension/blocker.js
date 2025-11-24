  chrome.storage.local.get(["completed", "total"], ({ completed, total }) => {
    const c = completed ?? 0;
    const t = total ?? 0;
    document.getElementById("hx-progress-text").textContent = `${c} / ${t}`;
  });

  document.getElementById("hx-open-habitx").addEventListener("click", () => {
    chrome.tabs.create({ url: "https://habit-builder-rho.vercel.app/home" });
  });