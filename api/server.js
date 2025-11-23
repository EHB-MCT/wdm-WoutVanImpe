const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const knexConfig = require("./knexfile");
const db = require("knex")(knexConfig.development);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.API_PORT;
const JWT_SECRET = process.env.API_JWT_SECRET;

// ==========================================
// AUTH ROUTES
// ==========================================

app.post("/api/register", async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.status(400).json({ error: "Vul alle velden in." });
	}

	try {
		const existingUser = await db("users").where({ email }).orWhere({ username }).first();
		if (existingUser) {
			return res.status(400).json({ error: "Gebruiker bestaat al." });
		}

		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		const [newUser] = await db("users")
			.insert({
				username,
				email,
				password_hash: passwordHash,
			})
			.returning(["id", "username", "email"]);

		const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: "1h" });

		res.status(201).json({
			message: "Registratie succesvol",
			token,
			user: newUser,
		});
	} catch (error) {
		console.error("Registratie fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het registreren." });
	}
});

app.post("/api/login", async (req, res) => {
	const { email, password, stayLoggedIn } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Vul email en wachtwoord in." });
	}

	try {
		const user = await db("users").where({ email }).first();

		if (!user) {
			return res.status(401).json({ error: "Ongeldige inloggegevens." });
		}

		const validPassword = await bcrypt.compare(password, user.password_hash);

		if (!validPassword) {
			return res.status(401).json({ error: "Ongeldige inloggegevens." });
		}

		const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: stayLoggedIn === true ? "120h" : "1h" });

		res.json({
			message: "Inloggen succesvol",
			token,
			user: { id: user.id, username: user.username, email: user.email },
		});
	} catch (error) {
		console.error("Login fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het inloggen." });
	}
});

// ==========================================
// MIDDLEWARE VOOR PROTECTED ROUTES
// ==========================================

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return res.status(401).json({ error: "Toegang geweigerd" });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ error: "Token ongeldig" });

		req.user = user;
		next();
	});
};

app.listen(PORT, () => {
	console.log(`Server draait op poort ${PORT}`);
});
