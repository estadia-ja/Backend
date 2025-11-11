class PropertyValuation {
  constructor(data) {
    ((this.id = data.id),
      (this.noteProperty = data.noteProperty),
      (this.commentProperty = data.commentProperty),
      (this.reserveId = data.reserveId));
  }

  toJson() {
    return this;
  }
}

export default PropertyValuation;
