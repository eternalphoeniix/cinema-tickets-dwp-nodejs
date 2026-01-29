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

  /** Purchase tickets by making payment and reserving seats */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    this.#resetState();
    this.#validateAccountId(accountId);
    this.#validateticketTypeRequests(ticketTypeRequests);
    this.#countTickets(ticketTypeRequests);
    this.#validateNumberOfTickets();
    this.#validateAdultTicketExists();
    this.#validateInfantToAdultRatio();

    const totalAmountToPay = this.#calculateAmountToPay();
    const totalSeatsToReserve = this.#calculateSeatsToReserve();
    this.#makePayment(accountId, totalAmountToPay);
    this.#reserveSeat(accountId, totalSeatsToReserve);
  }
  /** Resets the state/ticketnumbers of the TicketService */
  #resetState() {
    this.#totalAdultTickets = 0;
    this.#totalChildTickets = 0;
    this.#totalInfantTickets = 0;
  }
  /** Apply logic validations to the Account ID */
  #validateAccountId(accountId) {
    if (!Number.isInteger(accountId) || accountId < 1) {
      throw new InvalidPurchaseException(`Invalid Account ID: ${accountId}`);
    }
  }
  /** Apply logic validations to the ticketTypeRequests */
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
  /** Count each tickets for each ticket type */
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
  /** Business validation for number of each ticket and total tickets */
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
  /** Apply logic ensuring an adult ticket exists */

  #validateAdultTicketExists() {
    if (this.#totalAdultTickets < 1) {
      throw new InvalidPurchaseException(
        "At least 1 adult ticket must be purchased",
      );
    }
  }
  /** Apply logic validations to ensure each infant has an attending adult */
  #validateInfantToAdultRatio() {
    if (this.#totalInfantTickets > this.#totalAdultTickets) {
      throw new InvalidPurchaseException("There must be 1 adult per infant");
    }
  }
  /** Calculate cost from ticket type * number of tickets */
  #calculateAmountToPay() {
    return (
      this.#totalAdultTickets * ticketConfig.ADULT.price +
      this.#totalChildTickets * ticketConfig.CHILD.price
    );
  }
  /** Calculate number of seats to reserve from type of ticket * number of tickets */
  #calculateSeatsToReserve() {
    return this.#totalAdultTickets + this.#totalChildTickets;
  }
  /** Call the TicketPaymentService to make a payment */
  #makePayment(accountId, totalAmountToPay) {
    const ticketPaymentService = new TicketPaymentService();
    ticketPaymentService.makePayment(accountId, totalAmountToPay);
  }
  /** Call the SeatReservationService to reserve seats */
  #reserveSeat(accountId, totalSeatsToAllocate) {
    const seatReservationService = new SeatReservationService();
    seatReservationService.reserveSeat(accountId, totalSeatsToAllocate);
  }
}
