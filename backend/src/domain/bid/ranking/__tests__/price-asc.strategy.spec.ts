import { PriceAscStrategy } from '../strategies/PriceAscStrategy';
import { Bid } from '../BidRankingStrategy';

describe('PriceAscStrategy', () => {
  let strategy: PriceAscStrategy;

  beforeEach(() => {
    strategy = new PriceAscStrategy();
  });

  it('should sort bids by ascending price', () => {
    const bids: Bid[] = [
      { proposed_rate: 200, freelancer: { rating: 4.5 } },
      { proposed_rate: 100, freelancer: { rating: 4.8 } },
      { proposed_rate: 150, freelancer: { rating: 4.2 } },
    ];

    const result = strategy.rank(bids);

    expect(result.map(b => b.proposed_rate)).toEqual([100, 150, 200]);
  });
});
