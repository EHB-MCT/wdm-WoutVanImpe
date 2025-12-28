const path = require("path");

module.exports = {
	development: {
		client: "pg",
		connection: {
			host: process.env.DATABASE_HOST,
			port: process.env.DATABASE_PORT,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: process.env.DATABASE_DB,
		},
		migrations: {
			directory: path.join(__dirname, "migrations"),
		},
	},
};
