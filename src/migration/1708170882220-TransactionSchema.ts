import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionSchema1708170882220 implements MigrationInterface {
    name = 'TransactionSchema1708170882220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_c0e318cd37cf1af5df9272385e" ON "transaction" ("userId", "timestamp") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c0e318cd37cf1af5df9272385e"`);
    }

}
