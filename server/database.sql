-- -- Create the hivemind database
-- -- CREATE DATABASE hivemind;

-- -- Switch to the hivemind database
-- -- \c hivemind

-- -- Download and set the uuid-ossp extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- Table to store US universities
-- CREATE TABLE universities (
--     uni_id SERIAL PRIMARY KEY,
--     uni_name TEXT NOT NULL
-- );

-- -- Table to store user account information
-- CREATE TABLE users (
--     user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--     username VARCHAR(50) UNIQUE NOT NULL,
--     password TEXT NOT NULL,
--     email VARCHAR(100) UNIQUE NOT NULL
-- );

-- -- Table to store courses within universities
-- CREATE TABLE courses (
--     course_id SERIAL PRIMARY KEY,
--     course_name TEXT NOT NULL,
--     uni_id INT REFERENCES universities(uni_id) ON DELETE CASCADE
-- );

-- -- Table to store modules within each course
-- CREATE TABLE modules (
--     module_id SERIAL PRIMARY KEY,
--     module_name TEXT NOT NULL,
--     course_id INT REFERENCES courses(course_id) ON DELETE CASCADE
-- );

-- -- Table to store post information (PDFs, JPEGs, PNGs)
-- CREATE TABLE posts (
--     post_id SERIAL PRIMARY KEY,
--     post_type TEXT CHECK (post_type IN ('pdf', 'jpeg', 'png')) NOT NULL,
--     post_content BYTEA NOT NULL, -- Can store binary files like PDFs or images
--     module_id INT REFERENCES modules(module_id) ON DELETE CASCADE,
--     user_id uuid REFERENCES users(user_id) ON DELETE CASCADE, -- Changed to UUID
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Table to store upvotes and downvotes for posts
-- CREATE TABLE post_votes (
--     vote_id SERIAL PRIMARY KEY,
--     post_id INT REFERENCES posts(post_id) ON DELETE CASCADE,
--     user_id uuid REFERENCES users(user_id) ON DELETE CASCADE, -- Changed to UUID
--     vote_type BOOLEAN NOT NULL, -- TRUE for upvote, FALSE for downvote
--     UNIQUE (post_id, user_id) -- Ensure one vote per post per user
-- );

-- -- Table to store random words for username and password generation
-- CREATE TABLE words (
--     word_id SERIAL PRIMARY KEY,
--     word TEXT NOT NULL
-- );

-- -- Table to store course enrollments
-- CREATE TABLE enrollments (
--     enrollment_id SERIAL PRIMARY KEY,
--     user_id uuid REFERENCES users(user_id) ON DELETE CASCADE, -- Changed to UUID
--     course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
--     UNIQUE (user_id, course_id) -- One user can enroll in each course only once
-- );

-- -- Optional: Table for additional information about users and their activity
-- CREATE TABLE user_activity (
--     activity_id SERIAL PRIMARY KEY,
--     user_id uuid REFERENCES users(user_id) ON DELETE CASCADE, -- Changed to UUID
--     last_login TIMESTAMP,
--     account_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
