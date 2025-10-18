import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'garage_platform',
  entities: [path.join(__dirname, '../entities/**/*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, './migrations/**/*{.ts,.js}')],
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development',
});
