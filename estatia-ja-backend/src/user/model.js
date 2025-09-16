class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.cpf = data.cpf;
        this.password = data.password;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
    toJSON() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          phone: this.phone,
          cpf: this.cpf,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
    }
}
    
module.exports = User;
