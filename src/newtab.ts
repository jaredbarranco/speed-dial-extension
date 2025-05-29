const folderHistory: string[] = [];

function createBookmarkCard(bookmark: chrome.bookmarks.BookmarkTreeNode): HTMLElement {
	const card = document.createElement("div");
	card.className = "bookmark";

	const icon = document.createElement("div");
	icon.className = "bookmark-icon";
	icon.textContent = bookmark.url ? "🌐" : "📁";

	const title = document.createElement("div");
	title.className = "bookmark-title";
	title.textContent = bookmark.title || (bookmark.url ?? "Untitled");

	card.appendChild(icon);
	card.appendChild(title);

	if (bookmark.url) {
		card.addEventListener("click", () => {
			window.location.href = bookmark.url!;
		});
	} else {
		card.addEventListener("click", () => {
			folderHistory.push(bookmark.parentId!);
			loadBookmarks(bookmark.id);
		});
	}

	return card;
}


async function loadBookmarks(folderId?: string) {
	const container = document.getElementById("bookmark-container")!;
	container.innerHTML = ""; // Clear current view

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

		// Add Back button if not at root
		if (folderHistory.length > 0) {
			const backButton = document.createElement("button");
			backButton.textContent = "← Back";
			backButton.className = "bookmark";
			backButton.onclick = () => {
				const prevFolderId = folderHistory.pop();
				if (prevFolderId) loadBookmarks(prevFolderId);
			};
			container.appendChild(backButton);
		}

		// Append each bookmark directly to the container
		for (const child of children) {
			const card = createBookmarkCard(child);
			container.appendChild(card);
		}
	});
}
loadBookmarks();
// Dark mode toggle logic
const toggleButton = document.getElementById("theme-toggle");

function applyThemeFromStorage() {
	const mode = localStorage.getItem("theme") || "light";
	document.body.classList.toggle("dark-mode", mode === "dark");
	if (toggleButton) {
		toggleButton.textContent = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
	}
}

toggleButton?.addEventListener("click", () => {
	const root = document.documentElement;
	const isDark = root.classList.toggle("dark-mode");
	localStorage.setItem("theme", isDark ? "dark" : "light");
});

applyThemeFromStorage();
