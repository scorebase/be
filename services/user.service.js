const User = require('../models/user.model');
const { NotFoundError} = require('../errors/http_errors');
const {userErrors } = require('../errors');

const {USER_NOT_FOUND} = userErrors;

class UserService {
    static async getProfile(id) {
        const user = await User.findByPk(id);
        if(!user) throw new NotFoundError(USER_NOT_FOUND);

        //delete password_hash from response
        user.password = undefined;

        const data = {
            user
        };

        return data;
    }

};

module.exports = UserService;