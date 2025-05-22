function renderFolderTree(nodes: chrome.bookmarks.BookmarkTreeNode[], container: HTMLElement) {
	for (const node of nodes) {
		if (!node.url) { // it's a folder
			const div = document.createElement("div");
			div.textContent = node.title || "(no title)";
			div.style.cursor = "pointer";
			div.onclick = () => {
				chrome.storage.sync.set({ selectedFolderId: node.id }, () => {
					alert(`Folder "${node.title}" selected!`);
				});
			};
			container.appendChild(div);

			if (node.children && node.children.length > 0) {
				const childContainer = document.createElement("div");
				childContainer.style.marginLeft = "20px";
				renderFolderTree(node.children, childContainer);
				container.appendChild(childContainer);
			}
		}
	}
}

function loadFolders() {
	const container = document.getElementById("folder-list");
	if (!container) return;

	chrome.bookmarks.getTree((nodes) => {
		renderFolderTree(nodes, container);
	});
}

loadFolders();

