// src/newtab.ts
var folderHistory = [];
function createBookmarkCard(bookmark) {
  const card = document.createElement("div");
  card.className = "bookmark";
  const icon = document.createElement("div");
  icon.className = "bookmark-icon";
  const title = document.createElement("div");
  title.className = "bookmark-title";
  let name = bookmark.title || (bookmark.url ?? "Untitled");
  if (bookmark.url) {
    const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F$/gu;
    const emojiMatch = Array.from(name.matchAll(emojiRegex)).pop();
    if (emojiMatch && name.endsWith(emojiMatch[0])) {
      icon.textContent = emojiMatch[0];
      name = name.slice(0, name.lastIndexOf(emojiMatch[0])).trim();
    } else {
      icon.textContent = "\u{1F310}";
    }
  } else {
    icon.textContent = "\u{1F4C1}";
  }
  title.textContent = name;
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
    console.log(JSON.stringify(children));
    children.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    if (!children.length) {
      container.textContent = "This folder is empty.";
      return;
    }
    if (folderHistory.length > 0) {
      const backButton = document.createElement("button");
      backButton.textContent = "\u2190 Back";
      backButton.className = "bookmark";
      backButton.onclick = () => {
        const prevFolderId = folderHistory.pop();
        if (prevFolderId) loadBookmarks(prevFolderId);
      };
      container.appendChild(backButton);
    }
    for (const child of children) {
      const card = createBookmarkCard(child);
      container.appendChild(card);
    }
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
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
applyThemeFromStorage();
