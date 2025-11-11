class ClientValuation {
  constructor(data) {
    this.id = data.id;
    this.noteClient = data.noteClient;
    this.commentClient = data.commentClient;
    this.dateClientValuation = data.dateClientValuation;
    this.reserveId = data.reserveId;
  }

  toJSON() {
    return this;
  }
}

export default ClientValuation;
