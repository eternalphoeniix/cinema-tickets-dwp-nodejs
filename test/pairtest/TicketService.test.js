import InvalidPurchaseException from "../../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../../src/pairtest/TicketService";

describe("TicketService", () => {
  let ticketService = new TicketService();
  beforeEach(() => {
    ticketService = new TicketService();
  });
  describe("purchaseTickets", () => {
    describe("Given a valid input of", () => {
      const cases = [
        {
          accountId: 2,
          ticketTypeRequests: [new TicketTypeRequest("ADULT", 3)],
          desc: "3 adults",
          price: "£120",
          seats: 3,
        },
        {
          accountId: 1,
          ticketTypeRequests: [
            new TicketTypeRequest("ADULT", 3),
            new TicketTypeRequest("CHILD", 2),
          ],
          desc: "3 adults, 2 children",
          price: "£120",
          seats: 5,
        },
        {
          accountId: 100,
          ticketTypeRequests: [
            new TicketTypeRequest("ADULT", 3),
            new TicketTypeRequest("INFANT", 3),
          ],
          desc: "3 adults, 5 infants",
          price: "£120",
          seats: 8,
        },
      ];
      describe.each(cases)(
        "accountId = $accountId with tickets = $desc",
        ({ accountId, ticketTypeRequests, seats, price }) => {
          it(`then ${price} is paid and ${seats} seats are allocated`, () => {
            console.log(...ticketTypeRequests);
            expect(() =>
              ticketService.purchaseTickets(accountId, ...ticketTypeRequests),
            ).not.toThrow(InvalidPurchaseException);
          });
        },
      );
    });
    describe("Given an invalid accountId of", () => {
      const invalidAccountIds = [null, undefined, -1, 0, "A"];
      const ticketTypeRequests = {};
      describe.each(invalidAccountIds)("%p", (accountId) => {
        it("then an InvalidPurchaseException is thrown", () => {
          expect(() =>
            ticketService.purchaseTickets(accountId, ticketTypeRequests),
          ).toThrow(
            new InvalidPurchaseException(`Invalid Account ID: ${accountId}`),
          );
        });
      });
    });

    describe("Given an invalid ticketTypeRequest of", () => {
      const accountId = 1;
      const invalidTicketTypeRequest = [
        undefined,
        null,
        { type: "ADULT", noOfTickets: 5 },
        {},
      ];
      describe.each(invalidTicketTypeRequest)("%p", (ticketTypeRequest) => {
        it("then an InvalidPurchaseException is thrown", () => {
          expect(() =>
            ticketService.purchaseTickets(accountId, ticketTypeRequest),
          ).toThrow(
            new InvalidPurchaseException(
              `Invalid Ticket Type Request: ${JSON.stringify(ticketTypeRequest)}`,
            ),
          );
        });
      });
    });

    describe("Given an invalid number of tickets", () => {
      const accountId = 1;
      const invalidNumberOfIndividualTickets = [26, -1];
      const invalidNumberOfCombinedTickets = [
        [26, 1, 1],
        [10, 10, 10],
      ];
      describe.each(invalidNumberOfIndividualTickets)(
        "of %i adults",
        (noOfTickets) => {
          it("then an InvalidPurchaseException is thrown", () => {
            console.log(noOfTickets);
            console.log(accountId);
            expect(() =>
              ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest("ADULT", noOfTickets),
              ),
            ).toThrow(
              new InvalidPurchaseException(`Invalid number of tickets: `),
            );
          });
        },
      );

      describe.each(invalidNumberOfCombinedTickets)(
        "of %i adults, %i children and %i infants",
        (numberOfTickets) => {
          it("then an InvalidPurchaseException is thrown", () => {
            expect(() =>
              ticketService.purchaseTickets(accountId, {
                adults: numberOfTickets[0],
                children: numberOfTickets[1],
                infants: numberOfTickets[2],
              }),
            ).toThrow(InvalidPurchaseException);
          });
        },
      );
    });

    describe("Given infants should not pay or be allocated seats", () => {
      // infinite infants on adult lap? assume 1 per adult
      const dataSet = [[1, 1, 10, 1]];
      it.each(dataSet)(
        "then %i adults and %i infants should pay %i for %i seats",
        () => {
          const accountId = 1;
          expect(() =>
            ticketService.purchaseTickets(accountId, ticketTypeRequests),
          ).not.toThrow(InvalidPurchaseException);
        },
      );
    });

    describe("Given there is no adult", () => {
      const childrenAndInfants = [
        [1, 2],
        [1, 0],
        [0, 1],
      ];
      const accountId = 1;
      const ticketTypeRequests = {};

      describe.each(childrenAndInfants)(
        "with %i children and %i infants",
        () => {
          it("then an InvalidPurchaseException is thrown", () => {
            expect(() =>
              ticketService.purchaseTickets(accountId, ticketTypeRequests),
            ).toThrow(InvalidPurchaseException);
          });
        },
      );
    });
  });
});
// assumption that tickets can be oprdered like 1 adult, 2 adult 1 child
//1 adult, 1 child. etc.
// assumption 1 adult per child + infant vs 1 adult for many.
