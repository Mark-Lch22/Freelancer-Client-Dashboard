import { BidRankingStrategy, Bid } from '../BidRankingStrategy';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RatingDescStrategy implements BidRankingStrategy {
  rank(bids: Bid[]): Bid[] {
    return [...bids].sort((a, b) => b.freelancer.rating - a.freelancer.rating);
  }
}
