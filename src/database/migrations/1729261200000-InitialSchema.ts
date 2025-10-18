import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1729261200000 implements MigrationInterface {
  name = 'InitialSchema1729261200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // IMPORTANT: Enable UUID extension FIRST before creating any tables
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "phoneNumber" character varying,
        "role" character varying NOT NULL DEFAULT 'customer',
        "isActive" boolean NOT NULL DEFAULT true,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "verificationToken" character varying,
        "resetPasswordToken" character varying,
        "resetPasswordExpires" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "icon" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "PK_categories_id" PRIMARY KEY ("id")
      )
    `);

    // Create services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "categoryId" uuid,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_services_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_services_category" FOREIGN KEY ("categoryId") 
          REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // Create garages table
    await queryRunner.query(`
      CREATE TABLE "garages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "ownerId" uuid NOT NULL,
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "governorate" character varying NOT NULL,
        "postalCode" character varying,
        "latitude" double precision,
        "longitude" double precision,
        "phoneNumber" character varying NOT NULL,
        "email" character varying,
        "images" text array DEFAULT '{}',
        "openingHours" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "isVerified" boolean NOT NULL DEFAULT false,
        "rating" numeric(3,2) DEFAULT '0',
        "reviewCount" integer NOT NULL DEFAULT '0',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_garages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_garages_owner" FOREIGN KEY ("ownerId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create garage_services table
    await queryRunner.query(`
      CREATE TABLE "garage_services" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "garageId" uuid NOT NULL,
        "serviceId" uuid NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "estimatedDuration" integer NOT NULL,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_garage_services_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_garage_service" UNIQUE ("garageId", "serviceId"),
        CONSTRAINT "FK_garage_services_garage" FOREIGN KEY ("garageId") 
          REFERENCES "garages"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_garage_services_service" FOREIGN KEY ("serviceId") 
          REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create reservations table
    await queryRunner.query(`
      CREATE TABLE "reservations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "garageId" uuid NOT NULL,
        "garageServiceId" uuid NOT NULL,
        "scheduledDate" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "notes" text,
        "cancellationReason" text,
        "totalPrice" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reservations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reservations_customer" FOREIGN KEY ("customerId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reservations_garage" FOREIGN KEY ("garageId") 
          REFERENCES "garages"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reservations_garage_service" FOREIGN KEY ("garageServiceId") 
          REFERENCES "garage_services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    // Create reviews table
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "garageId" uuid NOT NULL,
        "reservationId" uuid,
        "rating" integer NOT NULL,
        "comment" text,
        "response" text,
        "responseDate" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "FK_reviews_customer" FOREIGN KEY ("customerId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reviews_garage" FOREIGN KEY ("garageId") 
          REFERENCES "garages"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reviews_reservation" FOREIGN KEY ("reservationId") 
          REFERENCES "reservations"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "type" character varying NOT NULL,
        "relatedId" uuid,
        "isRead" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") 
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_owner" ON "garages" ("ownerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_city" ON "garages" ("city")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_governorate" ON "garages" ("governorate")`);
    await queryRunner.query(`CREATE INDEX "IDX_garages_active" ON "garages" ("isActive")`);
    await queryRunner.query(`CREATE INDEX "IDX_garage_services_garage" ON "garage_services" ("garageId")`);
    await queryRunner.query(`CREATE INDEX "IDX_garage_services_service" ON "garage_services" ("serviceId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_customer" ON "reservations" ("customerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_garage" ON "reservations" ("garageId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_status" ON "reservations" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_reservations_date" ON "reservations" ("scheduledDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_garage" ON "reviews" ("garageId")`);
    await queryRunner.query(`CREATE INDEX "IDX_reviews_customer" ON "reviews" ("customerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user" ON "notifications" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_read" ON "notifications" ("isRead")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_notifications_read"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_garage"`);
    await queryRunner.query(`DROP INDEX "IDX_reservations_date"`);
    await queryRunner.query(`DROP INDEX "IDX_reservations_status"`);
    await queryRunner.query(`DROP INDEX "IDX_reservations_garage"`);
    await queryRunner.query(`DROP INDEX "IDX_reservations_customer"`);
    await queryRunner.query(`DROP INDEX "IDX_garage_services_service"`);
    await queryRunner.query(`DROP INDEX "IDX_garage_services_garage"`);
    await queryRunner.query(`DROP INDEX "IDX_garages_active"`);
    await queryRunner.query(`DROP INDEX "IDX_garages_governorate"`);
    await queryRunner.query(`DROP INDEX "IDX_garages_city"`);
    await queryRunner.query(`DROP INDEX "IDX_garages_owner"`);
    await queryRunner.query(`DROP INDEX "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TABLE "garage_services"`);
    await queryRunner.query(`DROP TABLE "garages"`);
    await queryRunner.query(`DROP TABLE "services"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
    
    // Drop UUID extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
