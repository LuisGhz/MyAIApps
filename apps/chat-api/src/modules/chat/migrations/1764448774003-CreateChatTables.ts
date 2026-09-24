import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatTables1764448774003 implements MigrationInterface {
  name = 'CreateChatTables1764448774003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create chats table
    await queryRunner.query(`
      CREATE TABLE "chats" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying,
        "userId" uuid NOT NULL,
        "maxTokens" integer NOT NULL DEFAULT 4096,
        "model" character varying NOT NULL DEFAULT 'gpt-4o',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chats" PRIMARY KEY ("id")
      )
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "chatId" uuid NOT NULL,
        "content" text NOT NULL,
        "role" character varying NOT NULL,
        "inputTokens" integer,
        "outputTokens" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key from chats to users
    await queryRunner.query(`
      ALTER TABLE "chats"
      ADD CONSTRAINT "FK_chats_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Add foreign key from messages to chats
    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_chatId"
      FOREIGN KEY ("chatId") REFERENCES "chats"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_chats_userId" ON "chats" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_chatId" ON "messages" ("chatId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_createdAt" ON "messages" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_messages_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_messages_chatId"`);
    await queryRunner.query(`DROP INDEX "IDX_chats_userId"`);

    // Drop foreign keys
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_chatId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_chats_userId"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "chats"`);
  }
}
