(() => {
	try {
		const userPref = localStorage.getItem("theme");
		const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

		if (userPref === "dark" || (!userPref && systemPrefersDark)) {
			document.documentElement.classList.add("dark-mode");
		} else {
			document.documentElement.classList.remove("dark-mode");
		}
	} catch (e) {
		console.error("Theme loader error:", e);
	}

	// Ensure the page becomes visible
	document.documentElement.style.visibility = "visible";
})();

