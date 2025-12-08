/**
 * @param { import("knex").Knex } knex
 */
exports.seed = async function (knex) {
  // Clear all tables in correct order (respecting foreign keys)
  await knex("dancer_registration").del();
  await knex("judge_registration").del();
  await knex("event").del();
  await knex("addcodes").del();
  await knex("competition").del();
  await knex("admins").del();
  await knex("dancer").del();
  await knex("judge").del();
  await knex("organizer").del();
  await knex("user").del();

  // Insert users and get their IDs
  const users = await knex("user")
    .insert([
      {
        first_name: "Alice",
        last_name: "Johnson",
        username: "alicej",
        password: "password123",
        phone_number: "555-111-2222",
        birthday: "1990-05-15",
      },
      {
        first_name: "Bob",
        last_name: "Smith",
        username: "bobsmith",
        password: "securepass",
        phone_number: "555-333-4444",
        birthday: "1985-08-20",
      },
      {
        first_name: "Carol",
        last_name: "Davis",
        username: "carold",
        password: "mypassword",
        phone_number: "555-555-6666",
        birthday: "1992-12-01",
      },
      {
        first_name: "David",
        last_name: "Lee",
        username: "davidl",
        password: "passw0rd",
        phone_number: "555-777-8888",
        birthday: "1988-03-10",
      },
      {
        first_name: "Allen",
        last_name: "Schultz",
        username: "a",
        password: "a",
        phone_number: "555-999-0000",
        birthday: "1980-01-01",
      },
    ])
    .returning("*");

  // Insert organizers and get their IDs
  const organizers = await knex("organizer")
    .insert([
      { user_id: users[0].user_id, recognized: true, addcodeused: "ORG-9F3KD2" },
      { user_id: users[1].user_id, recognized: false, addcodeused: "ORG-PQ8ZL1" },
    ])
    .returning("*");

  // Insert judges and get their IDs
  const judges = await knex("judge")
    .insert([
      {
        user_id: users[2].user_id,
        highest_to_judge: "Professional",
        istd_certified: true,
        addcodeused: "JDG-AB12CD",
      },
      {
        user_id: users[3].user_id,
        highest_to_judge: "Amateur",
        istd_certified: false,
        addcodeused: "JDG-X91PLT",
      },
    ])
    .returning("*");

  // Insert dancers and get their IDs
  const dancers = await knex("dancer")
    .insert([
      {
        user_id: users[0].user_id,
        ndca_number: 12345,
        ndca_expiration: "2026-05-15",
        type: "Lead",
      },
      {
        user_id: users[1].user_id,
        ndca_number: 67890,
        ndca_expiration: "2026-08-20",
        type: "Follow",
      },
      {
        user_id: users[2].user_id,
        ndca_number: 54321,
        ndca_expiration: "2026-12-01",
        type: "Lead",
      },
    ])
    .returning("*");

  // Insert admin
  await knex("admins").insert([{ user_id: users[4].user_id }]);

  // Insert competitions and get their IDs
  const competitions = await knex("competition")
    .insert([
      { organizer_id: organizers[0].organizer_id, location: "New York City Ballroom", sanctioned: true },
      { organizer_id: organizers[1].organizer_id, location: "Los Angeles Dance Hall", sanctioned: false },
    ])
    .returning("*");

  // Insert addcodes
  await knex("addcodes").insert([
    { competition_id: null, code: "ORG-9F3KD2", codetype: "Organizer" },
    { competition_id: null, code: "ORG-PQ8ZL1", codetype: "Organizer" },
    { competition_id: null, code: "ORG-K27MHD", codetype: "Organizer" },
    { competition_id: competitions[0].competition_id, code: "JDG-AB12CD", codetype: "Judge" },
    { competition_id: competitions[1].competition_id, code: "JDG-X91PLT", codetype: "Judge" },
    { competition_id: competitions[1].competition_id, code: "JDG-FF72QW", codetype: "Judge" },
  ]);

  // Insert events and get their IDs
  const events = await knex("event")
    .insert([
      {
        competition_id: competitions[0].competition_id,
        title: "Waltz Championship",
        start_date_time: "2025-11-20 18:00:00",
        end_date_time: "2025-11-20 21:00:00",
        rounds: 3,
      },
      {
        competition_id: competitions[0].competition_id,
        title: "Tango Showdown",
        start_date_time: "2025-11-21 19:00:00",
        end_date_time: "2025-11-21 22:00:00",
        rounds: 4,
      },
      {
        competition_id: competitions[1].competition_id,
        title: "Foxtrot Classic",
        start_date_time: "2025-12-05 17:00:00",
        end_date_time: "2025-12-05 20:00:00",
        rounds: 2,
      },
    ])
    .returning("*");

  // Insert judge registrations
  await knex("judge_registration").insert([
    { competition_id: competitions[0].competition_id, judge_id: judges[0].judge_id },
    { competition_id: competitions[1].competition_id, judge_id: judges[1].judge_id },
  ]);

  // Insert dancer registrations
  await knex("dancer_registration").insert([
    {
      competition_id: competitions[0].competition_id,
      dancer_id: dancers[0].dancer_id,
      event_id: events[0].event_id,
      lead: true,
    },
    {
      competition_id: competitions[0].competition_id,
      dancer_id: dancers[1].dancer_id,
      event_id: events[0].event_id,
      lead: false,
    },
    {
      competition_id: competitions[0].competition_id,
      dancer_id: dancers[2].dancer_id,
      event_id: events[1].event_id,
      lead: true,
    },
  ]);
};