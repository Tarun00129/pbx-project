const Joi = require('joi');

const loginParam = {
    body: {
        username: Joi.string().required(),
        password: Joi.string().required()
    }
}
module.exports = { loginParam };