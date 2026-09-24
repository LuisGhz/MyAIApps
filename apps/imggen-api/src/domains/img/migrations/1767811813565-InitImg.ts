import { MigrationInterface, QueryRunner } from "typeorm";

export class InitImg1767811813565 implements MigrationInterface {
    name = 'InitImg1767811813565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "image" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "userId" character varying NOT NULL, "isDeleted" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP, "deletedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "image"`);
    }

}
