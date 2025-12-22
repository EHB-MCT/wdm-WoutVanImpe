/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create dummy user
  const [userResult] = await knex('users').insert({
    username: 'testuser',
    email: 'test@example.com',
    password_hash: '$2b$10$rOvHPGkwJkKYs1qJ8.Xqj.8YvJ9qJ8.Xqj8YvJ9qJ8.Xqj8YvJ9qJ8' // bcrypt hash for 'password123'
  }).returning('id');
  const userId = userResult.id;

  // Get category IDs
  const categories = await knex('categories').select('id', 'name');
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat.id;
  });

  // Dummy receipts data spread over 3 months: November 2025, December 2025, January 2026
  const receipts = [
    // November 2025
    {
      user_id: userId,
      total_amount: 45.67,
      purchase_date: '2025-11-02',
      purchase_time: '14:30:00',
      store_name: 'Carrefour Brussels',
      payment_method: 'Bancontact',
      raw_ocr_text: 'CARREFOUR BRUSSELS\n02/11/2025 14:30\nBananas 1kg 2.50\nBread 1.80\nMilk 1L 1.20\nChicken 500g 8.90\nCleaning spray 4.50\nPanadol 12.75\nTOTAL: 45.67\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 89.99,
      purchase_date: '2025-11-05',
      purchase_time: '19:45:00',
      store_name: 'H&M Brussels',
      payment_method: 'Visa',
      raw_ocr_text: 'H&M BRUSSELS\n05/11/2025 19:45\nT-shirt Basic 19.99\nJeans Slim Fit 49.99\nSocks 3-pack 9.99\nBelt Leather 10.02\nTOTAL: 89.99\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 28.50,
      purchase_date: '2025-11-08',
      purchase_time: '12:15:00',
      store_name: 'McDonald\'s Leuven',
      payment_method: 'Mastercard',
      raw_ocr_text: 'McDonald\'s LEUVEN\n08/11/2025 12:15\nBig Mac Menu 8.50\nChicken McNuggets 6pc 6.50\nApple Pie 2x 3.00\nCoca Cola 500ml 2.50\nFries Large 3.50\nIce Cream Cone 2.50\nTOTAL: 28.50\nMASTERCARD ****9012'
    },
    {
      user_id: userId,
      total_amount: 156.78,
      purchase_date: '2025-11-12',
      purchase_time: '16:20:00',
      store_name: 'MediaMarkt Antwerp',
      payment_method: 'Bancontact',
      raw_ocr_text: 'MEDIAMARKT ANTWERP\n12/11/2025 16:20\nUSB Cable 3m 12.99\nPhone Case iPhone 24.99\nBluetooth Speaker 89.99\nScreen Protector 2x 14.99\nPhone Charger 13.82\nTOTAL: 156.78\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 67.45,
      purchase_date: '2025-11-15',
      purchase_time: '10:30:00',
      store_name: 'Delhaize Ghent',
      payment_method: 'Visa',
      raw_ocr_text: 'DELHAIZE GHENT\n15/11/2025 10:30\nPasta 500g 1.89\nTomato Sauce 2.45\nCheese Gouda 200g 4.50\nYogurt 4x 3.20\nApples 1kg 2.80\nOrange Juice 1L 2.99\nToilet Paper 8x 12.50\nShampoo 6.75\nVitamins 30.37\nTOTAL: 67.45\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 42.80,
      purchase_date: '2025-11-18',
      purchase_time: '18:00:00',
      store_name: 'Shell Station Brussels',
      payment_method: 'Mastercard',
      raw_ocr_text: 'SHELL BRUSSELS\n18/11/2025 18:00\nGasoline 95 30L 42.80\nTOTAL: 42.80\nMASTERCARD ****9012'
    },
    {
      user_id: userId,
      total_amount: 23.75,
      purchase_date: '2025-11-22',
      purchase_time: '13:45:00',
      store_name: 'Pharmacie Central',
      payment_method: 'Bancontact',
      raw_ocr_text: 'PHARMACIE CENTRAL\n22/11/2025 13:45\nIbuprofen 400mg 8.50\nVitamin C 1000mg 6.75\nBand-aids 20x 4.25\nCough Syrup 4.25\nTOTAL: 23.75\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 134.20,
      purchase_date: '2025-11-25',
      purchase_time: '15:30:00',
      store_name: 'Brico Mechelen',
      payment_method: 'Visa',
      raw_ocr_text: 'BRICO MECHELEN\n25/11/2025 15:30\nScrewdriver Set 24.99\nHammer 18.50\nNails 2kg 12.75\nPaint White 5L 45.96\nBrush Set 15.50\nSandpaper Pack 16.50\nTOTAL: 134.20\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 78.90,
      purchase_date: '2025-11-28',
      purchase_time: '20:15:00',
      store_name: 'Pizza Hut Leuven',
      payment_method: 'Mastercard',
      raw_ocr_text: 'PIZZA HUT LEUVEN\n28/11/2025 20:15\nPizza Margherita Large 18.90\nPizza Pepperoni Medium 16.50\nGarlic Bread 6.50\nCoca Cola 1.5L 4.50\nChicken Wings 8pc 12.50\nIce Cream 2x 10.00\nDelivery Fee 10.00\nTOTAL: 78.90\nMASTERCARD ****9012'
    },
    
    // December 2025
    {
      user_id: userId,
      total_amount: 52.30,
      purchase_date: '2025-12-03',
      purchase_time: '11:20:00',
      store_name: 'Colruyt Leuven',
      payment_method: 'Bancontact',
      raw_ocr_text: 'COLRUYT LEUVEN\n03/12/2025 11:20\nRice 1kg 2.89\nChicken Breast 800g 12.50\nBroccoli 500g 2.99\nButter 250g 3.45\nEggs 12x 4.20\nDishwasher Tablets 26.27\nTOTAL: 52.30\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 195.50,
      purchase_date: '2025-12-07',
      purchase_time: '14:15:00',
      store_name: 'Zara Brussels',
      payment_method: 'Visa',
      raw_ocr_text: 'ZARA BRUSSELS\n07/12/2025 14:15\nWinter Coat 89.95\nSweater Wool 45.95\nScarf Cashmere 35.95\nGloves Leather 23.65\nTOTAL: 195.50\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 15.80,
      purchase_date: '2025-12-10',
      purchase_time: '19:30:00',
      store_name: 'Quick Antwerp',
      payment_method: 'Mastercard',
      raw_ocr_text: 'QUICK ANTWERP\n10/12/2025 19:30\nGiant Burger Menu 9.90\nOnion Rings 3.50\nMilkshake Vanilla 2.40\nTOTAL: 15.80\nMASTERCARD ****9012'
    },
    {
      user_id: userId,
      total_amount: 89.99,
      purchase_date: '2025-12-14',
      purchase_time: '16:45:00',
      store_name: 'FNAC Brussels',
      payment_method: 'Bancontact',
      raw_ocr_text: 'FNAC BRUSSELS\n14/12/2025 16:45\nWireless Headphones 89.99\nTOTAL: 89.99\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 73.25,
      purchase_date: '2025-12-18',
      purchase_time: '09:15:00',
      store_name: 'Albert Heijn Ghent',
      payment_method: 'Visa',
      raw_ocr_text: 'ALBERT HEIJN GHENT\n18/12/2025 09:15\nSalmon Fillet 400g 18.99\nAsparagus 300g 4.50\nWine Red 750ml 12.99\nChocolate Dark 200g 3.99\nCoffee Beans 1kg 15.99\nFace Cream 16.79\nTOTAL: 73.25\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 48.60,
      purchase_date: '2025-12-21',
      purchase_time: '17:20:00',
      store_name: 'Total Station Leuven',
      payment_method: 'Mastercard',
      raw_ocr_text: 'TOTAL LEUVEN\n21/12/2025 17:20\nGasoline 98 32L 48.60\nTOTAL: 48.60\nMASTERCARD ****9012'
    },
    {
      user_id: userId,
      total_amount: 31.45,
      purchase_date: '2025-12-24',
      purchase_time: '12:30:00',
      store_name: 'Kruidvat Brussels',
      payment_method: 'Bancontact',
      raw_ocr_text: 'KRUIDVAT BRUSSELS\n24/12/2025 12:30\nToothpaste 2x 6.98\nDeodorant 4.99\nVitamin D 8.50\nPain Relief Gel 10.98\nTOTAL: 31.45\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 167.80,
      purchase_date: '2025-12-28',
      purchase_time: '13:45:00',
      store_name: 'Gamma Mechelen',
      payment_method: 'Visa',
      raw_ocr_text: 'GAMMA MECHELEN\n28/12/2025 13:45\nDrill Set 45.99\nWood Screws 100x 12.50\nWood Glue 8.99\nSanding Machine 89.99\nSafety Glasses 10.33\nTOTAL: 167.80\nVISA ****5678'
    },
    
    // January 2026
    {
      user_id: userId,
      total_amount: 38.75,
      purchase_date: '2026-01-04',
      purchase_time: '10:45:00',
      store_name: 'Lidl Brussels',
      payment_method: 'Mastercard',
      raw_ocr_text: 'LIDL BRUSSELS\n04/01/2026 10:45\nBread Whole Grain 1.99\nHam Sliced 200g 3.49\nCheese Sliced 150g 2.99\nTomatoes 500g 2.89\nLettuce 1.49\nMayonnaise 2.99\nToilet Cleaner 4.50\nKitchen Towels 6x 18.41\nTOTAL: 38.75\nMASTERCARD ****9012'
    },
    {
      user_id: userId,
      total_amount: 124.99,
      purchase_date: '2026-01-08',
      purchase_time: '15:20:00',
      store_name: 'Primark Antwerp',
      payment_method: 'Bancontact',
      raw_ocr_text: 'PRIMARK ANTWERP\n08/01/2026 15:20\nJeans Regular Fit 25.00\nT-shirts 3x 15.00\nUnderwear 5x 12.50\nSocks 10x 10.00\nPajamas 18.00\nSlippers 8.00\nBelt 6.49\nTOTAL: 124.99\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 22.90,
      purchase_date: '2026-01-12',
      purchase_time: '18:40:00',
      store_name: 'Burger King Ghent',
      payment_method: 'Visa',
      raw_ocr_text: 'BURGER KING GHENT\n12/01/2026 18:40\nWhopper Menu 11.90\nChicken Nuggets 9x 4.50\nApple Pie 2.50\nCoca Cola Zero 4.00\nTOTAL: 22.90\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 299.99,
      purchase_date: '2026-01-16',
      purchase_time: '14:10:00',
      store_name: 'Coolblue Brussels',
      payment_method: 'Mastercard',
      raw_ocr_text: 'COOLBLUE BRUSSELS\n16/01/2026 14:10\nSmartwatch Series 8 299.99\nTOTAL: 299.99\nMASTERCARD ****9012'
    },
    {
      user_id: userId,
      total_amount: 84.60,
      purchase_date: '2026-01-20',
      purchase_time: '11:30:00',
      store_name: 'Jumbo Leuven',
      payment_method: 'Bancontact',
      raw_ocr_text: 'JUMBO LEUVEN\n20/01/2026 11:30\nSteak Ribeye 500g 24.99\nPotatoes 2kg 3.98\nGreen Beans 400g 2.99\nMushrooms 250g 2.49\nGarlic Bread 2.99\nWine White 750ml 8.99\nIce Cream 1L 4.99\nLaundry Detergent 33.18\nTOTAL: 84.60\nBANCONTACT ****1234'
    },
    {
      user_id: userId,
      total_amount: 51.20,
      purchase_date: '2026-01-24',
      purchase_time: '16:50:00',
      store_name: 'Q8 Station Antwerp',
      payment_method: 'Visa',
      raw_ocr_text: 'Q8 ANTWERP\n24/01/2026 16:50\nGasoline 95 35L 51.20\nTOTAL: 51.20\nVISA ****5678'
    },
    {
      user_id: userId,
      total_amount: 27.85,
      purchase_date: '2026-01-28',
      purchase_time: '13:15:00',
      store_name: 'Apotheek Van Der Meer',
      payment_method: 'Mastercard',
      raw_ocr_text: 'APOTHEEK VAN DER MEER\n28/01/2026 13:15\nCold Medicine 9.50\nThroat Lozenges 4.25\nNose Spray 6.75\nVitamin C Tablets 7.35\nTOTAL: 27.85\nMASTERCARD ****9012'
    }
  ];

  // Insert receipts and get their IDs
  for (const receipt of receipts) {
    const [receiptResult] = await knex('receipts').insert(receipt).returning('id');
    const receiptId = receiptResult.id;

    // Define items for each receipt based on store type
    let items = [];
    
    if (receipt.store_name.includes('Carrefour')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Bananas 1kg', quantity: 1, price: 2.50 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Bread', quantity: 1, price: 1.80 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Milk 1L', quantity: 1, price: 1.20 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Chicken 500g', quantity: 1, price: 8.90 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Cleaning spray', quantity: 1, price: 4.50 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Panadol', quantity: 1, price: 12.75 }
      ];
    } else if (receipt.store_name.includes('H&M')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'T-shirt Basic', quantity: 1, price: 19.99 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Jeans Slim Fit', quantity: 1, price: 49.99 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Socks 3-pack', quantity: 1, price: 9.99 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Belt Leather', quantity: 1, price: 10.02 }
      ];
    } else if (receipt.store_name.includes('McDonald')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Big Mac Menu', quantity: 1, price: 8.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Chicken McNuggets 6pc', quantity: 1, price: 6.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Apple Pie', quantity: 2, price: 1.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Coca Cola 500ml', quantity: 1, price: 2.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Fries Large', quantity: 1, price: 3.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Ice Cream Cone', quantity: 1, price: 2.50 }
      ];
    } else if (receipt.store_name.includes('MediaMarkt')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'USB Cable 3m', quantity: 1, price: 12.99 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Phone Case iPhone', quantity: 1, price: 24.99 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Bluetooth Speaker', quantity: 1, price: 89.99 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Screen Protector', quantity: 2, price: 7.50 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Phone Charger', quantity: 1, price: 13.82 }
      ];
    } else if (receipt.store_name.includes('Delhaize')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Pasta 500g', quantity: 1, price: 1.89 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Tomato Sauce', quantity: 1, price: 2.45 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Cheese Gouda 200g', quantity: 1, price: 4.50 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Yogurt', quantity: 4, price: 0.80 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Apples 1kg', quantity: 1, price: 2.80 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Orange Juice 1L', quantity: 1, price: 2.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Toilet Paper 8x', quantity: 1, price: 12.50 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Shampoo', quantity: 1, price: 6.75 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Vitamins', quantity: 1, price: 30.37 }
      ];
    } else if (receipt.store_name.includes('Shell')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Verkeer & Vervoer'], product_name: 'Gasoline 95 30L', quantity: 30, price: 1.427 }
      ];
    } else if (receipt.store_name.includes('Pharmacie')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Ibuprofen 400mg', quantity: 1, price: 8.50 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Vitamin C 1000mg', quantity: 1, price: 6.75 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Band-aids 20x', quantity: 1, price: 4.25 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Cough Syrup', quantity: 1, price: 4.25 }
      ];
    } else if (receipt.store_name.includes('Brico')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Screwdriver Set', quantity: 1, price: 24.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Hammer', quantity: 1, price: 18.50 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Nails 2kg', quantity: 1, price: 12.75 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Paint White 5L', quantity: 1, price: 45.96 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Brush Set', quantity: 1, price: 15.50 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Sandpaper Pack', quantity: 1, price: 16.50 }
      ];
    } else if (receipt.store_name.includes('Pizza Hut')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Pizza Margherita Large', quantity: 1, price: 18.90 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Pizza Pepperoni Medium', quantity: 1, price: 16.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Garlic Bread', quantity: 1, price: 6.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Coca Cola 1.5L', quantity: 1, price: 4.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Chicken Wings 8pc', quantity: 1, price: 12.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Ice Cream', quantity: 2, price: 5.00 },
        { receipt_id: receiptId, category_id: categoryMap['Financieel & Diensten'], product_name: 'Delivery Fee', quantity: 1, price: 10.00 }
      ];
    } else if (receipt.store_name.includes('Colruyt')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Rice 1kg', quantity: 1, price: 2.89 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Chicken Breast 800g', quantity: 1, price: 12.50 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Broccoli 500g', quantity: 1, price: 2.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Butter 250g', quantity: 1, price: 3.45 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Eggs', quantity: 12, price: 0.35 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Dishwasher Tablets', quantity: 1, price: 26.27 }
      ];
    } else if (receipt.store_name.includes('Zara')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Winter Coat', quantity: 1, price: 89.95 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Sweater Wool', quantity: 1, price: 45.95 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Scarf Cashmere', quantity: 1, price: 35.95 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Gloves Leather', quantity: 1, price: 23.65 }
      ];
    } else if (receipt.store_name.includes('Quick')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Giant Burger Menu', quantity: 1, price: 9.90 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Onion Rings', quantity: 1, price: 3.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Milkshake Vanilla', quantity: 1, price: 2.40 }
      ];
    } else if (receipt.store_name.includes('FNAC')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Wireless Headphones', quantity: 1, price: 89.99 }
      ];
    } else if (receipt.store_name.includes('Albert Heijn')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Salmon Fillet 400g', quantity: 1, price: 18.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Asparagus 300g', quantity: 1, price: 4.50 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Wine Red 750ml', quantity: 1, price: 12.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Chocolate Dark 200g', quantity: 1, price: 3.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Coffee Beans 1kg', quantity: 1, price: 15.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Face Cream', quantity: 1, price: 16.79 }
      ];
    } else if (receipt.store_name.includes('Total')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Verkeer & Vervoer'], product_name: 'Gasoline 98 32L', quantity: 32, price: 1.519 }
      ];
    } else if (receipt.store_name.includes('Kruidvat')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Toothpaste', quantity: 2, price: 3.49 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Deodorant', quantity: 1, price: 4.99 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Vitamin D', quantity: 1, price: 8.50 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Pain Relief Gel', quantity: 1, price: 10.98 }
      ];
    } else if (receipt.store_name.includes('Gamma')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Drill Set', quantity: 1, price: 45.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Wood Screws', quantity: 100, price: 0.125 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Wood Glue', quantity: 1, price: 8.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Sanding Machine', quantity: 1, price: 89.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Safety Glasses', quantity: 1, price: 10.33 }
      ];
    } else if (receipt.store_name.includes('Lidl')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Bread Whole Grain', quantity: 1, price: 1.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Ham Sliced 200g', quantity: 1, price: 3.49 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Cheese Sliced 150g', quantity: 1, price: 2.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Tomatoes 500g', quantity: 1, price: 2.89 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Lettuce', quantity: 1, price: 1.49 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Mayonnaise', quantity: 1, price: 2.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Toilet Cleaner', quantity: 1, price: 4.50 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Kitchen Towels', quantity: 6, price: 3.07 }
      ];
    } else if (receipt.store_name.includes('Primark')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Jeans Regular Fit', quantity: 1, price: 25.00 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'T-shirts', quantity: 3, price: 5.00 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Underwear', quantity: 5, price: 2.50 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Socks', quantity: 10, price: 1.00 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Pajamas', quantity: 1, price: 18.00 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Slippers', quantity: 1, price: 8.00 },
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Belt', quantity: 1, price: 6.49 }
      ];
    } else if (receipt.store_name.includes('Burger King')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Whopper Menu', quantity: 1, price: 11.90 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Chicken Nuggets', quantity: 9, price: 0.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Apple Pie', quantity: 1, price: 2.50 },
        { receipt_id: receiptId, category_id: categoryMap['Vrije Tijd & Uitgaan'], product_name: 'Coca Cola Zero', quantity: 1, price: 4.00 }
      ];
    } else if (receipt.store_name.includes('Coolblue')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Winkels & Kleding'], product_name: 'Smartwatch Series 8', quantity: 1, price: 299.99 }
      ];
    } else if (receipt.store_name.includes('Jumbo')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Steak Ribeye 500g', quantity: 1, price: 24.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Potatoes 2kg', quantity: 1, price: 3.98 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Green Beans 400g', quantity: 1, price: 2.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Mushrooms 250g', quantity: 1, price: 2.49 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Garlic Bread', quantity: 1, price: 2.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Wine White 750ml', quantity: 1, price: 8.99 },
        { receipt_id: receiptId, category_id: categoryMap['Boodschappen'], product_name: 'Ice Cream 1L', quantity: 1, price: 4.99 },
        { receipt_id: receiptId, category_id: categoryMap['Huishouden'], product_name: 'Laundry Detergent', quantity: 1, price: 33.18 }
      ];
    } else if (receipt.store_name.includes('Q8')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Verkeer & Vervoer'], product_name: 'Gasoline 95 35L', quantity: 35, price: 1.463 }
      ];
    } else if (receipt.store_name.includes('Apotheek')) {
      items = [
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Cold Medicine', quantity: 1, price: 9.50 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Throat Lozenges', quantity: 1, price: 4.25 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Nose Spray', quantity: 1, price: 6.75 },
        { receipt_id: receiptId, category_id: categoryMap['Gezondheid & Zorg'], product_name: 'Vitamin C Tablets', quantity: 1, price: 7.35 }
      ];
    }

    // Insert items for this receipt
    if (items.length > 0) {
      await knex('receipt_items').insert(items);
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Delete in reverse order due to foreign key constraints
  await knex('receipt_items').where('receipt_id', 'in', 
    knex('receipts').select('id').where('user_id', 'in',
      knex('users').select('id').where('username', 'testuser')
    )
  ).del();
  
  await knex('receipts').where('user_id', 'in',
    knex('users').select('id').where('username', 'testuser')
  ).del();
  
  await knex('users').where('username', 'testuser').del();
};
