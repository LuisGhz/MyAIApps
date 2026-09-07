import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUniqueFromModelValue1771444227720 implements MigrationInterface {
  name = 'RemoveUniqueFromModelValue1771444227720';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" DROP CONSTRAINT "UQ_models_value"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" ADD CONSTRAINT "UQ_models_value" UNIQUE ("value")`,
    );
  }
}
