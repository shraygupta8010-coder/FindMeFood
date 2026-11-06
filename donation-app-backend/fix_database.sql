-- Fix Database Schema for FindMeFood App

-- Add missing columns to ngo_profiles table
ALTER TABLE ngo_profiles ADD COLUMN latitude REAL;
ALTER TABLE ngo_profiles ADD COLUMN longitude REAL;
ALTER TABLE ngo_profiles ADD COLUMN service_radius INTEGER DEFAULT 10;

-- Add missing columns to user_profiles table if they don't exist
ALTER TABLE user_profiles ADD COLUMN address TEXT;
ALTER TABLE user_profiles ADD COLUMN city TEXT;
ALTER TABLE user_profiles ADD COLUMN state TEXT;
ALTER TABLE user_profiles ADD COLUMN pincode TEXT;

-- Add missing columns to donations table if they don't exist
ALTER TABLE donations ADD COLUMN verification_data TEXT;
ALTER TABLE donations ADD COLUMN food_source TEXT;

-- Verify the table structures
SELECT 'ngo_profiles columns:' as '';
PRAGMA table_info(ngo_profiles);

SELECT 'user_profiles columns:' as '';
PRAGMA table_info(user_profiles);

SELECT 'donations columns:' as '';
PRAGMA table_info(donations);

SELECT 'Tables in database:' as '';
SELECT name FROM sqlite_master WHERE type='table';