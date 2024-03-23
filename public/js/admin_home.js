document.addEventListener("DOMContentLoaded", function () {
	fetch("/listDeposits")
		.then((response) => response.json())
		.then((deposits) => {
			const tableBody = document.getElementById("depositsTable").querySelector("tbody");
			deposits.forEach((deposit, index) => {
				const row = document.createElement("tr");
				row.classList.add("clickable-row");
				if (deposit.depositStatus === "Pending") {
					row.classList.add("bg-warning");
					row.classList.add("font-weight-bold");
				}
				row.innerHTML = `
                    <th scope="row"><u>${index + 1}</u></th>
                    <td><u>${deposit.userName}</u></td>
                    <td><u>${deposit.accountNumber}</u></td>
                    <td><u>${deposit.nominalDeposit}</u></td>
					<td><u>${deposit.depositStatus}</u></td>
                    <td><u>${new Date(deposit.submittedAt).toLocaleString()}</u></td>
                `;

				row.setAttribute("data-toggle", "modal");
				row.setAttribute("data-target", "#depositDetailModal");
				row.onclick = () => showDepositDetails(deposit); // Add click event
				tableBody.appendChild(row);
			});
		})
		.catch((error) => console.error("Error fetching deposit data:", error));

	function showDepositDetails(submission) {
		const modalDepositDetails = document.getElementById("modalDepositDetails");
		// Assuming `submission` includes all necessary information, including the image URL
		modalDepositDetails.innerHTML = `
				<p>Name: ${submission.userName}</p>
				<p>Account Number: ${submission.accountNumber}</p>
				<p>Nominal Deposit: ${submission.nominalDeposit}</p>
				<p>Submitted At: ${submission.submittedAt}</p>
				<p>Deposit Status: ${submission.depositStatus}</p>
				<img src="/assets/${submission.fileName}" alt="Deposit Receipt" class="img-fluid"/> <!-- Display the image -->
			`;
		$("#depositDetailModal").modal("show"); // Use jQuery to show the modal

		approveButton.onclick = () => {
			fetch("/api/approveDeposit", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: submission.id }), // Assuming each submission has a unique ID
			})
				.then((response) => response.json())
				.then((data) => {
					alert("Successfully Approve the Deposit Request");
					// document.getElementById("depositStatus").textContent = "Approved"; // Update the status in the modal
					$("#depositDetailModal").modal("hide"); // Hide the modal
					// Optionally, refresh the submissions list to reflect the status change
					window.location.href = "/admin";
				})
				.catch((error) => {
					alert("Failed to approve! Please try again later");
					console.error("Error:", error);
					window.location.href = "/admin";
				});
		};
	}
});
