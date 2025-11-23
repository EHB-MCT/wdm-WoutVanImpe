exports.up = async function (knex) {
	await knex.schema.createTable("users", (table) => {
		table.increments("id").primary();
		table.string("username", 255).notNullable().unique();
		table.string("email", 255).notNullable().unique();
		table.string("password_hash", 255).notNullable();
		table.timestamps(true, true);
	});

	await knex.schema.createTable("categories", (table) => {
		table.increments("id").primary();
		table.string("name", 100).notNullable();
	});

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

	await knex.schema.createTable("receipt_items", (table) => {
		table.increments("id").primary();
		table.integer("receipt_id").unsigned().references("id").inTable("receipts").onDelete("CASCADE");
		table.integer("category_id").unsigned().references("id").inTable("categories").onDelete("SET NULL");
		table.string("product_name", 255).notNullable();
		table.decimal("quantity", 8, 3).defaultTo(1);
		table.decimal("price", 10, 2).notNullable();
	});
};

exports.down = async function (knex) {
	await knex.schema.dropTableIfExists("receipt_items");
	await knex.schema.dropTableIfExists("receipts");
	await knex.schema.dropTableIfExists("categories");
	await knex.schema.dropTableIfExists("users");
};
