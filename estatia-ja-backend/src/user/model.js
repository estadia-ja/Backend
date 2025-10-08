class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.cpf = data.cpf;
        this.password = data.password;
        this.image = data.image;
        this.phones = data.phones || [];
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    toJSON() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          cpf: this.cpf,
          image: this.image,
          phones: this.phones,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
    }
}
    
export default User;
