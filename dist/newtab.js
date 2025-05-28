// src/newtab.ts
var folderHistory = [];
function createBookmarkCard(bookmark) {
  const card = document.createElement("div");
  card.className = "bookmark-card";
  const icon = document.createElement("div");
  icon.className = "bookmark-icon";
  icon.textContent = bookmark.url ? "\u{1F310}" : "\u{1F4C1}";
  const title = document.createElement("div");
  title.className = "bookmark-title";
  title.textContent = bookmark.title || (bookmark.url ?? "Untitled");
  card.appendChild(icon);
  card.appendChild(title);
  if (bookmark.url) {
    card.addEventListener("click", () => {
      window.location.href = bookmark.url;
    });
  } else {
    card.addEventListener("click", () => {
      folderHistory.push(bookmark.parentId);
      loadBookmarks(bookmark.id);
    });
  }
  return card;
}
async function loadBookmarks(folderId) {
  const container = document.getElementById("bookmark-container");
  container.innerHTML = "";
  const currentFolderId = folderId || (await chrome.storage.sync.get("selectedFolderId")).selectedFolderId;
  if (!currentFolderId) {
    container.textContent = "No folder selected. Visit the extension options to configure.";
    return;
  }
  chrome.bookmarks.getChildren(currentFolderId, (children) => {
    if (!children.length) {
      container.textContent = "This folder is empty.";
      return;
    }
    if (folderHistory.length > 0) {
      const backButton = document.createElement("button");
      backButton.textContent = "\u2190 Back";
      backButton.className = "bookmark-card";
      backButton.onclick = () => {
        const prevFolderId = folderHistory.pop();
        if (prevFolderId) loadBookmarks(prevFolderId);
      };
      container.appendChild(backButton);
    }
    const grid = document.createElement("div");
    grid.className = "bookmark-grid";
    for (const child of children) {
      const card = createBookmarkCard(child);
      grid.appendChild(card);
    }
    container.appendChild(grid);
  });
}
loadBookmarks();
var toggleButton = document.getElementById("theme-toggle");
function applyThemeFromStorage() {
  const mode = localStorage.getItem("theme") || "light";
  document.body.classList.toggle("dark-mode", mode === "dark");
  if (toggleButton) {
    toggleButton.textContent = mode === "dark" ? "\u2600\uFE0F Light Mode" : "\u{1F319} Dark Mode";
  }
}
toggleButton?.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  if (toggleButton) {
    toggleButton.textContent = isDark ? "\u2600\uFE0F Light Mode" : "\u{1F319} Dark Mode";
  }
});
applyThemeFromStorage();
