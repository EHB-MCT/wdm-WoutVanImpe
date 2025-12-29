/**
 * Initial data seed for the application
 */

const crypto = require("node:crypto");

exports.seed = async function (knex) {
    // 1. CLEANUP
    // Delete all existing data
    await knex("dangerous_receipt_metadata").del();
    await knex("receipt_items").del();
    await knex("receipts").del();
    await knex("users").del();

    // 2. USERS
    // Hash passwords for test users
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
            username: "Wout",
            email: "wout@example.com",
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

    // 3. CATEGORIES
    // Get category IDs (Assuming categories table is already seeded via a migration or previous seed)
    // If not, ensure you have categories seeded before running this!
    const categories = await knex("categories").select("id", "name");
    const categoryMap = {};
    categories.forEach((cat) => {
        categoryMap[cat.name] = cat.id;
    });

    // Helper function to find a category ID safely (defaults to "Overig" if not found)
    const getCatId = (name) => categoryMap[name] || categoryMap["Overig"];

    // 4. DATA PREPARATION
    
    // THE NEW STUDENT DATA (Generated from OCR)
    const studentReceipts = [
        {
            user_id: studentUser.id,
            store_name: "LIDL Ixelles 2",
            purchase_date: "2025-11-10",
            purchase_time: "17:45",
            total_amount: 30.48,
            payment_method: "Bancontact",
            raw_ocr_text: "LIDL Ixelles 2\nCAROTTES BIO 1.98\nPRIMEUR PDT 4.99\n...", // Simplified for seed
            items: [
                { name: "CAROTTES BIO 1/B10 WORTELEN 1", category: "Boodschappen", quantity: 1, price: 1.98 },
                { name: "PRIMEUR PDT NI/PRIMEUR AARD.", category: "Boodschappen", quantity: 1, price: 4.99 },
                { name: "BISCUITS MARIA/MAR", category: "Boodschappen", quantity: 2, price: 1.99 },
                { name: "MUESLI CROQUAN/KRO", category: "Boodschappen", quantity: 2, price: 2.99 },
                { name: "PAIN COMPLET R/VOLKORENBROOD", category: "Boodschappen", quantity: 1, price: 2.19 },
                { name: "KIWI GOLD", category: "Boodschappen", quantity: 1, price: 3.99 },
                { name: "VEGGIE RONDO/NUGGETS", category: "Boodschappen", quantity: 1, price: 1.69 },
                { name: "GOUDA JEUNE TR/GOUDA JONG SNE", category: "Boodschappen", quantity: 1, price: 3.69 },
                { name: "OEUFS PLEIN AI/EIEREN VRIJE U", category: "Boodschappen", quantity: 1, price: 1.99 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Bancontact",
                wealth_rating: 2,
                health_score: 75,
                sin_score: 10,
                urgency_score: 4,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Avond",
                ai_flag: "Gezonde Koper"
            }
        },
        {
            user_id: studentUser.id,
            store_name: "LIDL Ixelles 2",
            purchase_date: "2025-12-10",
            purchase_time: "12:59",
            total_amount: 7.77,
            payment_method: "Bancontact",
            raw_ocr_text: "LIDL Ixelles 2\nGOUDA 2.99\nPIZZA 2.19\n...",
            items: [
                { name: "GOUDA EN TRANC/GOUDA IN SNEET", category: "Boodschappen", quantity: 1, price: 2.99 },
                { name: "PIZZA 4 FROMAG/PIZZA 4 KAZEN", category: "Boodschappen", quantity: 1, price: 2.19 },
                { name: "PIZZA MARGHERITA", category: "Boodschappen", quantity: 1, price: 2.59 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Bancontact",
                wealth_rating: 2,
                health_score: 20,
                sin_score: 40,
                urgency_score: 3,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Middag",
                ai_flag: "Junkfood"
            }
        },
        {
            user_id: studentUser.id,
            store_name: "Carrefour Express",
            purchase_date: "2025-12-14",
            purchase_time: "17:30",
            total_amount: 8.39,
            payment_method: "Debit Mastercard",
            raw_ocr_text: "Carrefour Express\nMOUSSAKA 3.99\nSAUCE 1.85\n...",
            items: [
                { name: "CAR MOUSSAKA 400GR", category: "Boodschappen", quantity: 1, price: 3.99 },
                { name: "CAR SAUCE ANDALOUS", category: "Boodschappen", quantity: 1, price: 1.85 },
                { name: "CAR OEUFS SOL LX6", category: "Boodschappen", quantity: 1, price: 2.55 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Mastercard",
                wealth_rating: 5,
                health_score: 40,
                sin_score: 20,
                urgency_score: 5,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Avond",
                ai_flag: null
            }
        },
        {
            user_id: studentUser.id,
            store_name: "LIDL Ixelles 2",
            purchase_date: "2025-12-04",
            purchase_time: "16:51",
            total_amount: 27.97,
            payment_method: "Bancontact",
            raw_ocr_text: "LIDL Ixelles 2\nLAIT ENTIER 1.25\nMULTICEREALES 1.95\n...",
            items: [
                { name: "LAIT ENTIER BE/VOL", category: "Boodschappen", quantity: 6, price: 1.25 },
                { name: "MULTICEREALES /DON", category: "Boodschappen", quantity: 2, price: 1.95 },
                { name: "MUESLI CROQUAN/KRO", category: "Boodschappen", quantity: 3, price: 3.49 },
                { name: "CUBES TOMAT.-1/ITAL. TOM.BLOK", category: "Boodschappen", quantity: 1, price: 0.79 },
                { name: "CUBES TOMAT. I/ITAL. TOM.BLOK", category: "Boodschappen", quantity: 1, price: 0.79 },
                { name: "CHAMPIGNONS FI/CHAMPIGNONS FI", category: "Boodschappen", quantity: 1, price: 1.29 },
                { name: "POULET HACHE/KIPPENGEHAKT", category: "Boodschappen", quantity: 1, price: 4.49 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Bancontact",
                wealth_rating: 2,
                health_score: 80,
                sin_score: 0,
                urgency_score: 4,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Middag",
                ai_flag: "Familiemaaltijd"
            }
        },
        {
            user_id: studentUser.id,
            store_name: "Carrefour Express",
            purchase_date: "2025-12-08",
            purchase_time: "17:44",
            total_amount: 13.74,
            payment_method: "Debit Mastercard",
            raw_ocr_text: "Carrefour Express\nPAMESELLO 1.99\nOEUFS 2.89\n...",
            items: [
                { name: "PAMESELLO 40GR", category: "Boodschappen", quantity: 2, price: 1.99 },
                { name: "CAR BIO OEUFS MX6", category: "Boodschappen", quantity: 1, price: 2.89 },
                { name: "EMINCES FILET 160G", category: "Boodschappen", quantity: 1, price: 3.59 },
                { name: "CAR PESTO GENOVESE", category: "Boodschappen", quantity: 1, price: 1.99 },
                { name: "BIO AIL 2PC", category: "Boodschappen", quantity: 1, price: 1.29 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Mastercard",
                wealth_rating: 6,
                health_score: 70,
                sin_score: 10,
                urgency_score: 6,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Avond",
                ai_flag: null
            }
        },
        {
            user_id: studentUser.id,
            store_name: "LIDL Ixelles 2",
            purchase_date: "2025-12-03",
            purchase_time: "17:07",
            total_amount: 19.35,
            payment_method: "Bancontact",
            raw_ocr_text: "LIDL Ixelles 2\nJUS MULTIVITAM 2.99\nHUILE OLIVE 5.89\n...",
            items: [
                { name: "JUS MULTIVITAM/MULTIVITAMINES", category: "Boodschappen", quantity: 3, price: 2.99 },
                { name: "HUILE D'OLIVE /BIO OLIJFOLIE", category: "Boodschappen", quantity: 1, price: 5.89 },
                { name: "BISCUITS MARIA/MAR", category: "Boodschappen", quantity: 2, price: 1.99 },
                { name: "VEGGIE BOULES//VEGGIE BURGER/", category: "Boodschappen", quantity: 1, price: 1.39 },
                { name: "CORNEJ GLACEE /1JSHOORNTJES M", category: "Boodschappen", quantity: 1, price: 1.85 },
                { name: "KIWI GOLD", category: "Boodschappen", quantity: 1, price: 3.25 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Bancontact",
                wealth_rating: 3,
                health_score: 60,
                sin_score: 30,
                urgency_score: 5,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Avond",
                ai_flag: "Zoetigheid"
            }
        },
        {
            user_id: studentUser.id,
            store_name: "TOISON D'OR",
            purchase_date: "2025-12-19",
            purchase_time: "15:40",
            total_amount: 49.99,
            payment_method: "Bancontact",
            raw_ocr_text: "TOISON D'OR\nSAMSUNG MICROSDXC 49.99\n...",
            items: [
                { name: "SAMSUNG MICROSDXC", category: "Winkels & Kleding", quantity: 1, price: 49.99 }
            ],
            dangerous_metadata: {
                card_fingerprint: null,
                card_network: "Bancontact",
                wealth_rating: 8,
                health_score: null,
                sin_score: 0,
                urgency_score: 2,
                store_location: "Bruxelles",
                geographic_pattern: "Stedelijk",
                time_category: "Middag",
                ai_flag: "Grote Uitgaven"
            }
        },
        {
            user_id: studentUser.id,
            store_name: "LIDL Ixelles 2",
            purchase_date: "2025-11-24",
            purchase_time: "17:32",
            total_amount: 11.71,
            payment_method: "Bancontact",
            raw_ocr_text: "LIDL Ixelles 2\nVEG MCX 1.89\nCAROTTES 0.95\n...",
            items: [
                { name: "VEG MCX/SCHNIT/VEG/STOKJES/SC", category: "Boodschappen", quantity: 1, price: 1.89 },
                { name: "CAROTTES EN BO/WORTELEN MET L", category: "Boodschappen", quantity: 1, price: 0.95 },
                { name: "MULTICEREALES/DONK.MEERGRBR.", category: "Boodschappen", quantity: 1, price: 1.99 },
                { name: "BISCUITS MARIA/MARIA KOEKJES", category: "Boodschappen", quantity: 1, price: 2.19 },
                { name: "GOUDA JEUNE TR/GOUDA JONG SNE", category: "Boodschappen", quantity: 1, price: 3.69 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Bancontact",
                wealth_rating: 2,
                health_score: 60,
                sin_score: 20,
                urgency_score: 5,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Avond",
                ai_flag: null
            }
        },
        {
            user_id: studentUser.id,
            store_name: "LIDL Ixelles 2",
            purchase_date: "2025-12-19",
            purchase_time: "16:14",
            total_amount: 17.43,
            payment_method: "Bancontact",
            raw_ocr_text: "LIDL Ixelles 2\nJUS MULTIVITAM 2.99\nPDT BINTJES 4.49\n...",
            items: [
                { name: "JUS MULTIVITAM/MULTIVITAMINES", category: "Boodschappen", quantity: 1, price: 2.99 },
                { name: "PDT BINTJES/BINTJES AARDAP", category: "Boodschappen", quantity: 1, price: 4.49 },
                { name: "CAROTTES BIO 1/BIO WORTELEN 1", category: "Boodschappen", quantity: 1, price: 1.69 },
                { name: "MULTIGRAINS NO/MEERGRANEN DON", category: "Boodschappen", quantity: 1, price: 1.89 },
                { name: "GOUDA EN TRANC/GOUDA IN SNEET", category: "Boodschappen", quantity: 1, price: 2.99 },
                { name: "VEGGIE RONDO/NUGGE", category: "Boodschappen", quantity: 2, price: 1.69 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5006",
                card_network: "Bancontact",
                wealth_rating: 2,
                health_score: 85,
                sin_score: 0,
                urgency_score: 4,
                store_location: "Ixelles",
                geographic_pattern: "Stedelijk",
                time_category: "Middag",
                ai_flag: null
            }
        }
    ];

    // THE EXPAT DATA (Manually converted to match the new structure so we can use one loop)
    const expatReceipts = [
        {
            user_id: expatUser.id,
            store_name: "Delhaize Luxury",
            purchase_date: "2025-12-02",
            purchase_time: "14:20:00",
            total_amount: 189.99,
            payment_method: "Visa",
            raw_ocr_text: "DELHAIZE LUXURY\nOrganic Salmon 45.99\n...",
            items: [
                { name: "Biologische Zalm 400g", category: "Boodschappen", quantity: 1, price: 45.99 },
                { name: "Premium Wijn 750ml", category: "Boodschappen", quantity: 1, price: 89.99 },
                { name: "Kaas Selectie", category: "Boodschappen", quantity: 1, price: 54.01 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5678",
                card_network: "Visa",
                bank_name: "KBC",
                wealth_rating: 9,
                health_score: 65,
                sin_score: 35,
                urgency_score: 3,
                store_location: "Brussels",
                geographic_pattern: "Expatwijk",
                time_category: "Middag",
                ai_flag: "Luxe Levensstijl"
            }
        },
        {
            user_id: expatUser.id,
            store_name: "Zara Premium",
            purchase_date: "2025-12-06",
            purchase_time: "16:30:00",
            total_amount: 350,
            payment_method: "Mastercard",
            raw_ocr_text: "ZARA PREMIUM\nDesigner Coat 250.00\n...",
            items: [
                { name: "Winterjas", category: "Winkels & Kleding", quantity: 1, price: 250 },
                { name: "Wollen Trui", category: "Winkels & Kleding", quantity: 1, price: 45.95 },
                { name: "Cashmere Sjaal", category: "Winkels & Kleding", quantity: 1, price: 35.95 },
                { name: "Leren Handschoenen", category: "Winkels & Kleding", quantity: 1, price: 23.65 }
            ],
            dangerous_metadata: {
                card_fingerprint: "9012",
                card_network: "Mastercard",
                bank_name: "KBC",
                wealth_rating: 9,
                health_score: 50, // Neutral
                sin_score: 0,
                urgency_score: 3,
                store_location: "Antwerp",
                geographic_pattern: "Expatwijk",
                time_category: "Middag",
                ai_flag: "Luxe Levensstijl"
            }
        },
        {
            user_id: expatUser.id,
            store_name: "Restaurant Michel",
            purchase_date: "2025-12-08",
            purchase_time: "20:00:00",
            total_amount: 89.9,
            payment_method: "Visa",
            raw_ocr_text: "RESTAURANT MICHEL\nTasting Menu 89.90\n...",
            items: [
                { name: "Proefmenu", category: "Vrije Tijd & Uitgaan", quantity: 1, price: 89.9 }
            ],
            dangerous_metadata: {
                card_fingerprint: "5678",
                card_network: "Visa",
                bank_name: "KBC",
                wealth_rating: 9,
                health_score: 40,
                sin_score: 20,
                urgency_score: 2,
                store_location: "Brussels",
                geographic_pattern: "Expatwijk",
                time_category: "Avond",
                ai_flag: "Luxe Levensstijl"
            }
        }
    ];

    // 5. INSERTION LOOP
    const allReceipts = [...studentReceipts, ...expatReceipts];

    for (const receipt of allReceipts) {
        // A. Insert Receipt
        const [receiptResult] = await knex("receipts").insert({
            user_id: receipt.user_id,
            total_amount: receipt.total_amount,
            purchase_date: receipt.purchase_date,
            purchase_time: receipt.purchase_time,
            store_name: receipt.store_name,
            payment_method: receipt.payment_method,
            raw_ocr_text: receipt.raw_ocr_text
        }).returning("id");

        const receiptId = receiptResult.id;

        // B. Insert Dangerous Metadata
        // Add the foreign key to the object
        const metadataToInsert = {
            ...receipt.dangerous_metadata,
            receipt_id: receiptId
        };
        await knex("dangerous_receipt_metadata").insert(metadataToInsert);

        // C. Insert Items
        // Map over items to add receipt_id and resolve category_id
        if (receipt.items && receipt.items.length > 0) {
            const itemsToInsert = receipt.items.map(item => ({
                receipt_id: receiptId,
                category_id: getCatId(item.category),
                product_name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            await knex("receipt_items").insert(itemsToInsert);
        }
    }

    console.log("Database seeded successfully with dynamic JSON data!");
};