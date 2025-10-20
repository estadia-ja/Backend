class Reserve {
    constructor(data){
        this.id = data.id,
        this.dateStart = data.dateStart,
        this.dateEnd = data.dateEnd,
        this.status = data.status,
        this.propertyId = data.propertyId,
        this.userId = data.userId;

        if (data.property) {
            this.property = {
                id: data.property.id,
                type: data.property.type,
                dailyRate: data.property.dailyRate,
            }
        }

        if(data.user) {
            this.user = {
                id: data.user.id,
                name: data.user.name
            }
        }
    }

    toJSON(){
        return this;
    }
}

export default Reserve;