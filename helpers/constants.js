module.exports.TOKEN_HEADER = 'x-user-token';

module.exports.ADMIN_SECRET_HEADER = 'x-admin-secret';

module.exports.TOKEN_TYPES = {
    resetPassword: 'RESET_PASSWORD',
    registerUser : 'REGISTER_USER'
};

module.exports.RESET_PASSWORD_TOKEN_LENGTH = 30;

module.exports.RESET_PASSWORD_EXP_TIME = 15;

module.exports.RESET_PASSWORD_TEMPLATE_NAME = 'reset_password';

module.exports.ONE_MINUTE = 60000;

module.exports.LEAGUE_TYPES = {general : 1, public : 2, private : 3};

module.exports.REGISTER_USER_TOKEN_LENGTH = 6;

module.exports.REGISTER_USER_TOKEN_EXP_TIME = 20;

module.exports.THREE_HOURS = 60000 * 60 * 3;

module.exports.LEAGUE_CODE_LENGTH = 7;

module.exports.MAX_LEAGUES_PER_PLAYER = 20; //maximum number of leagues a player can participate in.

module.exports.REGISTER_USER_MAIL = 'register_user';

module.exports.WELCOME_USER_MAIL = 'welcome_user';

module.exports.PICKS_REMINDER= 'picks_reminder';
