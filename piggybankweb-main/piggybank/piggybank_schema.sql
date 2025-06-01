-- Piggybank + Expense Tracker SQL Schema

-- Create the database (if not already created)
CREATE DATABASE IF NOT EXISTS piggybank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE piggybank;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id VARCHAR(32) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('deposit', 'expense') NOT NULL,
    category VARCHAR(64), -- NULL for deposits, required for expenses
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
