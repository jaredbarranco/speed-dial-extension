(function() {
	try {
		const userPref = localStorage.getItem("theme");
		const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

		if (userPref === "dark" || (!userPref && systemPrefersDark)) {
			document.documentElement.classList.add("dark-mode");
		} else {
			document.documentElement.classList.remove("dark-mode");
		}
	} catch (e) {
		console.error("Theme preload error:", e);
	}

	document.documentElement.style.visibility = "visible";
})();
