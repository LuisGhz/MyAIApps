import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPromptUserIdUniqueConstraint1765222122461 implements MigrationInterface {
  name = 'DropPromptUserIdUniqueConstraint1765222122461';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_fd2aed4018953e15ce70f65b427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "UQ_prompts_userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "FK_fd2aed4018953e15ce70f65b427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "prompts" DROP CONSTRAINT "FK_fd2aed4018953e15ce70f65b427"`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "UQ_prompts_userId" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "prompts" ADD CONSTRAINT "FK_fd2aed4018953e15ce70f65b427" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
