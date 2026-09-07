import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImageGenerationAndWebSearchToChats1764448774006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'chats',
      new TableColumn({
        name: 'isImageGeneration',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'chats',
      new TableColumn({
        name: 'isWebSearch',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('chats', 'isWebSearch');
    await queryRunner.dropColumn('chats', 'isImageGeneration');
  }
}
