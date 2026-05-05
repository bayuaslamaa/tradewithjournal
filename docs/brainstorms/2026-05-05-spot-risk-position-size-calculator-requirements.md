---
date: 2026-05-05
topic: spot-risk-position-size-calculator
---

# Spot Risk Position Size Calculator

## Summary

Add a strict spot-long risk calculator inside the existing trade logging flow. The calculator will help the trader size each entry from portfolio value, risk percent, entry price, and stop loss, then save the calculated risk details with the trade.

---

## Problem Frame

The trader is still learning disciplined risk management and wants a practical guardrail while planning each trade. The current journal captures entry price, stop loss, take profit, direction, P&L, notes, emotions, and lessons, but it does not answer the key pre-trade sizing question: how much can be bought while only risking a chosen percentage of the portfolio.

Without this calculation in the logging flow, the trader has to size positions manually or outside the app. That creates room for inconsistent risk, especially when learning to keep losses around 1-2% of portfolio value.

---

## Actors

- A1. Trader: Logs spot trades, enters planning prices, and uses the calculator to size entries before taking a trade.

---

## Key Flows

- F1. Size a planned spot-long trade
  - **Trigger:** The trader is logging or editing a trade before entry.
  - **Actors:** A1
  - **Steps:** The trader enters portfolio value, risk percent, entry price, and stop loss. The app validates that the stop loss creates a defined downside. The app shows max loss, dollar amount to buy, and estimated asset quantity. If take profit is present, the app also shows planned reward and R:R.
  - **Outcome:** The trader can see the recommended position size before entering the trade.
  - **Covered by:** R1, R2, R3, R4, R5, R6, R7

- F2. Save calculated risk context with the trade
  - **Trigger:** The trader saves a trade after the calculator has enough valid inputs.
  - **Actors:** A1
  - **Steps:** The app saves the trade along with the calculated risk values visible during planning. The next new trade remembers the last portfolio value while allowing it to be changed.
  - **Outcome:** The trade record preserves the intended risk plan for later review.
  - **Covered by:** R8, R9

---

## Requirements

**Calculator inputs**
- R1. The trade logging flow must include inputs for portfolio value and risk percent.
- R2. Risk percent must default to 1% while allowing the trader to enter another positive percentage.
- R3. Portfolio value must remember the last entered value for the next trade while remaining editable per trade.
- R4. The calculator must use the existing planning prices as the basis for entry, stop loss, and optional take profit.

**Calculator behavior**
- R5. The calculator must only recommend a position size when portfolio value, risk percent, entry price, and stop loss are valid.
- R6. For spot-long trades, the calculator must withhold the recommendation when stop loss is missing, equal to entry, or above entry.
- R7. When valid, the calculator must show max allowed loss, recommended dollar amount to buy, and estimated asset quantity.
- R8. When take profit is valid, the calculator must also show planned reward and risk/reward ratio.

**Trade saving**
- R9. Saved trades must preserve the calculated planning values that were shown to the trader, including portfolio value, risk percent, max loss, recommended buy amount, estimated quantity, and planned R:R when available.
- R10. Existing journaling behavior must remain available; the calculator enhances trade planning rather than replacing journaling.

---

## Acceptance Examples

- AE1. **Covers R5, R7.** Given portfolio value is $1000, risk is 1%, entry is $100, and stop loss is $95, when the calculator runs, it shows max allowed loss of $10, recommended buy amount of $200, and estimated quantity of 2 units.
- AE2. **Covers R6.** Given portfolio value, risk percent, and entry price are present, when stop loss is empty, equal to entry, or above entry, the app does not show a recommended position size.
- AE3. **Covers R8.** Given a valid entry and stop loss plus a valid take-profit price above entry, when the calculator runs, it shows planned reward and R:R in addition to position size.
- AE4. **Covers R3.** Given the trader logs a trade with portfolio value $1000, when they open the next new trade form, the portfolio value starts at $1000 but can be edited.

---

## Success Criteria

- The trader can answer "how much should I buy if I only want to risk X%?" without leaving the trade logging flow.
- The calculator discourages undefined-risk trades by requiring a valid stop loss before recommending size.
- A downstream implementation plan can proceed without inventing calculator inputs, outputs, saved values, or scope boundaries.

---

## Scope Boundaries

- Do not make the app calculator-first; keep the existing journal flow.
- Do not add short trade sizing in the first version.
- Do not add futures, leverage, margin, liquidation, or borrowing calculations.
- Do not add brokerage or exchange integration.
- Do not sync portfolio balance automatically.
- Do not introduce multi-account portfolio settings.
- Do not add advanced order types.

---

## Key Decisions

- Calculator inside trade logging: This supports sizing at the moment the trade plan is created without disrupting the existing journal.
- Stop loss required: This reinforces risk discipline and avoids recommending position size when downside is undefined.
- Remember last portfolio value: This keeps repeated logging fast without adding a global settings system.
- Flexible risk percent with 1% default: This teaches conservative sizing while allowing the trader to choose 1-2% or another value.
- Save calculated values: The trade record should preserve the original risk plan for later review.

---

## Dependencies / Assumptions

- The first version is intended for spot-long trades.
- Entry, stop loss, and take profit are manually entered by the trader.
- Portfolio value is manually entered and remembered locally or through the app's persisted state; exact persistence mechanics are deferred to planning.
- All calculator values are educational planning aids and do not place orders.
