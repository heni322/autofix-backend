import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedGarages } from './seeders/garage.seeder';
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
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'garage_platform',
  entities: [path.join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  synchronize: false,
});

async function runSeed() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run category seeder first (before garages)
    await seedCategories(AppDataSource);
    console.log('');

    // Run garage seeder
    await seedGarages(AppDataSource);

    console.log('\n✅ All seeders completed successfully!');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Seeding failed:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    await AppDataSource.destroy();
    process.exit(1);
  }
}

void runSeed();
