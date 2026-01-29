import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import { MAX_TICKETS, ticketConfig } from "./TicketServiceConfig.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  #totalAdultTickets;
  #totalChildTickets;
  #totalInfantTickets;

  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#resetState();
    // sanitise input parameters
    this.#validateAccountId(accountId);
    this.#validateticketTypeRequests(ticketTypeRequests);
    // count tickets
    this.#countTickets(ticketTypeRequests);
    // apply business logic
    this.#validateNumberOfTickets();
    this.#validateAdultTicketExists();
    this.#validateInfantToAdultRatio();

    // execute purchase
    const totalAmountToPay = this.#calculateAmountToPay();
    const totalSeatsToReserve = this.#calculateSeatsToReserve();

    this.#makePayment(accountId, totalAmountToPay);
    this.#reserveSeat(accountId, totalSeatsToReserve);
  }

  #resetState() {
    this.#totalAdultTickets = 0;
    this.#totalChildTickets = 0;
    this.#totalInfantTickets = 0;
  }
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new InvalidPurchaseException(`Invalid Account ID: ${accountId}`);
    }
  }
  #validateticketTypeRequests(ticketTypeRequests) {
    ticketTypeRequests.forEach((ticketTypeRequest) => {
      if (!(ticketTypeRequest instanceof TicketTypeRequest)) {
        throw new InvalidPurchaseException(
          `Invalid Ticket Type Request: ${JSON.stringify(ticketTypeRequest)}`,
        );
      }
      if (ticketTypeRequest.getNoOfTickets() < 1) {
        throw new InvalidPurchaseException(
          `${ticketTypeRequest.getNoOfTickets()} is below the minimum ticket request of 1`,
        );
      }
    });
  }
  #countTickets(ticketTypeRequests) {
    for (const request of ticketTypeRequests) {
      const count = request.getNoOfTickets();

      switch (request.getTicketType()) {
        case "ADULT":
          this.#totalAdultTickets += count;
          break;
        case "CHILD":
          this.#totalChildTickets += count;
          break;
        case "INFANT":
          this.#totalInfantTickets += count;
          break;
        default:
          throw new InvalidPurchaseException("Unknown ticket type");
      }
    }
  }
  #validateNumberOfTickets() {
    const totalTickets =
      this.#totalAdultTickets +
      this.#totalChildTickets +
      this.#totalInfantTickets;
    if (totalTickets > MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `${totalTickets} tickets is over the maximum limit of ${MAX_TICKETS}`,
      );
    }
  }
  #validateAdultTicketExists() {
    if (this.#totalAdultTickets < 1) {
      throw new InvalidPurchaseException(
        "At least 1 adult ticket must be purchased",
      );
    }
  }
  #validateInfantToAdultRatio() {
    if (this.#totalInfantTickets > this.#totalAdultTickets) {
      throw new InvalidPurchaseException("There must be 1 adult per infant");
    }
  }

  #calculateAmountToPay() {
    return (
      this.#totalAdultTickets * ticketConfig.ADULT.price +
      this.#totalChildTickets * ticketConfig.CHILD.price
    );
  }
  #calculateSeatsToReserve() {
    return this.#totalAdultTickets + this.#totalChildTickets;
  }
  #makePayment(accountId, totalAmountToPay) {
    const ticketPaymentService = new TicketPaymentService();
    ticketPaymentService.makePayment(accountId, totalAmountToPay);
  }
  #reserveSeat(accountId, totalSeatsToAllocate) {
    const seatReservationService = new SeatReservationService();
    seatReservationService.reserveSeat(accountId, totalSeatsToAllocate);
  }
}
