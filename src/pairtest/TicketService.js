import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    try {
      this.#validateAccountId(accountId);
      this.#validateticketTypeRequests(ticketTypeRequests);

      const totalAmountToPay = "todo";
      const totalSeatsToAllocate = "todo";
      this.#makePayment(accountId, totalAmountToPay);
      this.#reserveSeats(accountId, totalSeatsToAllocate);
    } catch (error) {
      // console.log(error);
      // always need to throw this exception, so better than individual throw types.
      throw new InvalidPurchaseException(error.message);
    }
  }
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new Error(`Invalid Account ID: ${accountId}`);
    }
  }
  #validateticketTypeRequests(ticketTypeRequests) {
    ticketTypeRequests.forEach((ticketTypeRequest) => {
      if (!(ticketTypeRequest instanceof TicketTypeRequest)) {
        throw new Error(
          `Invalid Ticket Type Request: ${JSON.stringify(ticketTypeRequest)}`,
        );
      }
    });
  }
  #makePayment(accountId, totalAmountToPay) {
    const ticketPaymentService = new TicketPaymentService(
      accountId,
      totalAmountToPay,
    );
    ticketPaymentService.makePayment();
  }
  #reserveSeats(totalSeatsToAllocate) {
    const seatReservationService = new SeatReservationService(
      accountId,
      totalSeatsToAllocate,
    );
    seatReservationService.reserveSeat();
  }
}
