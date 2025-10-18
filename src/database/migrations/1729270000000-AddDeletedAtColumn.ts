import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeletedAtColumn1729270000000 implements MigrationInterface {
  name = 'AddDeletedAtColumn1729270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add deletedAt column to all tables that extend BaseEntity
    await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "categories" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "services" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "garages" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "garage_services" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "reservations" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "reviews" ADD "deletedAt" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD "deletedAt" TIMESTAMP`);

    // Add sortOrder to categories if it doesn't exist
    await queryRunner.query(`ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sortOrder" integer NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove deletedAt column from all tables
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "reservations" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "garage_services" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "garages" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    
    // Remove sortOrder from categories
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "sortOrder"`);
  }
}
