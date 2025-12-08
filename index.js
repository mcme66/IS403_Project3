require('dotenv').config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const knexConfig = require("./knexfile");
const environment = process.env.NODE_ENV || "development";
const knex = require("knex")(knexConfig[environment]);

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Global authentication middleware - runs on EVERY request 
app.use((req, res, next) => {
    // Skip authentication for login routes 
    if (req.path === '/' || req.path === '/login' || req.path === '/logout' || req.path === '/users/add') { 
        return next(); // Just process the request 
    } 
    if (req.session.isLoggedIn) { 
        next(); // user is logged in, continue 
    } 
    else { 
        res.render("login", { error_message: "Please log in to access this page" }); 
    } 
});

// Root route
app.get("/", function (req, res) {
  if (req.session.isLoggedIn) {
    res.render("index");
  } else {
    res.render("login", { error_message: "" });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error_message: '' });
});

app.post('/login', (req, res) => {
  const sName = req.body.username;
  const sPassword = req.body.password;

  knex("user")
    .where({ username: sName, password: sPassword })
    .then(users => {
      if (users.length === 0) {
        return res.render('login', { error_message: 'Invalid username or password' });
      }

      const user = users[0];

      // Create the session user object now
      req.session.user = {
        user_id: user.user_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        isDancer: false,
        isJudge: false,
        isOrganizer: false
      };

      // Run all role checks (return promises so we can wait for them)
      const dancerQuery = knex("dancer").where({ user_id: user.user_id });
      const judgeQuery = knex("judge").where({ user_id: user.user_id });
      const organizerQuery = knex("organizer").where({ user_id: user.user_id });

      return Promise.all([dancerQuery, judgeQuery, organizerQuery]);
    })
    .then(([dancers, judges, organizers]) => {
      // Set the roles after queries resolve
      req.session.user.isDancer = dancers.length > 0;
      req.session.user.isJudge = judges.length > 0;
      req.session.user.isOrganizer = organizers.length > 0;

      req.session.isLoggedIn = true;

      res.redirect('/');
    })
    .catch(err => {
      console.error('Login error:', err);
      res.render('login', { error_message: 'Login failed. Try again.' });
    });
});

// --------------------- USERS CRUD ---------------------

app.get("/users", function (req, res) {
  knex.select().from("user")
    .then(function(users) {
      res.render("displayUsers", { users: users , user: req.session.user});
    })
    .catch(function(err) {
      console.error(err);
      res.send("Error retrieving users");
    });
});

app.get("/users/add", function (req, res) {
  res.render("users_form", { user: {}, action: "/users/add" });
});

app.post("/users/add", function (req, res) {
  const role = req.body.role;
  const addcode = req.body.add_code;
  // 1. VALIDATE ADD CODE FOR JUDGE & ORGANIZER
  let addCodeCheck = Promise.resolve();
  if (role === "Judge" || role === "Organizer") {
    addCodeCheck = knex("addcodes")
      .where("code", addcode)
      .first() // Make sure we only get one row
      .then(function (validCode) {
        if (!validCode) {
          // Add code is invalid
          throw new Error("INVALID_ADD_CODE");
        }
      });
  }
  addCodeCheck
    .then(function () {
      // 2. CHECK USERNAME UNIQUENESS
      return knex("user")
        .where("username", req.body.username)
        .first()
        .then(function (existinguser) {
          if (existinguser) {
            throw new Error("USERNAME_TAKEN");
          }
          // username is free, continue
          const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            password: req.body.password,
            phone_number: req.body.phone_number,
            birthday: req.body.birthday,
          };
          return knex("user").insert(userData).returning("user_id");
        });
    })
    .then(function (ids) {
      const userid = ids[0].user_id;
      // 3. INSERT ROLE-SPECIFIC RECORD
      if (role === "Judge") {
        return knex("judge").insert({
          user_id: userid,
          highest_to_judge: "", // removed requirement
          istd_certified: req.body.istd_certified === "on",
          addcodeused: addcode
        });
      } else if (role === "Dancer") {
        return knex("dancer").insert({
          user_id: userid,
          ndca_number: req.body.ndca_number,
          ndca_expiration: req.body.ndca_expiration,
          type: req.body.type
        });
      } else if (role === "Organizer") {
        return knex("organizer").insert({
          user_id: userid,
          recognized: req.body.recognized === "on",
          addcodeused: addcode
        });
      }
    })
    .then(function () {
      res.redirect("/");
    })
    .catch(function (err) {
      // 5. ERROR HANDLING
      if (err.message === "INVALID_ADD_CODE") {
        res.render("users_form", {
          error: "Invalid add code.",
          user: req.body,
          action: "/users/add"
        });
      } else if (err.message === "USERNAME_TAKEN") {
        res.render("users_form", {
          error: "username already exists.",
          user: req.body,
          action: "/users/add"
        });
      } else {
        console.error(err);
        res.render("users_form", {
          error: "Error adding user.",
          user: req.body,
          action: "/users/add"
        });
      }
    });
});

