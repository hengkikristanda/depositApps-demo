document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("logoutButton").addEventListener("click", function (event) {
		event.preventDefault();
		// Here, you would clear the user's session or token
		console.log("User logged out.");

		// Redirect to the login page
		window.location.href = "/";
	});

	document.getElementById("depositForm").addEventListener("submit", function (event) {
		event.preventDefault();
		const formData = new FormData(document.getElementById("depositForm"));

		fetch("/saveDeposit", {
			method: "POST",
			body: formData, // Sending the FormData object directly
		})
			.then((response) => response.json())
			.then((data) => {
				console.log("Success:", data);
				alert("Deposit submitted successfully!");
			})
			.catch((error) => {
				console.error("Error:", error);
				alert("An error occurred while submitting your deposit.");
			})
			.finally(() => {
				window.location.href = "/client";
			});
	});
});
