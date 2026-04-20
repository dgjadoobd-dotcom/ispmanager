# Local PostgreSQL Setup for ISP Manager
# Run this script to set up your local database

Write-Host "Setting up local PostgreSQL database for ISP Manager..." -ForegroundColor Green

# Database connection details
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "ispmanager"
$DB_USER = "ispmanager"
$DB_PASSWORD = "y4fTF9MlTiMID8TT"

# PostgreSQL bin path
$PG_BIN = "C:\Program Files\PostgreSQL\18\bin"

# Create database and user
Write-Host "Creating database and user..." -ForegroundColor Yellow

# Note: This assumes you have admin access to postgres
# You may need to run this as postgres user or modify pg_hba.conf

try {
    # Create user
    & "$PG_BIN\psql.exe" -U postgres -h $DB_HOST -p $DB_PORT -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" postgres

    # Create database
    & "$PG_BIN\psql.exe" -U postgres -h $DB_HOST -p $DB_PORT -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" postgres

    # Grant permissions
    & "$PG_BIN\psql.exe" -U postgres -h $DB_HOST -p $DB_PORT -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" postgres

    Write-Host "Database setup complete!" -ForegroundColor Green
    Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
    Write-Host "User: $DB_USER" -ForegroundColor Cyan
    Write-Host "Host: $DB_HOST" -ForegroundColor Cyan
    Write-Host "Port: $DB_PORT" -ForegroundColor Cyan

} catch {
    Write-Host "Error setting up database: $_" -ForegroundColor Red
    Write-Host "You may need to run this script as administrator or configure PostgreSQL permissions." -ForegroundColor Yellow
}