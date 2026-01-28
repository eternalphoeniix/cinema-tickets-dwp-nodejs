import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import { MAX_TICKETS } from "./TicketServiceConfig.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // sanitise input parameters
    this.#validateAccountId(accountId);
    this.#validateticketTypeRequests(ticketTypeRequests);

    // apply business logic
    this.#validateNumberOfTickets(ticketTypeRequests);
    this.#validateAdultTicketExists(ticketTypeRequests);
    this.#validateInfantToAdultRatio(ticketTypeRequests);

    // execute logic
    const totalAmountToPay = this.#calculateAmountToPay(ticketTypeRequests);

    const totalSeatsToAllocate = "todo";
    this.#makePayment(accountId, totalAmountToPay);
    this.#reserveSeats(accountId, totalSeatsToAllocate);
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
  #validateNumberOfTickets(ticketTypeRequests) {
    let totalTickets = 0;
    ticketTypeRequests.forEach((ticketTypeRequest) => {
      if (ticketTypeRequest.getNoOfTickets() < 1) {
        throw new InvalidPurchaseException(
          `${ticketTypeRequest.getNoOfTickets()} is below the minimum ticket request of 1`,
        );
      }
      totalTickets += ticketTypeRequest.getNoOfTickets();
    });
    if (totalTickets > MAX_TICKETS) {
      throw new InvalidPurchaseException(
        `${totalTickets} tickets is over the maximum limit of ${MAX_TICKETS}`,
      );
    }
  }
  #validateAdultTicketExists(ticketTypeRequests) {
    const hasAdult = ticketTypeRequests.some(
      (ticketTypeRequest) => ticketTypeRequest.getTicketType() === "ADULT",
    );
    if (!hasAdult) {
      throw new InvalidPurchaseException(
        "At least 1 adult ticket must be purchased",
      );
    }
  }
  #validateInfantToAdultRatio(ticketTypeRequests) {
    //could condense both checks into 1, but preference.
    const totalAdults = ticketTypeRequests.reduce(
      (sum, ticketTypeRequest) =>
        ticketTypeRequest.getTicketType() === "ADULT"
          ? sum + ticketTypeRequest.getNoOfTickets()
          : sum,
      0,
    );
    const totalInfants = ticketTypeRequests.reduce(
      (sum, ticketTypeRequest) =>
        ticketTypeRequest.getTicketType() === "INFANT"
          ? sum + ticketTypeRequest.getNoOfTickets()
          : sum,
      0,
    );
    if (totalInfants > totalAdults) {
      throw new InvalidPurchaseException("There must be 1 adult per infant");
    }
  }

  #calculateAmountToPay(ticketTypeRequests) {
    ticketTypeRequests.forEach((ticketTypeRequest) => {});
  }
}
