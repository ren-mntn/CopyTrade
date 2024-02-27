import { MigrationInterface, QueryRunner } from "typeorm";

export class TransactionSchema1707903960880 implements MigrationInterface {
    name = 'TransactionSchema1707903960880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transaction" ("id" SERIAL NOT NULL, "userId" character varying NOT NULL, "oid" character varying NOT NULL, "coin" character varying NOT NULL, "dir" character varying NOT NULL, "price" double precision NOT NULL, "size" double precision NOT NULL, "timestamp" bigint NOT NULL, "closedPnl" double precision NOT NULL, "fee" double precision NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transaction"`);
    }

}
