import { Controller, Get, Query } from '@nestjs/common';
import { FetchLeaderBoardService } from 'src/browser-api/services/fetch-leader-board.service';

@Controller('fetch-leader-board')
export class FetchLeaderBoardController {
    constructor(private readonly fetchLeaderBoardService: FetchLeaderBoardService) { }

    @Get()
    async fetchData(
        @Query('timeFrame') timeFrame: string,
        @Query('sortType') sortType: string,
        @Query('limit') limit: number
    ): Promise<string[] | undefined> {
        const data = await this.fetchLeaderBoardService.fetchEthAddress(timeFrame, sortType, limit);
        return data;
    }
}