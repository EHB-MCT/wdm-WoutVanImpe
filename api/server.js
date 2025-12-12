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

app.post("/api/categories", authenticateToken, async (req, res) => {
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

app.get("/api/receipts", authenticateToken, async (req, res) => {
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

app.get("/api/receipts/:id", authenticateToken, async (req, res) => {
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

app.post("/api/receipts", authenticateToken, async (req, res) => {
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
					total_amount: parseFloat(total_amount),
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
					quantity: parseFloat(item.quantity) || 1,
					price: parseFloat(item.price)
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

app.put("/api/receipts/:id", authenticateToken, async (req, res) => {
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
					total_amount: parseFloat(total_amount)
				});

			const itemsToInsert = items.map(item => {
				const categoryId = item.category && item.category !== 'Onbekend' 
					? trx("categories").where("name", item.category).select("id").first()
					: null;

				return {
					receipt_id: parseInt(id),
					category_id: categoryId,
					product_name: item.name.trim(),
					quantity: parseFloat(item.quantity) || 1,
					price: parseFloat(item.price)
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

app.delete("/api/receipts/:id", authenticateToken, async (req, res) => {
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
