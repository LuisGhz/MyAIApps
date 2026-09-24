import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateModelsTables1764448774005 implements MigrationInterface {
  name = 'CreateModelsTables1764448774005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create model_developers table
    await queryRunner.query(`
      CREATE TABLE "model_developers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "link" character varying NOT NULL,
        "imageUrl" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_model_developers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_model_developers_name" UNIQUE ("name")
      )
    `);

    // Create models table
    await queryRunner.query(`
      CREATE TABLE "models" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "shortName" character varying NOT NULL,
        "value" character varying NOT NULL,
        "link" character varying NOT NULL,
        "priceInput" decimal(10, 4) NOT NULL,
        "priceOutput" decimal(10, 4) NOT NULL,
        "contextWindow" integer NOT NULL,
        "maxOutputTokens" integer NOT NULL,
        "knowledgeCutoff" character varying NOT NULL,
        "developerId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_models" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_models_value" UNIQUE ("value")
      )
    `);

    // Add foreign key from models to model_developers
    await queryRunner.query(`
      ALTER TABLE "models"
      ADD CONSTRAINT "FK_models_developerId"
      FOREIGN KEY ("developerId") REFERENCES "model_developers"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_models_developerId" ON "models" ("developerId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_models_value" ON "models" ("value")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_model_developers_name" ON "model_developers" ("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_model_developers_name"`);
    await queryRunner.query(`DROP INDEX "IDX_models_value"`);
    await queryRunner.query(`DROP INDEX "IDX_models_developerId"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "models" DROP CONSTRAINT "FK_models_developerId"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "models"`);
    await queryRunner.query(`DROP TABLE "model_developers"`);
  }
}
