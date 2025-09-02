-- Party-Time Database Seed Data
-- Development and testing data

-- Insert sample admin user
INSERT INTO users (id, email, first_name, last_name, role, is_active, is_verified, phone, timezone) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@party-time.com', 'Admin', 'User', 'admin', true, true, '+1-555-0100', 'America/Los_Angeles'),
('550e8400-e29b-41d4-a716-446655440001', 'planner@party-time.com', 'Event', 'Planner', 'planner', true, true, '+1-555-0101', 'America/Los_Angeles'),
('550e8400-e29b-41d4-a716-446655440002', 'guest@party-time.com', 'Guest', 'User', 'guest', true, true, '+1-555-0102', 'America/Los_Angeles');

-- Insert sample events
INSERT INTO events (id, name, description, type, status, start_date, end_date, location, venue_name, max_guests, planner_id, budget_total, is_public) VALUES
('550e8400-e29b-41d4-a716-446655440010', 
 'John & Sarah Wedding', 
 'A beautiful outdoor wedding ceremony and reception', 
 'wedding', 
 'active', 
 '2024-06-15 16:00:00+00', 
 '2024-06-15 23:00:00+00', 
 'Napa Valley, CA', 
 'Vintners Resort', 
 150, 
 '550e8400-e29b-41d4-a716-446655440001', 
 25000.00, 
 true),

('550e8400-e29b-41d4-a716-446655440011', 
 'Tech Company Annual Party', 
 'Annual celebration for all employees and their families', 
 'corporate', 
 'draft', 
 '2024-07-20 18:00:00+00', 
 '2024-07-20 22:00:00+00', 
 'San Francisco, CA', 
 'Golden Gate Park Pavilion', 
 300, 
 '550e8400-e29b-41d4-a716-446655440001', 
 15000.00, 
 false),

('550e8400-e29b-41d4-a716-446655440012', 
 'Emma 30th Birthday Bash', 
 'Surprise birthday party for Emma', 
 'birthday', 
 'active', 
 '2024-05-10 19:00:00+00', 
 '2024-05-10 23:30:00+00', 
 'Los Angeles, CA', 
 'Rooftop Venue Downtown', 
 50, 
 '550e8400-e29b-41d4-a716-446655440001', 
 3000.00, 
 true);

-- Insert sample guests for the wedding
INSERT INTO guests (event_id, email, first_name, last_name, phone, rsvp_status, plus_one_allowed, dietary_restrictions) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'mike.johnson@email.com', 'Mike', 'Johnson', '+1-555-0201', 'attending', true, 'Vegetarian'),
('550e8400-e29b-41d4-a716-446655440010', 'lisa.smith@email.com', 'Lisa', 'Smith', '+1-555-0202', 'attending', true, NULL),
('550e8400-e29b-41d4-a716-446655440010', 'david.brown@email.com', 'David', 'Brown', '+1-555-0203', 'pending', false, 'Gluten-free'),
('550e8400-e29b-41d4-a716-446655440010', 'anna.wilson@email.com', 'Anna', 'Wilson', '+1-555-0204', 'not_attending', false, NULL),
('550e8400-e29b-41d4-a716-446655440010', 'robert.davis@email.com', 'Robert', 'Davis', '+1-555-0205', 'maybe', true, 'No seafood');

-- Insert sample guests for the birthday party
INSERT INTO guests (event_id, email, first_name, last_name, rsvp_status, plus_one_allowed) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'tom.garcia@email.com', 'Tom', 'Garcia', 'attending', false),
('550e8400-e29b-41d4-a716-446655440012', 'maria.rodriguez@email.com', 'Maria', 'Rodriguez', 'attending', false),
('550e8400-e29b-41d4-a716-446655440012', 'chris.martinez@email.com', 'Chris', 'Martinez', 'pending', true);

