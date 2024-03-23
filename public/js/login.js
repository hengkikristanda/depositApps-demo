document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("loginForm").addEventListener("submit", function (event) {
		event.preventDefault(); // Prevent the form from submitting the traditional way

		const username = document.getElementById("username").value;
		const password = document.getElementById("password").value;

		console.log("Logging in with:", username, password);

		if (username.toLowerCase() === "admin") {
			window.location.href = "admin";
		} else if (username.toLowerCase() === "client") {
			window.location.href = "client";
		} else {
			alert("Invalid Username/Password");
		}

		// Redirect to the appropriate page

		// Here, you would typically send the username and password to the server
		// For example:
		// fetch("/login", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 	},
		// 	body: JSON.stringify({ username, password }),
		// })
		// 	.then((response) => response.json())
		// 	.then((data) => console.log(data))
		// 	.catch((error) => console.error("Error:", error));
	});
});
