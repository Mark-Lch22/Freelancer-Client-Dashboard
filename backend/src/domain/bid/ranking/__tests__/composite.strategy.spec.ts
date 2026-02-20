import { CompositeStrategy } from '../strategies/CompositeStrategy';
import { Bid } from '../BidRankingStrategy';

describe('CompositeStrategy', () => {
  let strategy: CompositeStrategy;

  beforeEach(() => {
    strategy = new CompositeStrategy();
  });

  it('should sort bids by combined score (rating + inverse price)', () => {
    const bids: Bid[] = [
      { proposed_rate: 100, freelancer: { rating: 4.0 } }, // score ≈ 0.01*0.4 + 4*0.6 = 2.404
      { proposed_rate: 50, freelancer: { rating: 3.5 } },  // score ≈ 0.02*0.4 + 3.5*0.6 = 2.104
      { proposed_rate: 80, freelancer: { rating: 4.5 } },  // score ≈ 0.0125*0.4 + 4.5*0.6 = 2.705
    ];

    const result = strategy.rank(bids);

    expect(result.map(b => b.proposed_rate)).toEqual([80, 100, 50]);
  });
});
