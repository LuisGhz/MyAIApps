import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupportsTemperature1766203851660 implements MigrationInterface {
  name = 'AddSupportsTemperature1766203851660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" ADD "supportsTemperature" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" DROP COLUMN "supportsTemperature"`,
    );
  }
}
