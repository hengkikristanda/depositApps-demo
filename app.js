const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

app.use(express.json());

const HTML_BASE_URL = __dirname + "/src/views";

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/assets"); // Ensure this directory exists
	},
	filename: function (req, file, cb) {
		// You might want to set the filename based on the form input, or include a timestamp
		cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
	const targetUrl = path.join(HTML_BASE_URL, "login.html");
	res.sendFile(targetUrl);
});

app.get("/client", (req, res) => {
	const targetUrl = path.join(HTML_BASE_URL, "client_home.html");
	res.sendFile(targetUrl);
});

app.get("/settings", (req, res) => {
	const targetUrl = path.join(HTML_BASE_URL, "settings.html");
	res.sendFile(targetUrl);
});

app.get("/admin", (req, res) => {
	const targetUrl = path.join(HTML_BASE_URL, "admin_home.html");
	res.sendFile(targetUrl);
});

app.get("/listDeposits", (req, res) => {
	const assetsDir = path.join(__dirname, "public", "assets");
	fs.readdir(assetsDir, (err, files) => {
		if (err) {
			console.log("Error reading the directory:", err);
			return res.status(500).json({ message: "Failed to read submissions directory" });
		}

		// Filter JSON files and sort by modification time, newest first
		let depositFiles = files.filter((file) => file.endsWith(".json"));
		depositFiles.sort((a, b) => {
			const statA = fs.statSync(path.join(assetsDir, a)).mtime;
			const statB = fs.statSync(path.join(assetsDir, b)).mtime;
			return statB - statA; // Sort by newest first
		});

		// Optionally, read and send file contents
		const deposits = depositFiles.map((file) => {
			const filePath = path.join(assetsDir, file);
			return JSON.parse(fs.readFileSync(filePath, "utf8"));
		});

		res.json(deposits);
	});
});

app.post("/saveDeposit", upload.single("depositReceipt"), (req, res) => {
	// Excluding the file, save the rest of the form data as JSON
	const timestamp = Date.now();
	// const filename = `deposit-${timestamp}.json`;
	const filename = `${req.file.filename}.json`;
	const filepath = path.join(__dirname, "public/assets/", filename);

	const formData = {
		id: filename,
		...req.body,
		submittedAt: new Date(timestamp).toISOString(),
		depositStatus: "Pending",
		fileName: req.file.filename,
	};
	const jsonData = JSON.stringify(formData);

	// You might want to include a unique identifier in the filename

	fs.writeFile(filepath, jsonData, (err) => {
		if (err) {
			console.error("Failed to save form data as JSON:", err);
			return res.status(500).json({ message: "Failed to save deposit information" });
		} else {
			console.log("OK");
		}

		const settingsPath = path.join(__dirname, "public", "assets", "data", "settings.json");
		fs.readFile(settingsPath, "utf8", (err, settingsData) => {
			if (err) {
				console.error("Error reading settings for email:", err);
				return;
			}

			const { email } = JSON.parse(settingsData);
			if (email) {
				// Set up transporter
				let transporter = nodemailer.createTransport({
					host: "mail.soliditi.tech",
					port: 465,
					secure: true,
					auth: {
						user: "noreply@soliditi.tech",
						pass: "2KLx]c$n@ZaM",
					},
				});

				let mailOptions = {
					from: `New Deposit Request <noreply@soliditi.tech>`,
					to: email, // Loaded from settings.json
					subject: "New Deposit Submission",
					text: "A new deposit has been submitted. Please check the administration panel.", // or HTML body
				};

				transporter.sendMail(mailOptions, (error, info) => {
					if (error) {
						return console.log("Error sending mail:", error);
					}
					console.log("Message sent: %s", info.messageId);
				});
			}
		});

		res.json({ message: "Deposit information saved successfully", file: req.file });
	});
});
/* app.post("/saveDeposit", (req, res) => {
	const data = req.body;
	const filename = `deposit-${Date.now()}.json`;
	const filepath = path.join(__dirname, "public", "assets", filename);

	console.log(data);

	fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
		if (err) {
			console.error("Error writing file:", err);
			return res.status(500).send({ message: "Error saving deposit information" });
		}
		res.send({ message: "Deposit information saved successfully" });
	});
}); */

app.post("/api/approveDeposit", (req, res) => {
	const { id } = req.body; // The ID of the deposit to approve
	const filepath = path.join(__dirname, "public/assets", `${id}`);

	fs.readFile(filepath, (err, data) => {
		if (err) {
			console.error("Error reading file:", err);
			return res.status(500).send({ message: "Error finding deposit information" });
		}
		const depositInfo = JSON.parse(data);
		depositInfo.depositStatus = "Approved"; // Update status

		fs.writeFile(filepath, JSON.stringify(depositInfo, null, 2), (err) => {
			if (err) {
				console.error("Error writing file:", err);
				return res.status(500).send({ message: "Error updating deposit status" });
			}
			res.json({ message: "Deposit status updated to Approved", id });
		});
	});
});

app.post("/api/saveSettings", (req, res) => {
	const { email } = req.body;
	if (!email) {
		return res.status(400).send({ message: "Email is required" });
	}

	const settings = { email };
	const filePath = path.join(__dirname, "public", "assets", "data", "settings.json");

	fs.writeFile(filePath, JSON.stringify(settings, null, 2), (err) => {
		if (err) {
			console.error("Error writing file:", err);
			return res.status(500).send({ message: "Error saving settings" });
		}
		res.send({ message: "Settings saved successfully" });
	});
});

app.get("/api/getSettings", (req, res) => {
	const filePath = path.join(__dirname, "public", "assets", "data", "settings.json");

	fs.readFile(filePath, (err, data) => {
		if (err) {
			// Handle the case where the file might not exist yet
			if (err.code === "ENOENT") {
				return res.json({ email: "" }); // No settings found, return default
			}
			console.error("Error reading file:", err);
			return res.status(500).send({ message: "Error fetching settings" });
		}
		res.json(JSON.parse(data));
	});
});

app.listen(port, () => {
	console.log(`App listening at http://localhost:${port}`);
});
