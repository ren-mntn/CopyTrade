import { DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

// "npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate src/migration/TransactionSchema --dataSource src/data-source.ts"
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '1373',
    database: 'orderBookDB',
    entities: [Transaction],
    synchronize: true,
    migrations: ["src/migration/**/*.ts"],
    subscribers: [], // ここを修正
});