INSERT INTO "User" (First_name, Last_name, Username, Password, Phone_number, Birthday)
VALUES
('Alice', 'Johnson', 'alicej', 'password123', '555-111-2222', '1990-05-15'),
('Bob', 'Smith', 'bobsmith', 'securepass', '555-333-4444', '1985-08-20'),
('Carol', 'Davis', 'carold', 'mypassword', '555-555-6666', '1992-12-01'),
('David', 'Lee', 'davidl', 'passw0rd', '555-777-8888', '1988-03-10'),
('Allen', 'Schultz', 'a', 'a', '555-999-0000', '1980-01-01');

INSERT INTO Organizer (User_ID, Recognized, addcodeused)
VALUES
(1, TRUE,'ORG-9F3KD2'),   -- Alice (User_ID = 1)
(2, FALSE, 'ORG-PQ8ZL1');  -- Bob (User_ID = 2)

INSERT INTO Judge (User_ID, Highest_to_judge, ISTD_certified, addcodeused)
VALUES
(3, 'Professional', TRUE, 'JDG-AB12CD'),  -- Carol (User_ID = 3)
(4, 'Amateur', FALSE, 'JDG-X91PLT');      -- David (User_ID = 4)

INSERT INTO Dancer (User_ID, NDCA_number, NDCA_expiration, Type)
VALUES
(1, 12345, '2026-05-15', 'Lead'),   -- Alice
(2, 67890, '2026-08-20', 'Follow'), -- Bob
(3, 54321, '2026-12-01', 'Lead');   -- Carol

INSERT INTO Admins (User_ID)
VALUES
(5);  -- Allen

-- Organizers will be IDs 1-2, so reference them correctly
INSERT INTO Competition (Organizer_ID, Location, Sanctioned)
VALUES
(1, 'New York City Ballroom', TRUE),  -- Organizer_ID = 1 (Alice)
(2, 'Los Angeles Dance Hall', FALSE); -- Organizer_ID = 2 (Bob)

-- AddCodes with NULL competition
INSERT INTO AddCodes (Competition_ID, Code, CodeType)
VALUES
    (NULL, 'ORG-9F3KD2', 'Organizer'),
    (NULL, 'ORG-PQ8ZL1', 'Organizer'),
    (NULL, 'ORG-K27MHD', 'Organizer');

-- AddCodes with competitions 1-2
INSERT INTO AddCodes (Competition_ID, Code, CodeType)
VALUES
    (1, 'JDG-AB12CD', 'Judge'),  -- Competition 1
    (2, 'JDG-X91PLT', 'Judge'),  -- Competition 2
    (2, 'JDG-FF72QW', 'Judge');  -- Competition 2

-- Events for competitions 1-2
INSERT INTO Event (Competition_ID, Title, Start_date_time, End_date_time, Rounds)
VALUES
(1, 'Waltz Championship', '2025-11-20 18:00:00', '2025-11-20 21:00:00', 3),
(1, 'Tango Showdown', '2025-11-21 19:00:00', '2025-11-21 22:00:00', 4),
(2, 'Foxtrot Classic', '2025-12-05 17:00:00', '2025-12-05 20:00:00', 2);

-- Judge registrations (Judge IDs are 1-2)
INSERT INTO Judge_Registration (Competition_ID, Judge_ID, JRegistration_date)
VALUES
(1, 1, CURRENT_DATE),  -- Judge 1 (Carol) judging competition 1
(2, 2, CURRENT_DATE);  -- Judge 2 (David) judging competition 2

-- Dancer registrations (Dancer IDs are 1-3, Event IDs are 1-3)
INSERT INTO Dancer_Registration (Competition_ID, Dancer_ID, Event_ID, DRegistration_date, Lead)
VALUES
(1, 1, 1, CURRENT_DATE, TRUE),   -- Dancer 1 (Alice) in Event 1
(1, 2, 1, CURRENT_DATE, FALSE),  -- Dancer 2 (Bob) in Event 1
(1, 3, 2, CURRENT_DATE, TRUE);   -- Dancer 3 (Carol) in Event 2