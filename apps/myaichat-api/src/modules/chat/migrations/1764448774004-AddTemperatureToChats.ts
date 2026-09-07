import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTemperatureToChats1764448774004 implements MigrationInterface {
  name = 'AddTemperatureToChats1764448774004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "chats"
      ADD COLUMN "temperature" decimal(3,2) NOT NULL DEFAULT 1.0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "chats"
      DROP COLUMN "temperature"
    `);
  }
}
