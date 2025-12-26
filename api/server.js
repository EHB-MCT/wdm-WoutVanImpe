const express = require("express");
const cors = require("cors");
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

		// Store SHA256 hash directly (password is already hashed from frontend)
		const [newUser] = await db("users")
			.insert({
				username,
				email,
				password_hash: password,
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

		// Direct comparison since both are SHA256 hashes
		const validPassword = password === user.password_hash;

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
		req.token = token;
		next();
	});
};

const refreshTokenIfNeeded = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) return next();

	try {
		// Validate token format first
		const parts = token.split('.');
		if (parts.length !== 3) {
			console.warn('Invalid token format for refresh - not a valid JWT structure');
			return next();
		}

		const decoded = jwt.decode(token);
		
		// Validate decoded payload structure
		if (!decoded || typeof decoded !== 'object' || !decoded.exp || !decoded.userId) {
			console.warn('Invalid token payload for refresh - missing required fields');
			return next();
		}

		const now = Math.floor(Date.now() / 1000);
		const timeUntilExpiration = decoded.exp - now;
		
		// Only refresh if token is still valid but expiring soon
		if (timeUntilExpiration < 900 && timeUntilExpiration > 0) {
			try {
				const newToken = jwt.sign(
					{ userId: decoded.userId, username: decoded.username || 'user' }, 
					JWT_SECRET, 
					{ expiresIn: "1h" }
				);
				
				res.setHeader('X-New-Token', newToken);
				res.setHeader('X-Token-Refresh', 'true');
				console.log('Token automatically refreshed for user:', decoded.userId);
			} catch (signError) {
				console.error('Failed to sign new token:', signError.message);
				// Continue with original token - user will get auth error later if needed
				// This prevents breaking the request flow for signing errors
			}
		} else if (timeUntilExpiration <= 0) {
			// Token is expired, don't attempt refresh - let main auth middleware handle it
			console.log('Token already expired, skipping refresh attempt');
		}
		
		next();
	} catch (error) {
		console.error('Token refresh error:', error.message);
		// Continue - main auth middleware will handle invalid tokens
		// This ensures the refresh middleware doesn't break the authentication flow
		next();
	}
};

// ==========================================
// USER PROFILE ROUTES
// ==========================================

app.get("/api/users/profile", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	try {
		const user = await db("users")
			.where("id", req.user.userId)
			.select("id", "username", "email", "created_at", "updated_at")
			.first();

		if (!user) {
			return res.status(404).json({ error: "Gebruiker niet gevonden." });
		}

		res.json(user);
	} catch (error) {
		console.error("Profiel ophalen fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het ophalen van profiel." });
	}
});

app.put("/api/users/profile", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { username, email } = req.body;

	if (!username && !email) {
		return res.status(400).json({ error: "Vul minimaal één veld in om bij te werken." });
	}

	try {
		// Check if username is already taken by another user
		if (username) {
			const existingUser = await db("users")
				.where("username", username)
				.whereNot("id", req.user.userId)
				.first();

			if (existingUser) {
				return res.status(400).json({ error: "Deze gebruikersnaam is al in gebruik." });
			}
		}

		// Check if email is already taken by another user
		if (email) {
			const existingEmail = await db("users")
				.where("email", email)
				.whereNot("id", req.user.userId)
				.first();

			if (existingEmail) {
				return res.status(400).json({ error: "Dit emailadres is al in gebruik." });
			}
		}

		// Update user profile
		const updatedUser = await db("users")
			.where("id", req.user.userId)
			.update({
				...(username && { username: username.trim() }),
				...(email && { email: email.trim() }),
				updated_at: new Date()
			})
			.returning(["id", "username", "email", "created_at", "updated_at"])
			.first();

		// Update stored user data in localStorage (frontend will handle this automatically)
		res.json(updatedUser);
	} catch (error) {
		console.error("Profiel bijwerken fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het bijwerken van profiel." });
	}
});

