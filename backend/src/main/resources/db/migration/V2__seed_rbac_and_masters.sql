-- ============================================================================
-- AutoHub — V2 seed: RBAC roles, permissions, role↔permission mapping,
-- and a starter set of master reference data.
-- (The SUPER_ADMIN user itself is seeded idempotently at app startup so the
--  password is hashed by the application's PasswordEncoder — see BootstrapDataInitializer.)
-- ============================================================================

INSERT INTO roles (code, name, description) VALUES
    ('SUPER_ADMIN', 'Super Admin', 'Full unrestricted access'),
    ('ADMIN',       'Administrator', 'Platform administration'),
    ('MODERATOR',   'Moderator', 'Content moderation'),
    ('SELLER',      'Seller', 'Can create marketplace listings (KYC required)'),
    ('BUYER',       'Buyer', 'Can make offers (KYC required)'),
    ('AUTHOR',      'Author', 'Can publish posts and travel blogs'),
    ('MEMBER',      'Member', 'Signed-up user; can comment and review'),
    ('GUEST',       'Guest', 'Anonymous read-only')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, description) VALUES
    ('post:create','Create car/bike posts'),
    ('post:update','Update own posts'),
    ('post:publish','Publish posts'),
    ('post:moderate','Moderate any post'),
    ('image:upload','Upload post images'),
    ('review:create','Create reviews'),
    ('comment:create','Create comments'),
    ('comment:moderate','Moderate comments'),
    ('listing:create','Create marketplace listings'),
    ('listing:approve','Approve/reject listings'),
    ('offer:create','Make offers on listings'),
    ('travel:create','Create travel blog posts'),
    ('tour:create','Create tour-guide tours'),
    ('community:create','Create communities'),
    ('kyc:submit','Submit own KYC'),
    ('kyc:review','Review/approve KYC'),
    ('master:manage','Manage master/reference data'),
    ('user:manage','Manage users'),
    ('role:manage','Manage roles & permissions'),
    ('report:review','Review moderation reports'),
    ('audit:read','Read audit log')
ON CONFLICT (code) DO NOTHING;

-- SUPER_ADMIN → all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ADMIN → everything except role:manage (reserved for super admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code <> 'role:manage'
WHERE r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

-- MODERATOR → moderation set
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.code IN ('post:moderate','comment:moderate','report:review','listing:approve','audit:read')
WHERE r.code = 'MODERATOR'
ON CONFLICT DO NOTHING;

-- SELLER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.code IN ('listing:create','kyc:submit','image:upload','post:create')
WHERE r.code = 'SELLER'
ON CONFLICT DO NOTHING;

-- BUYER
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.code IN ('offer:create','kyc:submit')
WHERE r.code = 'BUYER'
ON CONFLICT DO NOTHING;

-- AUTHOR
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.code IN ('post:create','post:update','post:publish','image:upload','travel:create','tour:create')
WHERE r.code = 'AUTHOR'
ON CONFLICT DO NOTHING;

-- MEMBER (signed-up user) → can engage
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p
  ON p.code IN ('comment:create','review:create','community:create')
WHERE r.code = 'MEMBER'
ON CONFLICT DO NOTHING;

-- ---- Starter masters ----
INSERT INTO master_fuel_types (name) VALUES ('Petrol'),('Diesel'),('Electric'),('Hybrid'),('CNG') ON CONFLICT DO NOTHING;
INSERT INTO master_body_types (name) VALUES ('Hatchback'),('Sedan'),('SUV'),('Coupe'),('Cruiser'),('Sportbike'),('Scooter') ON CONFLICT DO NOTHING;
INSERT INTO master_transmissions (name) VALUES ('Manual'),('Automatic'),('AMT'),('CVT'),('DCT') ON CONFLICT DO NOTHING;
INSERT INTO master_categories (name) VALUES ('Car'),('Bike') ON CONFLICT DO NOTHING;
INSERT INTO master_currencies (code, name) VALUES ('USD','US Dollar'),('EUR','Euro'),('INR','Indian Rupee'),('GBP','Pound Sterling') ON CONFLICT DO NOTHING;
INSERT INTO master_tour_categories (name) VALUES ('Road Trip'),('Adventure'),('City Tour'),('Off-road'),('Coastal') ON CONFLICT DO NOTHING;
INSERT INTO master_review_tags (name) VALUES ('Performance'),('Comfort'),('Value'),('Reliability'),('Design') ON CONFLICT DO NOTHING;
INSERT INTO master_report_reasons (name) VALUES ('Spam'),('Fraud'),('Offensive'),('Wrong Category'),('Duplicate') ON CONFLICT DO NOTHING;
INSERT INTO vehicle_makes (name, kind) VALUES ('Toyota','CAR'),('Honda','BOTH'),('BMW','BOTH'),('Royal Enfield','BIKE'),('Yamaha','BIKE'),('Tesla','CAR') ON CONFLICT DO NOTHING;
