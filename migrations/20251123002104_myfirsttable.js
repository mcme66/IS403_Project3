/**
 * @param { import("knex").Knex } knex
 */

exports.up = async function (knex) {
  // user
  await knex.schema.createTable("user", (table) => {
    table.increments("user_id").primary();
    table.string("first_name", 50).notNullable();
    table.string("last_name", 50).notNullable();
    table.string("username", 50).notNullable().unique();
    table.string("password", 255).notNullable();
    table.string("phone_number", 20);
    table.date("birthday");
  });

  // organizer
  await knex.schema.createTable("organizer", (table) => {
    table.increments("organizer_id").primary();
    table
      .integer("user_id")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
    table.boolean("recognized").defaultTo(false);
    table.string("addcodeused", 20).notNullable();
  });

  // judge
  await knex.schema.createTable("judge", (table) => {
    table.increments("judge_id").primary();
    table
      .integer("user_id")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
    table.string("highest_to_judge", 50);
    table.boolean("istd_certified").defaultTo(false);
    table.string("addcodeused", 20).notNullable();
  });

  // dancer
  await knex.schema.createTable("dancer", (table) => {
    table.increments("dancer_id").primary();
    table
      .integer("user_id")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
    table.integer("ndca_number");
    table.date("ndca_expiration");
    table.string("type", 20);
  });

  // admins
  await knex.schema.createTable("admins", (table) => {
    table.increments("admin_id").primary();
    table
      .integer("user_id")
      .references("user_id")
      .inTable("user")
      .onDelete("CASCADE");
  });

  // competition
  await knex.schema.createTable("competition", (table) => {
    table.increments("competition_id").primary();
    table
      .integer("organizer_id")
      .references("organizer_id")
      .inTable("organizer")
      .onDelete("SET NULL");
    table.string("location", 100);
    table.boolean("sanctioned").defaultTo(false);
  });

  // addcodes
  await knex.schema.createTable("addcodes", (table) => {
    table.increments("code_id").primary();
    table
      .integer("competition_id")
      .references("competition_id")
      .inTable("competition")
      .onDelete("CASCADE");
    table.string("code", 20).unique().notNullable();
    table
      .string("codetype", 20)
      .notNullable()
      .checkIn(["Organizer", "Judge"]);
  });

  // event
  await knex.schema.createTable("event", (table) => {
    table.increments("event_id").primary();
    table
      .integer("competition_id")
      .references("competition_id")
      .inTable("competition")
      .onDelete("CASCADE");
    table.string("title", 100);
    table.timestamp("start_date_time");
    table.timestamp("end_date_time");
    table.integer("rounds");
  });

  // judge_registration
  await knex.schema.createTable("judge_registration", (table) => {
    table.increments("jregistration_id").primary();
    table
      .integer("competition_id")
      .references("competition_id")
      .inTable("competition")
      .onDelete("CASCADE");
    table
      .integer("judge_id")
      .references("judge_id")
      .inTable("judge")
      .onDelete("CASCADE");
    table.date("jregistration_date").defaultTo(knex.fn.now());
  });

  // dancer_registration
  await knex.schema.createTable("dancer_registration", (table) => {
    table.increments("dregistration_id").primary();
    table
      .integer("competition_id")
      .references("competition_id")
      .inTable("competition")
      .onDelete("CASCADE");
    table
      .integer("dancer_id")
      .references("dancer_id")
      .inTable("dancer")
      .onDelete("CASCADE");
    table
      .integer("event_id")
      .references("event_id")
      .inTable("event")
      .onDelete("CASCADE");
    table.date("dregistration_date").defaultTo(knex.fn.now());
    table.boolean("lead");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("dancer_registration");
  await knex.schema.dropTableIfExists("judge_registration");
  await knex.schema.dropTableIfExists("event");
  await knex.schema.dropTableIfExists("addcodes");
  await knex.schema.dropTableIfExists("competition");
  await knex.schema.dropTableIfExists("admins");
  await knex.schema.dropTableIfExists("dancer");
  await knex.schema.dropTableIfExists("judge");
  await knex.schema.dropTableIfExists("organizer");
  await knex.schema.dropTableIfExists("user");
};