-- Insert budget categories for the wedding
INSERT INTO budget_categories (event_id, name, allocated_amount, color) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'Venue & Catering', 12000.00, '#FF6B6B'),
('550e8400-e29b-41d4-a716-446655440010', 'Photography & Video', 3500.00, '#4ECDC4'),
('550e8400-e29b-41d4-a716-446655440010', 'Flowers & Decorations', 2500.00, '#45B7D1'),
('550e8400-e29b-41d4-a716-446655440010', 'Music & Entertainment', 2000.00, '#FFA726'),
('550e8400-e29b-41d4-a716-446655440010', 'Transportation', 1500.00, '#AB47BC'),
('550e8400-e29b-41d4-a716-446655440010', 'Miscellaneous', 3500.00, '#66BB6A');

-- Insert budget categories for the birthday party
INSERT INTO budget_categories (event_id, name, allocated_amount, color) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'Venue Rental', 800.00, '#FF6B6B'),
('550e8400-e29b-41d4-a716-446655440012', 'Food & Drinks', 1200.00, '#4ECDC4'),
('550e8400-e29b-41d4-a716-446655440012', 'Decorations', 300.00, '#45B7D1'),
('550e8400-e29b-41d4-a716-446655440012', 'Entertainment', 500.00, '#FFA726'),
('550e8400-e29b-41d4-a716-446655440012', 'Other', 200.00, '#66BB6A');

-- Insert sample expenses for the wedding
INSERT INTO expenses (event_id, category_id, name, description, amount, expense_date, vendor_name, is_paid) VALUES
('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM budget_categories WHERE event_id = '550e8400-e29b-41d4-a716-446655440010' AND name = 'Venue & Catering'),
 'Venue Deposit', 'Initial deposit for Vintners Resort', 2500.00, '2024-01-15', 'Vintners Resort', true),

('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM budget_categories WHERE event_id = '550e8400-e29b-41d4-a716-446655440010' AND name = 'Photography & Video'),
 'Wedding Photography', 'Full day wedding photography package', 3000.00, '2024-02-01', 'Snapshot Studios', false),

('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM budget_categories WHERE event_id = '550e8400-e29b-41d4-a716-446655440010' AND name = 'Flowers & Decorations'),
 'Bridal Bouquet', 'Bridal and bridesmaid bouquets', 450.00, '2024-03-01', 'Bloom & Blossom', false);

-- Insert sample vendors
INSERT INTO vendors (name, type, contact_email, contact_phone, address, website, rating) VALUES
('Vintners Resort', 'venue', 'events@vintnersresort.com', '+1-707-555-0100', '4350 Barnes Rd, Santa Rosa, CA 95403', 'https://vintnersresort.com', 4.8),
('Snapshot Studios', 'photographer', 'hello@snapshotstudios.com', '+1-415-555-0200', '123 Photo St, San Francisco, CA 94102', 'https://snapshotstudios.com', 4.9),
('Bloom & Blossom', 'florist', 'orders@bloomblossom.com', '+1-707-555-0300', '456 Flower Ave, Napa, CA 94558', 'https://bloomblossom.com', 4.7),
('DJ Excellence', 'entertainment', 'bookings@djexcellence.com', '+1-415-555-0400', '789 Music Blvd, Oakland, CA 94601', 'https://djexcellence.com', 4.6),
('Gourmet Catering Co', 'caterer', 'info@gourmetcatering.com', '+1-650-555-0500', '321 Culinary Way, Palo Alto, CA 94301', 'https://gourmetcatering.com', 4.5);

-- Link vendors to events
INSERT INTO event_vendors (event_id, vendor_id, service_description, contract_amount, contract_date, is_confirmed) VALUES
('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM vendors WHERE name = 'Vintners Resort'),
 'Wedding venue and reception hall rental', 8000.00, '2024-01-15', true),

('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM vendors WHERE name = 'Snapshot Studios'),
 'Full day wedding photography and videography', 3000.00, '2024-02-01', true),

('550e8400-e29b-41d4-a716-446655440010', 
 (SELECT id FROM vendors WHERE name = 'Bloom & Blossom'),
 'Wedding flowers and centerpieces', 1800.00, '2024-03-01', false);