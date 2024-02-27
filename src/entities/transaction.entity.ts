import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['userId', 'timestamp']) // 複合インデックスを追加
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string;

    @Column()
    oid: string;

    @Column()
    coin: string;

    @Column()
    dir: string;

    @Column('float')
    price: number;

    @Column('float')
    size: number;

    @Column({
        type: 'bigint',
        transformer: {
            from: (value: string) => parseInt(value, 10),
            to: (value: number) => value.toString(),
        },
    })
    timestamp: number;

    @Column('float')
    closedPnl: number;

    @Column('float')
    fee: number;
}