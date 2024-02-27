import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...AppDataSource.options,
            autoLoadEntities: true, // エンティティを自動的に読み込む
        }),
    ],
})
export class DataSourceModule { }