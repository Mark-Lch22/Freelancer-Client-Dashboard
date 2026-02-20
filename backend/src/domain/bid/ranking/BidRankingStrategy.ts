/**
 * Strategy Pattern interface for bid ranking algorithms.
 */
export interface Bid {
  proposed_rate: number;
  freelancer: {
    rating: number;
  };
}

export interface BidRankingStrategy {
  rank(bids: Bid[]): Bid[];
}
