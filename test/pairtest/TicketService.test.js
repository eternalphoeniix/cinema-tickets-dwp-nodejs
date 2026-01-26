describe("TicketService", () => {
  describe("purchaseTickets", () => {
    describe("Given a valid purchase", () => {
      it("then the price is paid and then seats are allocated", () => {});
    });
    describe("Given an invalid accountID", () => {
      it("then an InvalidPurchaseException is thrown", () => {});
    });
    describe("Given an invalid ticketTypeRequest", () => {
      it("then an InvalidPurchaseException is thrown", () => {});
    });
    describe("Given an invalid number of tickets", () => {
      it("then an InvalidPurchaseException is thrown", () => {});
    });
    describe("Given infants are present", () => {
      it("then they should not pay and not be allocated a seat", () => {});
    });
    describe("Given infants or children are unaccompanied by an adult", () => {
      it("then an InvalidPurchaseException is thrown", () => {});
    });
    it("should check types and null checks", () => {});
  });
});
