import { Injectable, Inject } from '@nestjs/common';
import { BidRankingStrategy, Bid } from './BidRankingStrategy';

@Injectable()
export class BidRanker {
  constructor(
    @Inject('BidRankingStrategy') private readonly strategy: BidRankingStrategy
  ) {}

  rankBids(bids: Bid[]): Bid[] {
    return this.strategy.rank(bids);
  }
}
