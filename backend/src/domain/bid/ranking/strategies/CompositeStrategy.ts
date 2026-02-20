import { BidRankingStrategy, Bid } from '../BidRankingStrategy';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompositeStrategy implements BidRankingStrategy {
  rank(bids: Bid[]): Bid[] {
    return [...bids].sort((a, b) => {
      const scoreA = (1 / a.proposed_rate) * 0.4 + a.freelancer.rating * 0.6;
      const scoreB = (1 / b.proposed_rate) * 0.4 + b.freelancer.rating * 0.6;
      return scoreB - scoreA;
    });
  }
}
