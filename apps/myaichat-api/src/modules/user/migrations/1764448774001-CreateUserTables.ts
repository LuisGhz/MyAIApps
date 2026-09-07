import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTables1764448774001 implements MigrationInterface {
  name = 'CreateUserTables1764448774001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_roles_name" UNIQUE ("name"),
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ghLogin" character varying NOT NULL,
        "name" character varying NOT NULL,
        "avatar" character varying,
        "email" character varying,
        "roleId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_ghLogin" UNIQUE ("ghLogin"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key from users to roles
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_roleId"
      FOREIGN KEY ("roleId") REFERENCES "roles"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_roleId"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
