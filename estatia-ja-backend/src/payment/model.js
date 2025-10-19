class Payment {
    constructor(data) {
        this.id = data.id;
        this.paymentValue = data.paymentValue;
        this.datePayment = data.datePayment;
        this.reserveId = data.reserveId;
    }

    toJSON() {
        return this;
    }
}

export default Payment;