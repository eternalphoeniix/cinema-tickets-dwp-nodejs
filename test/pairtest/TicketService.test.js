import InvalidPurchaseException from "../../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../../src/pairtest/lib/TicketTypeRequest";
import TicketService from "../../src/pairtest/TicketService";
import { MAX_TICKETS } from "../../src/pairtest/TicketServiceConfig";
import TicketPaymentService from "../../src/thirdparty/paymentgateway/TicketPaymentService";
import SeatReservationService from "../../src/thirdparty/seatbooking/SeatReservationService";

describe("TicketService", () => {
  let ticketService = new TicketService();
  beforeEach(() => {
    ticketService = new TicketService();
  });
  describe("purchaseTickets", () => {
    //happy path
    describe("Given a valid input of", () => {
      let spyMakePayment;
      let spyReserveSeat;
      beforeEach(() => {
        spyMakePayment = jest
          .spyOn(TicketPaymentService.prototype, "makePayment")
          .mockImplementation(() => {});
        spyReserveSeat = jest
          .spyOn(SeatReservationService.prototype, "reserveSeat")
          .mockImplementation(() => {});
      });
      afterEach(() => {
        spyMakePayment.mockRestore();
        spyReserveSeat.mockRestore();
      });
      const cases = [
        {
          accountId: 2,
          ticketTypeRequests: [new TicketTypeRequest("ADULT", 3)],
          desc: "3 adults",
          price: 75,
          seats: 3,
        },
        {
          accountId: 1,
          ticketTypeRequests: [
            new TicketTypeRequest("ADULT", 3),
            new TicketTypeRequest("CHILD", 2),
          ],
          desc: "3 adults, 2 children",
          price: 105,
          seats: 5,
        },
        {
          accountId: 100,
          ticketTypeRequests: [
            new TicketTypeRequest("ADULT", 3),
            new TicketTypeRequest("INFANT", 3),
          ],
          desc: "3 adults, 3 infants",
          price: 75,
          seats: 3,
        },
      ];
      describe.each(cases)(
        "accountId = $accountId with ticket requests of $desc",
        ({ accountId, ticketTypeRequests, seats, price }) => {
          it(`then ${price} is paid and ${seats} seats are allocated`, () => {
            expect(() =>
              ticketService.purchaseTickets(accountId, ...ticketTypeRequests),
            ).not.toThrow(InvalidPurchaseException);
            expect(spyMakePayment).toHaveBeenCalledWith(accountId, price);
            expect(spyMakePayment).toHaveBeenCalledTimes(1);
            expect(spyReserveSeat).toHaveBeenCalledWith(accountId, seats);
            expect(spyReserveSeat).toHaveBeenCalledTimes(1);
          });
        },
      );
    });

    //invalid cases
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
      const invalidMaxTickets = MAX_TICKETS + 1;
      const ticketTypes = ["ADULT", "CHILD", "INFANT"];
      const invalidNumberOfCombinedTickets = [
        [26, 1, 1],
        [10, 10, 10],
      ];
      const invalidMinimumTickets = [0, -1];
      describe.each(ticketTypes)(`of ${invalidMaxTickets} %s`, (ticketType) => {
        it("then an InvalidPurchaseException is thrown", () => {
          expect(() =>
            ticketService.purchaseTickets(
              accountId,
              new TicketTypeRequest(ticketType, invalidMaxTickets),
            ),
          ).toThrow(
            new InvalidPurchaseException(
              `${invalidMaxTickets} tickets is over the maximum limit of ${MAX_TICKETS}`,
            ),
          );
        });
      });

      describe.each(invalidNumberOfCombinedTickets)(
        "of %i adults, %i children and %i infants",
        (adultTickets, childTickets, infantTickets) => {
          it("then an InvalidPurchaseException is thrown", () => {
            const total = adultTickets + childTickets + infantTickets;
            expect(() =>
              ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest("ADULT", adultTickets),
                new TicketTypeRequest("CHILD", childTickets),
                new TicketTypeRequest("INFANT", infantTickets),
              ),
            ).toThrow(
              new InvalidPurchaseException(
                `${total} tickets is over the maximum limit of ${MAX_TICKETS}`,
              ),
            );
          });
        },
      );
      describe.each(invalidMinimumTickets)(
        "of %i adults",
        (numberOfTickets) => {
          it("then an InvalidPurchaseException is thrown", () => {
            expect(() =>
              ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest("ADULT", numberOfTickets),
              ),
            ).toThrow(
              new InvalidPurchaseException(
                `${numberOfTickets} is below the minimum ticket request of 1`,
              ),
            );
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
