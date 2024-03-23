const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Your Sequelize instance

const User = sequelize.define(
	"user",
	{
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
			unique: true,
		},
		userName: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		roleId: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		tableName: "users",
		timestamps: false,
	}
);

module.exports = User;
