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

# Run migrations
echo "🗄️  Running database migrations..."
if npm run migration:run; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed or no pending migrations"
fi

# Start the application
echo "🎯 Starting application..."
exec "$@"
