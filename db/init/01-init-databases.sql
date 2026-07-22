-- ============================================================================
-- AutoHub — PostgreSQL bootstrap
-- Runs automatically on first container start (mounted into
-- /docker-entrypoint-initdb.d). Creates the shared role and the four
-- environment databases requested for the project.
--
-- SECURITY NOTE: password is inlined here for LOCAL/DEV convenience only,
-- per the project request. Replace with a secrets-managed credential in
-- QA/UAT/PROD. See docs/architecture/security-kyc.md.
-- ============================================================================

-- Shared application role (owner of all environment databases)
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'automobiles') THEN
      CREATE ROLE automobiles WITH LOGIN PASSWORD 'Automobiles_DB@12345';
   END IF;
END
$$;

-- Environment databases. CREATE DATABASE cannot run inside a DO/transaction block,
-- so each is guarded with \gexec against pg_database.
SELECT 'CREATE DATABASE "AutomobilesDB_Dev"  OWNER automobiles'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutomobilesDB_Dev')\gexec

SELECT 'CREATE DATABASE "AutomobilesDB_QA"   OWNER automobiles'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutomobilesDB_QA')\gexec

SELECT 'CREATE DATABASE "AutomobilesDB_UAT"  OWNER automobiles'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutomobilesDB_UAT')\gexec

SELECT 'CREATE DATABASE "AutomobilesDB_PROD" OWNER automobiles'
 WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AutomobilesDB_PROD')\gexec

-- Ensure the role can connect and has privileges on each DB.
GRANT ALL PRIVILEGES ON DATABASE "AutomobilesDB_Dev"  TO automobiles;
GRANT ALL PRIVILEGES ON DATABASE "AutomobilesDB_QA"   TO automobiles;
GRANT ALL PRIVILEGES ON DATABASE "AutomobilesDB_UAT"  TO automobiles;
GRANT ALL PRIVILEGES ON DATABASE "AutomobilesDB_PROD" TO automobiles;
