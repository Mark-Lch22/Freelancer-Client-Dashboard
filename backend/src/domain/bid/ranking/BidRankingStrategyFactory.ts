import { Injectable } from '@nestjs/common';
import { BidRankingStrategy } from './BidRankingStrategy';
import { PriceAscStrategy } from './strategies/PriceAscStrategy';
import { RatingDescStrategy } from './strategies/RatingDescStrategy';
import { CompositeStrategy } from './strategies/CompositeStrategy';

@Injectable()
export class BidRankingStrategyFactory {
  constructor(
    private readonly price: PriceAscStrategy,
    private readonly rating: RatingDescStrategy,
    private readonly composite: CompositeStrategy
  ) {}

  getStrategy(type: string): BidRankingStrategy {
    switch (type) {
      case 'price':
        return this.price;
      case 'rating':
        return this.rating;
      case 'composite':
      default:
        return this.composite;
    }
  }
}