app.put("/api/users/password", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		return res.status(400).json({ error: "Huidig en nieuw wachtwoord zijn verplicht." });
	}

	if (newPassword.length < 8) {
		return res.status(400).json({ error: "Wachtwoord moet minimaal 8 tekens zijn." });
	}

	try {
		// Get current user data to verify current password
		const user = await db("users")
			.where("id", req.user.userId)
			.select("password_hash")
			.first();

		if (!user) {
			return res.status(404).json({ error: "Gebruiker niet gevonden." });
		}

		// Verify current password (SHA256 comparison since that's what we store)
		const crypto = require('crypto-js');
		const hashedCurrentPassword = crypto.SHA256(currentPassword).toString();
		
		if (hashedCurrentPassword !== user.password_hash) {
			return res.status(400).json({ error: "Huidig wachtwoord is onjuist." });
		}

		// Hash the new password
		const hashedNewPassword = crypto.SHA256(newPassword).toString();

		// Update password
		await db("users")
			.where("id", req.user.userId)
			.update({
				password_hash: hashedNewPassword,
				updated_at: new Date()
			});

		res.json({ message: "Wachtwoord succesvol gewijzigd." });
	} catch (error) {
		console.error("Wachtwoord wijzigen fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het wijzigen van wachtwoord." });
	}
});

// ==========================================
// CATEGORIES ROUTES
// ==========================================

app.get("/api/categories", async (req, res) => {
	try {
		const categories = await db("categories").select("*").orderBy("name");
		res.json(categories);
	} catch (error) {
		console.error("Categorien ophalen fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het ophalen van categorieën." });
	}
});

app.post("/api/categories", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { name } = req.body;

	if (!name || name.trim() === "") {
		return res.status(400).json({ error: "Categorie naam is verplicht." });
	}

	try {
		const [newCategory] = await db("categories")
			.insert({ name: name.trim() })
			.returning("*");
		
		res.status(201).json(newCategory);
	} catch (error) {
		console.error("Categorie aanmaken fout:", error);
		if (error.code === '23505') {
			return res.status(400).json({ error: "Deze categorie bestaat al." });
		}
		res.status(500).json({ error: "Er ging iets mis bij het aanmaken van de categorie." });
	}
});

// ==========================================
// RECEIPTS ROUTES
// ==========================================

app.get("/api/receipts", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	try {
		const receipts = await db("receipts")
			.where("user_id", req.user.userId)
			.select("*")
			.orderBy("purchase_date", "desc")
			.orderBy("created_at", "desc");

		const receiptsWithItems = await Promise.all(
			receipts.map(async (receipt) => {
				const items = await db("receipt_items")
					.where("receipt_id", receipt.id)
					.join("categories", "receipt_items.category_id", "categories.id")
					.select(
						"receipt_items.*",
						"categories.name as category_name"
					);

				return {
					...receipt,
					items: items.map(item => ({
						id: item.id,
						name: item.product_name,
						category: item.category_name || 'Onbekend',
						quantity: item.quantity,
						price: item.price
					}))
				};
			})
		);

		res.json(receiptsWithItems);
	} catch (error) {
		console.error("Bonnen ophalen fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het ophalen van bonnen." });
	}
});

app.get("/api/receipts/:id", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { id } = req.params;

	try {
		const receipt = await db("receipts")
			.where({ id, user_id: req.user.userId })
			.first();

		if (!receipt) {
			return res.status(404).json({ error: "Bon niet gevonden." });
		}

		const items = await db("receipt_items")
			.where("receipt_id", receipt.id)
			.join("categories", "receipt_items.category_id", "categories.id")
			.select(
				"receipt_items.*",
				"categories.name as category_name"
			);

		const receiptWithItems = {
			...receipt,
			items: items.map(item => ({
				id: item.id,
				name: item.product_name,
				category: item.category_name || 'Onbekend',
				quantity: item.quantity,
				price: item.price
			}))
		};

		res.json(receiptWithItems);
	} catch (error) {
		console.error("Bon ophalen fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het ophalen van de bon." });
	}
});

