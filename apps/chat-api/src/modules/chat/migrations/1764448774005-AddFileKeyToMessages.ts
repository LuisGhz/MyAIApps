import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFileKeyToMessages1764448774005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'messages',
      new TableColumn({
        name: 'fileKey',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('messages', 'fileKey');
  }
}
