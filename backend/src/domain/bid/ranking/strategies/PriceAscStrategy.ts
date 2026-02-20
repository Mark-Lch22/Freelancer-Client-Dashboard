import { BidRankingStrategy, Bid } from '../BidRankingStrategy';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PriceAscStrategy implements BidRankingStrategy {
  rank(bids: Bid[]): Bid[] {
    return [...bids].sort((a, b) => a.proposed_rate - b.proposed_rate);
  }
}
