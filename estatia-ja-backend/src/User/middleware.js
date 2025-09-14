const { createUserShema } = require('./validation');

const validationCreateUser = (req, res, next) => {
    const { error, value } = createUserShema.validate(req.body);
    if(error){
        return res.status(400).json({ error: error.details[0].message });
    }

    req.validatedData = value;
    next();
}

module.exports = validationCreateUser;