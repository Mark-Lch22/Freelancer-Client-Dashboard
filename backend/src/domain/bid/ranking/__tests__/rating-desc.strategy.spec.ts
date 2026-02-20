import { RatingDescStrategy } from '../strategies/RatingDescStrategy';
import { Bid } from '../BidRankingStrategy';

describe('RatingDescStrategy', () => {
  let strategy: RatingDescStrategy;

  beforeEach(() => {
    strategy = new RatingDescStrategy();
  });

  it('should sort bids by descending rating', () => {
    const bids: Bid[] = [
      { proposed_rate: 100, freelancer: { rating: 4.2 } },
      { proposed_rate: 120, freelancer: { rating: 4.9 } },
      { proposed_rate: 110, freelancer: { rating: 4.5 } },
    ];

    const result = strategy.rank(bids);

    expect(result.map(b => b.freelancer.rating)).toEqual([4.9, 4.5, 4.2]);
  });
});
