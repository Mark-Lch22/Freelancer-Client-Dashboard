# ADR-001: Choosing Strategy Pattern for Bid Ranking

**Date:** February 20, 2026  
**Status:** Accepted  
**Author:** Nikola

---

## Context

In our freelance project management system, we need to rank freelancer bids based on different criteria:

- Lowest proposed price
- Highest freelancer rating
- A combination of price and rating

We anticipate adding more ranking criteria in the future (e.g., number of completed projects, delivery time, etc.). Therefore, we need an architecture that:

- Allows easy addition of new ranking algorithms
- Avoids code duplication
- Supports unit testing and maintainability
- Enables dynamic selection of ranking logic at runtime

---

## Decision

We chose to implement the **Strategy Pattern**, using a shared interface `BidRankingStrategy` and multiple concrete implementations:

- `PriceAscStrategy`
- `RatingDescStrategy`
- `CompositeStrategy`

We also introduced a `BidRanker` class (the Context), which delegates ranking to the injected strategy, and a `BidRankingStrategyFactory` to select the appropriate strategy based on a runtime parameter.

---

## Rationale

- **Separation of concerns:** Each ranking algorithm is encapsulated in its own class.
- **Extensibility:** New strategies can be added without modifying existing logic.
- **Testability:** Each strategy can be tested independently.
- **Flexibility:** Strategies can be swapped dynamically at runtime (e.g., based on a query parameter).

---

## Alternatives Considered

- **Hardcoded switch logic in `BidRanker`:** This would tightly couple the ranking logic and make the code harder to maintain and extend.
- **Using plain functions instead of classes:** This would reduce flexibility and make integration with NestJS’s dependency injection more difficult.

---

## Consequences

- All strategies and the factory must be registered as providers in the NestJS module.
- When adding a new strategy, it must implement the `BidRankingStrategy` interface and be added to the factory.
