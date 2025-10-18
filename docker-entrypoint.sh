#!/bin/sh
set -e

echo "🚀 Starting AutoFix Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432}; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is up!"

# Run migrations using compiled JavaScript
echo "🗄️  Running database migrations..."
cd /app
node -e "
const { AppDataSource } = require('./dist/database/data-source');

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source initialized');
    await AppDataSource.runMigrations();
    console.log('✅ Migrations completed successfully');
    await AppDataSource.destroy();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
"

# Start the application
echo "🎯 Starting application..."
exec "$@"
