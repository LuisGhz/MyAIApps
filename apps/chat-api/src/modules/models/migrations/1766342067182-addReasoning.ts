import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReasoning1766342067182 implements MigrationInterface {
  name = 'AddReasoning1766342067182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" ADD "isReasoning" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "models" ADD "reasoningLevel" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" DROP COLUMN "reasoningLevel"`,
    );
    await queryRunner.query(`ALTER TABLE "models" DROP COLUMN "isReasoning"`);
  }
}
