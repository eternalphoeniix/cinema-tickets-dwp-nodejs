import InvalidPurchaseException from "../../src/pairtest/lib/InvalidPurchaseException";
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
          accountId: 1,
          ticketTypeRequests: [{ adults: 3, children: 2 }],
          desc: "3 adults, 2 children",
          price: "£120",
          seats: 5,
        },
        {
          accountId: 100,
          ticketTypeRequests: [{ adults: 3 }, { infants: 5 }],
          desc: "3 adults, 5 infants",
          price: "£120",
          seats: 8,
        },
        {
          accountId: 2,
          ticketTypeRequests: [{ adults: 3 }],
          desc: "3 adults",
          price: "£120",
          seats: 3,
        },
      ];
      describe.each(cases)(
        "accountId=$accountId with tickets=$desc",
        ({ accountId, ticketTypeRequests, seats, price }) => {
          it(`then ${price} is paid and ${seats} seats are allocated`, () => {
            expect(() =>
              ticketService.purchaseTickets(accountId, ticketTypeRequests),
            ).not.toThrow(InvalidPurchaseException);
          });
        },
      );
    });
    describe("Given an invalid accountId of", () => {
      const invalidAccountIds = [-1, 0, "A", null, undefined];
      describe.each(invalidAccountIds)("%p", () => {
        it("then an InvalidPurchaseException is thrown", () => {});
      });
    });

    describe("Given an invalid ticketTypeRequest of", () => {
      const invalidTicketTypeRequest = [null, undefined, {}];
      describe.each(invalidTicketTypeRequest)("%p", () => {
        it("then an InvalidPurchaseException is thrown", () => {});
      });
    });
    describe("Given an invalid number of tickets of", () => {
      const invalidNumberOfTickets = [null, undefined, {}, 26, -1];
      describe.each(invalidNumberOfTickets)("%p", () => {
        it("then an InvalidPurchaseException is thrown", () => {});
      });
    });

    describe("Given infants are present", () => {
      it("then they should not pay and not be allocated a seat", () => {});
    });

    describe("Given there is no adult", () => {
      const childrenAndInfants = [
        [1, 2],
        [1, 0],
        [0, 1],
      ];
      describe.each(childrenAndInfants)(
        "with %i children and %i infants",
        () => {
          it("then an InvalidPurchaseException is thrown", () => {});
        },
      );
    });
  });
});
