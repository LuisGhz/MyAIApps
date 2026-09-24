import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokensTable1764448774002 implements MigrationInterface {
  name = 'CreateRefreshTokensTable1764448774002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "exp" TIMESTAMP NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "agentInfo" character varying NOT NULL,
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_tokens_token" UNIQUE ("token"),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key from refresh_tokens to users
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_token"`);
    await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_userId"`);

    // Drop foreign key
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_userId"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
