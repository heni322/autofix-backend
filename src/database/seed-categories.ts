import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedCategories } from './seeders/category.seeder';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'garage_platform',
  entities: [path.join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  synchronize: false,
});

async function runCategorySeeder() {
  console.log('🚀 Starting category and services seeding...\n');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run category seeder only
    await seedCategories(AppDataSource);

    console.log('\n✅ Category seeder completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Seeding failed:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    await AppDataSource.destroy();
    process.exit(1);
  }
}

runCategorySeeder();
