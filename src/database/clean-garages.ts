import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function cleanGarages() {
  console.log('⚠️  WARNING: This will delete ALL garages from the database!\n');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    const answer = await askQuestion(
      'Are you sure you want to continue? (yes/no): ',
    );

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      rl.close();
      await AppDataSource.destroy();
      process.exit(0);
    }

    const garageRepository = AppDataSource.getRepository('Garage');

    const count = await garageRepository.count();
    console.log(`\n📊 Found ${count} garages to delete\n`);

    const confirm = await askQuestion(
      `Delete ${count} garages? Type 'DELETE' to confirm: `,
    );

    if (confirm !== 'DELETE') {
      console.log('❌ Operation cancelled');
      rl.close();
      await AppDataSource.destroy();
      process.exit(0);
    }

    await garageRepository.delete({});
    console.log(`\n✅ Successfully deleted ${count} garages`);

    rl.close();
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during cleanup:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    rl.close();
    await AppDataSource.destroy();
    process.exit(1);
  }
}

cleanGarages();
