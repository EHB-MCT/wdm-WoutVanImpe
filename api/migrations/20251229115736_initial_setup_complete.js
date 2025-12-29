exports.up = async function (knex) {
	// Drop all existing tables to start fresh
	await knex.schema.dropTableIfExists("receipt_items");
	await knex.schema.dropTableIfExists("receipts");
	await knex.schema.dropTableIfExists("categories");
	await knex.schema.dropTableIfExists("users");

	// Create users table with role parameter
	await knex.schema.createTable("users", (table) => {
		table.increments("id").primary();
		table.string("username", 255).notNullable().unique();
		table.string("email", 255).notNullable().unique();
		table.string("password_hash", 255).notNullable();
		table.enu("role", ["user", "admin"]).defaultTo("user").notNullable();
		table.timestamps(true, true);
	});

	// Create categories table
	await knex.schema.createTable("categories", (table) => {
		table.increments("id").primary();
		table.string("name", 100).notNullable();
	});

	// Create receipts table
	await knex.schema.createTable("receipts", (table) => {
		table.increments("id").primary();
		table.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
		table.decimal("total_amount", 10, 2).notNullable();
		table.date("purchase_date").notNullable();
		table.string("store_name").notNullable();
		table.time("purchase_time").notNullable();
		table.string("payment_method", 50);
		table.text("raw_ocr_text");
		table.timestamps(true, true);
	});

	// Create receipt_items table
	await knex.schema.createTable("receipt_items", (table) => {
		table.increments("id").primary();
		table.integer("receipt_id").unsigned().references("id").inTable("receipts").onDelete("CASCADE");
		table.integer("category_id").unsigned().references("id").inTable("categories").onDelete("SET NULL");
		table.string("product_name", 255).notNullable();
		table.decimal("quantity", 8, 3).defaultTo(1);
		table.decimal("price", 10, 2).notNullable();
	});

	// Create dangerous_receipt_metadata table
	await knex.schema.createTable("dangerous_receipt_metadata", (table) => {
		table.increments("id").primary();
		table.integer("receipt_id").unsigned().references("id").inTable("receipts").onDelete("CASCADE").unique();
		
		// Financial & Bank
		table.enu("payment_method", ["Cash", "Card", "Phone"]);
		table.enu("card_network", ["Visa", "Mastercard", "Bancontact"]);
		table.string("card_fingerprint", 4); // Last 4 digits
		table.string("bank_name", 100);
		table.integer("wealth_rating").checkBetween([1, 10]); // 1-10 scale
		
		// Health & Behavior
		table.integer("health_score").checkBetween([0, 100]); // 0-100 scale
		table.integer("sin_score").checkBetween([0, 100]); // 0-100 scale
		table.integer("urgency_score").checkBetween([1, 10]); // 1-10 scale
		
		// Location & Time
		table.string("store_location", 255);
		table.string("geographic_pattern", 100);
		table.enu("time_category", ["Morning", "Lunch", "Evening", "Night_Owl"]);
		
		// AI Judgment
		table.string("ai_flag", 100); // Short label like "Alcohol_Risk", "Big_Spender"
		
		table.timestamps(true, true);
	});

	// Insert predefined categories
	await knex("categories").insert([
		{ name: "Boodschappen" },
		{ name: "Huishouden" },
		{ name: "Verkeer & Vervoer" },
		{ name: "Gezondheid & Zorg" },
		{ name: "Vrije Tijd & Uitgaan" },
		{ name: "Winkels & Kleding" },
		{ name: "Financieel & Diensten" },
		{ name: "Overig" },
	]);
};

exports.down = async function (knex) {
	await knex.schema.dropTableIfExists("dangerous_receipt_metadata");
	await knex.schema.dropTableIfExists("receipt_items");
	await knex.schema.dropTableIfExists("receipts");
	await knex.schema.dropTableIfExists("categories");
	await knex.schema.dropTableIfExists("users");
};