app.post("/api/receipts", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { store_name, purchase_date, purchase_time, payment_method, total_amount, raw_ocr_text, items } = req.body;

	if (!store_name || !purchase_date || !purchase_time || !total_amount || !items || !Array.isArray(items)) {
		return res.status(400).json({ error: "Alle verplichte velden moeten ingevuld zijn." });
	}

	if (items.length === 0) {
		return res.status(400).json({ error: "Een bon moet minstens één item hebben." });
	}

	try {
		await db.transaction(async (trx) => {
			const [newReceipt] = await trx("receipts")
				.insert({
					user_id: req.user.userId,
					store_name: store_name.trim(),
					purchase_date,
					purchase_time,
					payment_method: payment_method || null,
					total_amount: Number.parseFloat(total_amount),
					raw_ocr_text: raw_ocr_text || null
				})
				.returning("*");

			const itemsToInsert = items.map(item => {
				const categoryId = item.category && item.category !== 'Onbekend' 
					? trx("categories").where("name", item.category).select("id").first()
					: null;

				return {
					receipt_id: newReceipt.id,
					category_id: categoryId,
					product_name: item.name.trim(),
					quantity: Number.parseFloat(item.quantity) || 1,
					price: Number.parseFloat(item.price)
				};
			});

			for (const item of itemsToInsert) {
				if (item.category_id) {
					const category = await item.category_id;
					item.category_id = category ? category.id : null;
				}
			}

			await trx("receipt_items").insert(itemsToInsert);

			const createdItems = await trx("receipt_items")
				.where("receipt_id", newReceipt.id)
				.join("categories", "receipt_items.category_id", "categories.id")
				.select(
					"receipt_items.*",
					"categories.name as category_name"
				);

			res.status(201).json({
				...newReceipt,
				items: createdItems.map(item => ({
					id: item.id,
					name: item.product_name,
					category: item.category_name || 'Onbekend',
					quantity: item.quantity,
					price: item.price
				}))
			});
		});
	} catch (error) {
		console.error("Bon aanmaken fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het aanmaken van de bon." });
	}
});

app.put("/api/receipts/:id", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { id } = req.params;
	const { store_name, purchase_date, purchase_time, payment_method, total_amount, items } = req.body;

	if (!store_name || !purchase_date || !purchase_time || !total_amount || !items || !Array.isArray(items)) {
		return res.status(400).json({ error: "Alle verplichte velden moeten ingevuld zijn." });
	}

	if (items.length === 0) {
		return res.status(400).json({ error: "Een bon moet minstens één item hebben." });
	}

	try {
		await db.transaction(async (trx) => {
			const existingReceipt = await trx("receipts")
				.where({ id, user_id: req.user.userId })
				.first();

			if (!existingReceipt) {
				return res.status(404).json({ error: "Bon niet gevonden." });
			}

			await trx("receipt_items").where("receipt_id", id).del();

			await trx("receipts")
				.where("id", id)
				.update({
					store_name: store_name.trim(),
					purchase_date,
					purchase_time,
					payment_method: payment_method || null,
					total_amount: Number.parseFloat(total_amount)
				});

			const itemsToInsert = items.map(item => {
				const categoryId = item.category && item.category !== 'Onbekend' 
					? trx("categories").where("name", item.category).select("id").first()
					: null;

				return {
					receipt_id: Number.parseInt(id),
					category_id: categoryId,
					product_name: item.name.trim(),
					quantity: Number.parseFloat(item.quantity) || 1,
					price: Number.parseFloat(item.price)
				};
			});

			for (const item of itemsToInsert) {
				if (item.category_id) {
					const category = await item.category_id;
					item.category_id = category ? category.id : null;
				}
			}

			await trx("receipt_items").insert(itemsToInsert);

			const updatedItems = await trx("receipt_items")
				.where("receipt_id", id)
				.join("categories", "receipt_items.category_id", "categories.id")
				.select(
					"receipt_items.*",
					"categories.name as category_name"
				);

			const updatedReceipt = await trx("receipts").where("id", id).first();

			res.json({
				...updatedReceipt,
				items: updatedItems.map(item => ({
					id: item.id,
					name: item.product_name,
					category: item.category_name || 'Onbekend',
					quantity: item.quantity,
					price: item.price
				}))
			});
		});
	} catch (error) {
		console.error("Bon bijwerken fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het bijwerken van de bon." });
	}
});

app.delete("/api/receipts/:id", authenticateToken, refreshTokenIfNeeded, async (req, res) => {
	const { id } = req.params;

	try {
		const deletedCount = await db("receipts")
			.where({ id, user_id: req.user.userId })
			.del();

		if (deletedCount === 0) {
			return res.status(404).json({ error: "Bon niet gevonden." });
		}

		res.json({ message: "Bon succesvol verwijderd." });
	} catch (error) {
		console.error("Bon verwijderen fout:", error);
		res.status(500).json({ error: "Er ging iets mis bij het verwijderen van de bon." });
	}
});

app.listen(PORT, () => {
	console.log(`Server draait op poort ${PORT}`);
});
