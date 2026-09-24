import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPromptRelationToChat1765205133742 implements MigrationInterface {
  name = 'AddPromptRelationToChat1765205133742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_users_roleId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_chatId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_chats_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_prompts_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_prompts_chatId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" DROP CONSTRAINT "FK_prompt_messages_promptId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" DROP CONSTRAINT "FK_models_developerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_userId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_chatId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_messages_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_chats_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_prompts_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_prompts_chatId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_prompts_updatedAt"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_prompt_messages_promptId"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_model_developers_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_models_developerId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_models_value"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_refresh_tokens_token"`);
    await queryRunner.query(`ALTER TABLE "prompts" DROP COLUMN "chatId"`);
    await queryRunner.query(`ALTER TABLE "chats" ADD "promptId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "chatId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "temperature" SET DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "model" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "userId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ALTER COLUMN "userId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" ALTER COLUMN "promptId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ALTER COLUMN "developerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42ae9e53d5e" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_36bc604c820bb9adc4c75cd4115" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_ae8951c0a763a060593606b7e2d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_e050a42b7e720321757cbf6c589" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "FK_fd2aed4018953e15ce70f65b427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" ADD CONSTRAINT "FK_8bd672418fe5651d138446596a1" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ADD CONSTRAINT "FK_d3c7061d1c614a411187bf4ecdc" FOREIGN KEY ("developerId") REFERENCES "model_developers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" DROP CONSTRAINT "FK_d3c7061d1c614a411187bf4ecdc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" DROP CONSTRAINT "FK_8bd672418fe5651d138446596a1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_fd2aed4018953e15ce70f65b427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_e050a42b7e720321757cbf6c589"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_ae8951c0a763a060593606b7e2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_36bc604c820bb9adc4c75cd4115"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42ae9e53d5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ALTER COLUMN "developerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" ALTER COLUMN "promptId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "model" SET DEFAULT 'gpt-4o'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ALTER COLUMN "temperature" SET DEFAULT 1.0`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ALTER COLUMN "chatId" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "promptId"`);
    await queryRunner.query(`ALTER TABLE "prompts" ADD "chatId" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_refresh_tokens_userId" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_models_value" ON "models" ("value") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_models_developerId" ON "models" ("developerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_model_developers_name" ON "model_developers" ("name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_prompt_messages_promptId" ON "prompt_messages" ("promptId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_prompts_updatedAt" ON "prompts" ("updatedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_prompts_chatId" ON "prompts" ("chatId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_prompts_userId" ON "prompts" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chats_userId" ON "chats" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_createdAt" ON "messages" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_messages_chatId" ON "messages" ("chatId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ADD CONSTRAINT "FK_models_developerId" FOREIGN KEY ("developerId") REFERENCES "model_developers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompt_messages" ADD CONSTRAINT "FK_prompt_messages_promptId" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "FK_prompts_chatId" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "FK_prompts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_chats_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_chatId" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_roleId" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
