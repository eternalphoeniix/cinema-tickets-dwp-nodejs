# Introduction

## Summary

This code is for the DWP cinema tickets coding test.

## Assumptions

- 1 infant per adult lap.
- Only 1 adult needed for any number of children.
-

## Running the application

You can run the application by calling the Ticket service such as the code below.

```
import TicketTypeRequest from "<root>/src/pairtest/lib/TicketTypeRequest.js";
import TicketService from "<root>/src/pairtest/TicketService.js";

new TicketService().purchaseTickets(1, new TicketTypeRequest("ADULT", 1));
```

## Testing the application

Testing is done through the package.json

- npm run test:unit
- npm run test

## Improvements:

- typescript
- linter
- environment based config
- environmental builds
- logger
- git hooks to lint, commit, tests etc.
- pipeline continuous integration
- commit standards (feat/test/config)
- improved jsDocs
- modular. separate validations from business logic
- different currencies

# DWP Instructions:

## Objective

This is a coding exercise which will allow you to demonstrate how you code and your approach to a given problem.

You will be assessed on:

- Your ability to write clean, well-tested and reusable code.
- How you have ensured the following business rules are correctly met.

## Business Rules

- There are 3 types of tickets i.e. Infant, Child, and Adult.
- The ticket prices are based on the type of ticket (see table below).
- The ticket purchaser declares how many and what type of tickets they want to buy.
- Multiple tickets can be purchased at any given time.
- Only a maximum of 25 tickets that can be purchased at a time.
- Infants do not pay for a ticket and are not allocated a seat. They will be sitting on an Adult's lap.
- Child and Infant tickets cannot be purchased without purchasing an Adult ticket.
  | Ticket Type | Price |
  | ---------------- | ----------- |
  | INFANT | £0 |
  | CHILD | £15 |
  | ADULT | £25 |
- There is an existing `TicketPaymentService` responsible for taking payments.
- There is an existing `SeatReservationService` responsible for reserving seats.

### Constraints

- The TicketService interface CANNOT be modified.
- The code in the thirdparty.\* packages CANNOT be modified.
- The `TicketTypeRequest` SHOULD be an immutable object.

### Assumptions

You can assume:

- All accounts with an id greater than zero are valid. They also have sufficient funds to pay for any no of tickets.
- The `TicketPaymentService` implementation is an external provider with no defects. You do not need to worry about how the actual payment happens.
- The payment will always go through once a payment request has been made to the `TicketPaymentService`.
- The `SeatReservationService` implementation is an external provider with no defects. You do not need to worry about how the seat reservation algorithm works.
- The seat will always be reserved once a reservation request has been made to the `SeatReservationService`.

### Your Task

Provide a working implementation of a `TicketService` that:

- Considers the above objective, business rules, constraints & assumptions.
- Calculates the correct amount for the requested tickets and makes a payment request to the `TicketPaymentService`.
- Calculates the correct no of seats to reserve and makes a seat reservation request to the `SeatReservationService`.
- Rejects any invalid ticket purchase requests. It is up to you to identify what should be deemed as an invalid purchase request