app.get("/users/edit/:id", function (req, res) {
  const id = req.params.id;
  knex("user").where("user_id", id).first()
    .then(function(user) {
      res.render("users_edit", { user: user, action: "/users/edit/" + id });
    });
});

app.post("/users/edit/:id", function (req, res) {
  const id = req.params.id;
  knex("user").where("user_id", id)
    .update({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      phone_number: req.body.phone_number,
      birthday: req.body.birthday
    })
    .then(function() {
      res.redirect("/users");
    });
});

app.get("/users/delete/:id", function (req, res) {
  knex("user").where("user_id", req.params.id).del()
    .then(function() {
      res.redirect("/users");
    });
});


// --------------------- COMPETITIONS CRUD ---------------------

app.get("/competitions", function (req, res) {
  knex.select().from("competition")
    .then(function(competitions) {
      res.render("competitions_list", { competitions: competitions , user: req.session.user});
    });
});

app.get("/competitions/add", function (req, res) {
  res.render("competitions_form", { competition: {}, action: "/competitions/add" });
});

app.post("/competitions/add", function (req, res) {
  knex("competition").insert({
    organizer_id: req.body.organizer_id || null,
    location: req.body.location,
    sanctioned: req.body.sanctioned === "on"
  })
  .then(function() {
    res.redirect("/competitions");
  });
});

app.get("/competitions/edit/:id", function (req, res) {
  knex("competition").where("competition_id", req.params.id).first()
    .then(function(competition) {
      res.render("competitions_form", { competition: competition, action: "/competitions/edit/" + req.params.id });
    });
});

app.post("/competitions/edit/:id", function (req, res) {
  knex("competition").where("competition_id", req.params.id)
    .update({
      organizer_id: req.body.organizer_id || null,
      location: req.body.location,
      sanctioned: req.body.sanctioned === "on"
    })
    .then(function() {
      res.redirect("/competitions");
    });
});

app.get("/competitions/delete/:id", function (req, res) {
  knex("competition").where("competition_id", req.params.id).del()
    .then(function() {
      res.redirect("/competitions");
    });
});

// --------------------- EVENTS CRUD ---------------------

app.get("/events", function (req, res) {
  knex.select().from("event")
    .then(function(events) {
      res.render("events_list", { events: events, user: req.session.user});
    });
});

app.get("/events/add", function (req, res) {
  res.render("events_form", { event: {}, action: "/events/add" });
});

app.post("/events/add", function (req, res) {
  knex("event").insert({
    competition_id: req.body.competition_id || null,
    title: req.body.title,
    start_date_time: req.body.start_date_time,
    end_date_time: req.body.end_date_time,
    rounds: req.body.rounds
  })
  .then(function() {
    res.redirect("/events");
  });
});

app.get("/events/edit/:id", function (req, res) {
  knex("event").where("event_id", req.params.id).first()
    .then(function(event) {
      res.render("events_form", { event: event, action: "/events/edit/" + req.params.id });
    });
});

app.post("/events/edit/:id", function (req, res) {
  knex("event").where("event_id", req.params.id)
    .update({
      competition_id: req.body.competition_id || null,
      title: req.body.title,
      start_date_time: req.body.start_date_time,
      end_date_time: req.body.end_date_time,
      rounds: req.body.rounds
    })
    .then(function() {
      res.redirect("/events");
    });
});

app.get("/events/delete/:id", function (req, res) {
  knex("event").where("event_id", req.params.id).del()
    .then(function() {
      res.redirect("/events");
    });
});

app.listen(port, function () {
  console.log("Server running on port " + port);
});