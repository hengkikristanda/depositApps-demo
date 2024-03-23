const { Sequelize } = require("sequelize");
const { config } = require("dotenv");

config();

// Database connection configuration
const sequelize = new Sequelize(
	process.env.DB_DATABASE,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: "mysql",
	}
);

// Test the database connection
async function testConnection() {
	try {
		await sequelize.authenticate();
		console.log("Database connection successful");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
}

testConnection(); // Test the connection when the file is loaded

module.exports = sequelize; // Export the configured Sequelize instance
