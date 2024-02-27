import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('order_book_diffs')
export class OrderBookDiff {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    pair: string;

    @Column('jsonb')
    asks: any; // JSONBデータ型を使用して、すべてのasksを保存

    @Column('jsonb')
    bids: any; // JSONBデータ型を使用して、すべてのbidsを保存

    @Column('bigint')
    timestamp: string;

    @Column('bigint')
    sequence_id: string;
}