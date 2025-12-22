/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex('categories')
    .del()
    .then(() => {
      return knex('categories').insert([
        { name: 'Boodschappen' },
        { name: 'Huishouden' },
        { name: 'Verkeer & Vervoer' },
        { name: 'Gezondheid & Zorg' },
        { name: 'Vrije Tijd & Uitgaan' },
        { name: 'Winkels & Kleding' },
        { name: 'Financieel & Diensten' },
        { name: 'Overig' }
      ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex('categories').del();
};