-- -- Enable UUID generation extension (required for gen_random_uuid)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -- Create users table
-- CREATE TABLE users (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- unique user ID
--   name TEXT NOT NULL,                            -- user display name
--   email TEXT UNIQUE NOT NULL,                    -- user email (must be unique)
--   created_at TIMESTAMPTZ DEFAULT now()           -- timestamp of creation
-- );

-- INSERT INTO users (name, email) VALUES ('Keval Ambani', 'ambanikeval2@gmail.com');

-- SELECT * FROM users;

-- CREATE TABLE projects (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),         -- unique project ID
--   user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- link to user
--   title TEXT NOT NULL,                                   -- project title
--   description TEXT,                                      -- optional project description
--   cover_image_url TEXT,                                  -- optional cover image
--   content JSONB NOT NULL,                                -- JSON storing slides
--   status TEXT DEFAULT 'active',                          -- active / trashed
--   created_at TIMESTAMPTZ DEFAULT now(),                  -- creation timestamp
--   updated_at TIMESTAMPTZ DEFAULT now()                   -- last modified timestamp
-- );

-- INSERT INTO projects (user_id, title, description, cover_image_url, content)
-- VALUES 
-- (
--   '49615da1-95be-4cb9-83e4-b41e5b235ff6',
--   'Q4 Financial Report & Analysis',
--   'Sample project for Q4 analysis',
--   'https://images.unsplash.com/photo-1487088678257-3a541e6e3922?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
--   '{"slides":[{"title":"Slide 1","content":"Placeholder content"}]}'
-- ),
-- (
--   '49615da1-95be-4cb9-83e4-b41e5b235ff6',
--   'Project Phoenix - Marketing Kickoff',
--   'Marketing kickoff sample project',
--   'https://images.unsplash.com/32/Mc8kW4x9Q3aRR3RkP5Im_IMG_4417.jpg?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
--   '{"slides":[{"title":"Slide 1","content":"Placeholder content"}]}'
-- ),
-- (
--   '49615da1-95be-4cb9-83e4-b41e5b235ff6',
--   'New App UI/UX Design Flow',
--   'Sample app design flow',
--   'https://images.unsplash.com/photo-1472289065668-ce650ac443d2?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
--   '{"slides":[{"title":"Slide 1","content":"Placeholder content"}]}'
-- ),
-- (
--   '49615da1-95be-4cb9-83e4-b41e5b235ff6',
--   'Technology Stack 2024 Overview',
--   'Sample tech stack presentation',
--   'https://plus.unsplash.com/premium_photo-1668790459273-8d8061d35d36?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
--   '{"slides":[{"title":"Slide 1","content":"Placeholder content"}]}'
-- ),
-- (
--   '49615da1-95be-4cb9-83e4-b41e5b235ff6',
--   'Company Onboarding Presentation',
--   'Onboarding sample presentation',
--   'https://images.unsplash.com/photo-1487147264018-f937fba0c817?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHBwdCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D',
--   '{"slides":[{"title":"Slide 1","content":"Placeholder content"}]}'
-- ),
-- (
--   '49615da1-95be-4cb9-83e4-b41e5b235ff6',
--   'Minimalist Portfolio Draft',
--   'Draft portfolio project',
--   'https://images.unsplash.com/photo-1513077202514-c511b41bd4c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHBwdCUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D',
--   '{"slides":[{"title":"Slide 1","content":"Placeholder content"}]}'
-- );

select * from projects;

-- Using SQL queries to get table info

