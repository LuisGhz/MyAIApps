import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGuestAccessToModels1765487420763 implements MigrationInterface {
  name = 'AddGuestAccessToModels1765487420763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "models" ADD "guestAccess" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "models" DROP COLUMN "guestAccess"`);
  }
}
