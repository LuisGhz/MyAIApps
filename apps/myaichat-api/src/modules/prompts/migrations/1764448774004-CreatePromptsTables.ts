import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePromptsTables1764448774004 implements MigrationInterface {
  name = 'CreatePromptsTables1764448774004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create prompts table
    await queryRunner.query(`
      CREATE TABLE "prompts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "content" text NOT NULL,
        "userId" uuid NOT NULL,
        "chatId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prompts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_prompts_userId" UNIQUE ("userId")
      )
    `);

    // Create prompt_messages table
    await queryRunner.query(`
      CREATE TABLE "prompt_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "role" character varying NOT NULL,
        "content" text NOT NULL,
        "promptId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_prompt_messages" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key from prompts to users (OneToOne)
    await queryRunner.query(`
      ALTER TABLE "prompts"
      ADD CONSTRAINT "FK_prompts_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Add foreign key from prompts to chats (ManyToOne, SET NULL on delete)
    await queryRunner.query(`
      ALTER TABLE "prompts"
      ADD CONSTRAINT "FK_prompts_chatId"
      FOREIGN KEY ("chatId") REFERENCES "chats"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Add foreign key from prompt_messages to prompts
    await queryRunner.query(`
      ALTER TABLE "prompt_messages"
      ADD CONSTRAINT "FK_prompt_messages_promptId"
      FOREIGN KEY ("promptId") REFERENCES "prompts"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_prompts_userId" ON "prompts" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prompts_chatId" ON "prompts" ("chatId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prompt_messages_promptId" ON "prompt_messages" ("promptId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_prompts_updatedAt" ON "prompts" ("updatedAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_prompts_updatedAt"`);
    await queryRunner.query(`DROP INDEX "IDX_prompt_messages_promptId"`);
    await queryRunner.query(`DROP INDEX "IDX_prompts_chatId"`);
    await queryRunner.query(`DROP INDEX "IDX_prompts_userId"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" DROP CONSTRAINT "FK_prompt_messages_promptId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_prompts_chatId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_prompts_userId"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "prompt_messages"`);
    await queryRunner.query(`DROP TABLE "prompts"`);
  }
}
