import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface WindowPerformance {
    pnl: string;
    roi: string;
    vlm: string;
}

export interface LeaderboardRow {
    accountValue: string;
    displayName: string | null;
    ethAddress: string;
    prize: number;
    windowPerformances: [string, WindowPerformance][];
}

export interface ApiResponse {
    leaderboardRows: LeaderboardRow[];
}
@Injectable()


export class FetchLeaderBoardService {
    public async fetchEthAddress(sortType: string, timeFrame: string, limit = 100): Promise<string[] | undefined> {
        const response = await axios.post('https://api-ui.hyperliquid.xyz/info', {
            type: "leaderboard",
        });
        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }
        const data: ApiResponse = response.data;

        // データをソートし、必要な件数を抽出した後、ethAddressのみを含む配列を作成
        const ethAddresses = this.sortLeaderboardRows(data.leaderboardRows, sortType, timeFrame)
            .slice(0, limit)
            .map(row => row.ethAddress);

        return ethAddresses;
    }

    private sortLeaderboardRows(leaderboardRows: LeaderboardRow[], sortType: string, timeFrame: string): LeaderboardRow[] {
        return leaderboardRows.sort((a, b) => {
            const aPerformance = a.windowPerformances.find(performance => performance[0] === timeFrame)?.[1];
            const bPerformance = b.windowPerformances.find(performance => performance[0] === timeFrame)?.[1];

            if (sortType === 'accountValue') {
                return parseFloat(b.accountValue) - parseFloat(a.accountValue);
            }

            // accountValue以外の場合はwindowPerformanceを比較する必要がある
            if (aPerformance && bPerformance) {
                return parseFloat(bPerformance[sortType]) - parseFloat(aPerformance[sortType]);
            }

            return 0;
        });
    }
}
