const User = require('../models/user.model');
const { NotFoundError} = require('../errors/http_errors');
const {userErrors } = require('../errors');
const CacheService = require('./cache.service');
const cache = new CacheService('user');

const {USER_NOT_FOUND} = userErrors;

class UserService {
    static async getProfile(id) {
        const cached = cache.load(id);
        if(cached) return cached;

        const user = await User.findByPk(id, { raw : true });
        if(!user) throw new NotFoundError(USER_NOT_FOUND);

        //delete password_hash from response
        user.password = undefined;

        cache.insert(id, user);

        return user;
    }

    static async loadByUserName(username) {
        const user = await User.findOne({ where : { username } });
        if(!user) throw new NotFoundError(USER_NOT_FOUND);

        //delete password_hash from response
        user.password = undefined;

        return user;
    }

    static async updateUserProfile(id, updatedProfile){
        const user = await User.findByPk(id, { raw : true });
        if(!user) throw new NotFoundError(USER_NOT_FOUND);

        const updatedUser = { full_name : updatedProfile.full_name, username : updatedProfile.username };
        await user.update(updatedUser);

        user.password = undefined;

        return user;
    }

}

module.exports = UserService;