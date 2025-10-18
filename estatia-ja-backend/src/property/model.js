class Property {
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.description = data.description;
        this.numberOfBedroom = data.numberOfBedroom;
        this.numberOfSuite = data.numberOfSuite;
        this.numberOfGarage = data.numberOfGarage;
        this.numberOfRoom = data.numberOfRoom;
        this.numberOfBathroom = data.numberOfBathroom;
        this.outdoorArea = data.outdoorArea;
        this.pool = data.pool;
        this.barbecue = data.barbecue;
        this.street = data.street;
        this.number = data.number;
        this.neighborhood = data.neighborhood;
        this.state = data.state;
        this.city = data.city;
        this.CEP = data.CEP;
        this.dailyRate = data.dailyRate;
        this.userId = data.userId;
        this.images = data.images ? data.images.map(img => ({ id: img.id })) : [];
        if(data.user) {
            this.user = data.user;
        }

        if (data.avgRating !== undefined) {
            this.avgRating = data.avgRating;
        }
    }

    toJSON() {
        return this;
    }
}

export default Property;