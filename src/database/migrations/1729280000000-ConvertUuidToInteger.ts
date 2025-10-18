import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertUuidToInteger1729280000000 implements MigrationInterface {
  name = 'ConvertUuidToInteger1729280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop all foreign key constraints first
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_user"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_user"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_garage"`);
    await queryRunner.query(`ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_reservation"`);
    await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "FK_reservations_user"`);
    await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "FK_reservations_customer"`);
    await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "FK_reservations_garage"`);
    await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "FK_reservations_garage_service"`);
    await queryRunner.query(`ALTER TABLE "garage_services" DROP CONSTRAINT IF EXISTS "FK_garage_services_garage"`);
    await queryRunner.query(`ALTER TABLE "garage_services" DROP CONSTRAINT IF EXISTS "FK_garage_services_service"`);
    await queryRunner.query(`ALTER TABLE "garages" DROP CONSTRAINT IF EXISTS "FK_garages_owner"`);
    await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "FK_services_category"`);

    // Drop all tables
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reviews" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reservations" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "garage_services" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "garages" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "services" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);

    // Recreate all tables with INTEGER IDs
    
    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "phone" character varying,
        "role" character varying NOT NULL DEFAULT 'client',
        "isActive" boolean NOT NULL DEFAULT true,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "refreshToken" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "icon" character varying,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "durationMinutes" integer NOT NULL DEFAULT 60,
        "basePrice" numeric(10,2) NOT NULL DEFAULT 0,
        "estimatedDuration" integer NOT NULL DEFAULT 60,
        "isActive" boolean NOT NULL DEFAULT true,
        "categoryId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_services" PRIMARY KEY ("id"),
        CONSTRAINT "FK_services_category" FOREIGN KEY ("categoryId") 
          REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Garages table
    await queryRunner.query(`
      CREATE TABLE "garages" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "description" text NOT NULL,
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "postalCode" character varying NOT NULL,
        "latitude" numeric(10,8),
        "longitude" numeric(11,8),
        "phone" character varying NOT NULL,
        "email" character varying,
        "website" character varying,
        "images" text,
        "openingHours" json,
        "isActive" boolean NOT NULL DEFAULT true,
        "isVerified" boolean NOT NULL DEFAULT false,
        "ownerId" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_garages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_garages_owner" FOREIGN KEY ("ownerId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Garage Services table
    await queryRunner.query(`
      CREATE TABLE "garage_services" (
        "id" SERIAL NOT NULL,
        "garageId" integer NOT NULL,
        "serviceId" integer NOT NULL,
        "capacity" integer NOT NULL,
        "price" numeric(10,2),
        "pricingType" character varying NOT NULL DEFAULT 'fixed',
        "isAvailable" boolean NOT NULL DEFAULT true,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_garage_services" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_garage_service" UNIQUE ("garageId", "serviceId"),
        CONSTRAINT "FK_garage_services_garage" FOREIGN KEY ("garageId") 
          REFERENCES "garages"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_garage_services_service" FOREIGN KEY ("serviceId") 
          REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Reservations table
    await queryRunner.query(`
      CREATE TABLE "reservations" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "garageId" integer NOT NULL,
        "serviceId" integer NOT NULL,
        "timeSlot" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "price" numeric(10,2),
        "clientNotes" text,
        "garageNotes" text,
        "cancellationReason" character varying,
        "confirmedAt" TIMESTAMP,
        "completedAt" TIMESTAMP,
        "cancelledAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_reservations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reservations_user" FOREIGN KEY ("userId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reservations_garage" FOREIGN KEY ("garageId") 
          REFERENCES "garages"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reservations_service" FOREIGN KEY ("serviceId") 
          REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Reviews table
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "garageId" integer NOT NULL,
        "rating" integer NOT NULL,
        "comment" text,
        "reservationId" integer,
        "isVerified" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "FK_reviews_user" FOREIGN KEY ("userId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reviews_garage" FOREIGN KEY ("garageId") 
          REFERENCES "garages"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" SERIAL NOT NULL,
        "userId" integer NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "metadata" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_city" ON "garages" ("city")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_active" ON "garages" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_owner" ON "garages" ("ownerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_garage_services_garage" ON "garage_services" ("garageId")`);
    await queryRunner.query(`CREATE INDEX "IDX_garage_services_service" ON "garage_services" ("serviceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_user" ON "reservations" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_garage" ON "reservations" ("garageId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_service" ON "reservations" ("serviceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_status" ON "reservations" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_user_status" ON "reservations" ("userId", "status")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_garage_service_timeslot" ON "reservations" ("garageId", "serviceId", "timeSlot")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_user" ON "reviews" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_garage" ON "reviews" ("garageId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user" ON "notifications" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_services_category" ON "services" ("categoryId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This migration cannot be reverted as it involves data type changes
    throw new Error('This migration cannot be reverted. Please restore from backup if needed.');
  }
}
