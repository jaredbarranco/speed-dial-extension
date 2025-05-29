const folderHistory: string[] = [];

function createBookmarkCard(bookmark: chrome.bookmarks.BookmarkTreeNode): HTMLElement {
	const card = document.createElement("div");
	card.className = "bookmark";

	const icon = document.createElement("div");
	icon.className = "bookmark-icon";

	const title = document.createElement("div");
	title.className = "bookmark-title";

	let name = bookmark.title || (bookmark.url ?? "Untitled");

	if (bookmark.url) {
		// Look for emoji at end of the title
		const emojiRegex = /\p{Emoji_Presentation}|\p{Emoji}\uFE0F$/gu;
		const emojiMatch = Array.from(name.matchAll(emojiRegex)).pop();

		if (emojiMatch && name.endsWith(emojiMatch[0])) {
			icon.textContent = emojiMatch[0];
			name = name.slice(0, name.lastIndexOf(emojiMatch[0])).trim();
		} else {
			icon.textContent = "🌐"; // default web icon
		}
	} else {
		icon.textContent = "📁"; // always folder icon for non-URLs
	}

	title.textContent = name;

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
		// Sort by the 'index' property to maintain user order
		console.log(JSON.stringify(children))
		children.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

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
