/**
 * Initial data seed for the application
 */

const crypto = require("node:crypto");

exports.seed = async function (knex) {
	// Delete all existing data
	await knex("dangerous_receipt_metadata").del();
	await knex("receipt_items").del();
	await knex("receipts").del();
	await knex("users").del();

	// Hash passwords for test users (using SHA256 to match frontend)
	const adminPasswordHash = crypto.createHash("sha256").update("admin123").digest("hex");
	const studentPasswordHash = crypto.createHash("sha256").update("student123").digest("hex");
	const expatPasswordHash = crypto.createHash("sha256").update("expat123").digest("hex");

	// Create users
	const [adminUser] = await knex("users")
		.insert({
			username: "admin",
			email: "admin@system.local",
			password_hash: adminPasswordHash,
			role: "admin",
		})
		.returning("id");

	const [studentUser] = await knex("users")
		.insert({
			username: "student",
			email: "student@example.com",
			password_hash: studentPasswordHash,
			role: "user",
		})
		.returning("id");

	const [expatUser] = await knex("users")
		.insert({
			username: "expat",
			email: "expat@example.com",
			password_hash: expatPasswordHash,
			role: "user",
		})
		.returning("id");

	// Get category IDs
	const categories = await knex("categories").select("id", "name");
	const categoryMap = {};
	categories.forEach((cat) => {
		categoryMap[cat.name] = cat.id;
	});

	// Create sample receipts for student user (poor student pattern)
	const studentReceipts = [
		{
			user_id: studentUser.id,
			total_amount: 15.99,
			purchase_date: "2025-12-01",
			purchase_time: "19:30:00",
			store_name: "Aldi Brussels",
			payment_method: "Bancontact",
			raw_ocr_text: "ALDI BRUSSELS\n01/12/2025 19:30\nPasta 500g 0.89\nTomato Sauce 1.29\nBread 0.85\nTOTAL: 15.99\nBANCONTACT ****1234",
		},
		{
			user_id: studentUser.id,
			total_amount: 8.5,
			purchase_date: "2025-12-05",
			purchase_time: "12:45:00",
			store_name: "McDonald's Leuven",
			payment_method: "Cash",
			raw_ocr_text: "MCDONALD'S LEUVEN\n05/12/2025 12:45\nHappy Meal 8.50\nTOTAL: 8.50\nCASH",
		},
		{
			user_id: studentUser.id,
			total_amount: 22.4,
			purchase_date: "2025-12-10",
			purchase_time: "18:15:00",
			store_name: "Lidl Antwerp",
			payment_method: "Bancontact",
			raw_ocr_text: "LIDL ANTWERP\n10/12/2025 18:15\nRice 1kg 1.99\nEggs 12x 2.50\nVegetables 5.99\nMilk 1L 1.20\nIce Cream 3.99\nTOTAL: 15.67\nBANCONTACT ****1234",
		},
	];

	// Create sample receipts for expat user (wealthy expat pattern)
	const expatReceipts = [
		{
			user_id: expatUser.id,
			total_amount: 189.99,
			purchase_date: "2025-12-02",
			purchase_time: "14:20:00",
			store_name: "Delhaize Luxury",
			payment_method: "Visa",
			raw_ocr_text: "DELHAIZE LUXURY\n02/12/2025 14:20\nOrganic Salmon 45.99\nWine Premium 89.99\nCheese Selection 54.01\nTOTAL: 189.99\nVISA ****5678",
		},
		{
			user_id: expatUser.id,
			total_amount: 350,
			purchase_date: "2025-12-06",
			purchase_time: "16:30:00",
			store_name: "Zara Premium",
			payment_method: "Mastercard",
			raw_ocr_text: "ZARA PREMIUM\n06/12/2025 16:30\nDesigner Coat 250.00\nPremium Scarf 100.00\nTOTAL: 350.00\nMASTERCARD ****9012",
		},
		{
			user_id: expatUser.id,
			total_amount: 89.9,
			purchase_date: "2025-12-08",
			purchase_time: "20:00:00",
			store_name: "Restaurant Michel",
			payment_method: "Visa",
			raw_ocr_text: "RESTAURANT MICHEL\n08/12/2025 20:00\nTasting Menu 89.90\nTOTAL: 89.90\nVISA ****5678",
		},
	];

	// Insert all receipts
	const allReceipts = [...studentReceipts, ...expatReceipts];

	for (const receipt of allReceipts) {
		const [receiptResult] = await knex("receipts").insert(receipt).returning("id");
		const receiptId = receiptResult.id;

		// Create metadata for each receipt
		let metadata = {};

		if (receipt.user_id === studentUser.id) {
			// Student metadata
			metadata = {
				receipt_id: receiptId,
				payment_method: receipt.payment_method === "Cash" ? "Cash" : "Card",
				card_network: receipt.payment_method === "Bancontact" ? "Bancontact" : null,
				card_fingerprint: receipt.payment_method === "Bancontact" ? "1234" : null,
				bank_name: "ING",
				wealth_rating: 2, // Low wealth rating
				health_score: 45, // Moderate health
				sin_score: 25, // Low sin score
				urgency_score: 6, // Medium urgency
				store_location: receipt.store_name.includes("Brussels") ? "Brussels" : receipt.store_name.includes("Leuven") ? "Leuven" : "Antwerp",
				geographic_pattern: "Student_Neighborhood",
				time_category: receipt.purchase_time.startsWith("19") ? "Evening" : "Lunch",
				ai_flag: "Budget_Conscious",
			};
		} else {
			// Expat metadata
			metadata = {
				receipt_id: receiptId,
				payment_method: "Card",
				card_network: receipt.payment_method,
				card_fingerprint: receipt.payment_method === "Visa" ? "5678" : "9012",
				bank_name: "KBC",
				wealth_rating: 9, // High wealth rating
				health_score: 65, // Good health
				sin_score: 35, // Moderate sin score (wine, dining)
				urgency_score: 3, // Low urgency (relaxed shopping)
				store_location: receipt.store_name.includes("Brussels") ? "Brussels" : "Antwerp",
				geographic_pattern: "Expatriate_Area",
				time_category: receipt.purchase_time.startsWith("14") || receipt.purchase_time.startsWith("16") ? "Lunch" : "Evening",
				ai_flag: "High_Spender",
			};
		}

		await knex("dangerous_receipt_metadata").insert(metadata);

		// Add realistic receipt items based on store type
		let items = [];
		
		if (receipt.store_name.includes("Aldi")) {
			items = [
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Pasta 500g", quantity: 1, price: 0.89 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Tomatensaus 500ml", quantity: 1, price: 1.29 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Brood", quantity: 1, price: 0.85 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Eieren 12st", quantity: 12, price: 2.5 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "IJs 1L", quantity: 1, price: 3.99 }
			];
		} else if (receipt.store_name.includes("Lidl")) {
			items = [
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Volkoren Brood", quantity: 1, price: 1.99 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Gekookte Ham 200g", quantity: 1, price: 3.49 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Kaas Geraspt 150g", quantity: 1, price: 2.99 },
				{ receipt_id: receiptId, category_id: categoryMap["Huishouden"], product_name: "Toiletreiniger", quantity: 1, price: 4.5 },
				{ receipt_id: receiptId, category_id: categoryMap["Huishouden"], product_name: "Keukenpapier 6st", quantity: 6, price: 3.07 }
			];
		} else if (receipt.store_name.includes("McDonald")) {
			items = [
				{ receipt_id: receiptId, category_id: categoryMap["Vrije Tijd & Uitgaan"], product_name: "Happy Meal", quantity: 1, price: 8.5 },
				{ receipt_id: receiptId, category_id: categoryMap["Vrije Tijd & Uitgaan"], product_name: "Chicken McNuggets 6st", quantity: 1, price: 6.5 },
				{ receipt_id: receiptId, category_id: categoryMap["Vrije Tijd & Uitgaan"], product_name: "Appeltaart", quantity: 2, price: 1.5 },
				{ receipt_id: receiptId, category_id: categoryMap["Vrije Tijd & Uitgaan"], product_name: "Coca Cola 500ml", quantity: 1, price: 2.5 },
				{ receipt_id: receiptId, category_id: categoryMap["Vrije Tijd & Uitgaan"], product_name: "Grote Frites", quantity: 1, price: 3.5 }
			];
		} else if (receipt.store_name.includes("Delhaize")) {
			items = [
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Biologische Zalm 400g", quantity: 1, price: 45.99 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Premium Wijn 750ml", quantity: 1, price: 89.99 },
				{ receipt_id: receiptId, category_id: categoryMap["Boodschappen"], product_name: "Kaas Selectie", quantity: 1, price: 54.01 }
			];
		} else if (receipt.store_name.includes("Zara")) {
			items = [
				{ receipt_id: receiptId, category_id: categoryMap["Winkels & Kleding"], product_name: "Winterjas", quantity: 1, price: 250 },
				{ receipt_id: receiptId, category_id: categoryMap["Winkels & Kleding"], product_name: "Wollen Trui", quantity: 1, price: 45.95 },
				{ receipt_id: receiptId, category_id: categoryMap["Winkels & Kleding"], product_name: "Cashmere Sjaal", quantity: 1, price: 35.95 },
				{ receipt_id: receiptId, category_id: categoryMap["Winkels & Kleding"], product_name: "Leren Handschoenen", quantity: 1, price: 23.65 }
			];
		} else if (receipt.store_name.includes("Restaurant")) {
			items = [
				{ receipt_id: receiptId, category_id: categoryMap["Vrije Tijd & Uitgaan"], product_name: "Proefmenu", quantity: 1, price: 89.9 }
			];
		}

		if (items.length > 0) {
			await knex("receipt_items").insert(items);
		}
	}

	console.log("Database seeded successfully with admin and test users!");
};
