module.exports = {
    authErrors : {
        INVALID_CREDENTIALS_ERROR :'Invalid credentials.',
        USERNAME_EXISTS_ERROR :'An account already exists with that username. Please choose another.',
        EMAIL_EXISTS_ERROR :'An account already exists with that email address.',
        ACCOUNT_NOT_FOUND : 'Account not found.',
        INCORRECT_PASSWORD : 'Incorrect password.',
        TOKEN_REQUIRED : 'You need to be logged in to access this functionality.',
        INVALID_SESSION : 'Invalid session.'
    },
    userErrors : {
        USER_NOT_FOUND : 'User not found.'
    },
    leagueErrors : {
        LEAGUE_NOT_FOUND : 'League not found.',
        LEAGUE_PERMISSION_ERROR : 'Only the league admin can perform this action.',
        INVALID_LEAGUE_CODE : 'The invite code is invalid, expired, or has been revoked by the league admin.',
        LEAGUE_CLOSED : 'The league is closed to new entries.',
        LEAGUE_FULL : 'The league has reached its players limit.',
        LEAGUE_ALREADY_JOINED : 'You are already participating in this league.',
        LEAGUES_MAXED : 'You have joined the maximum number of leagues allowed.',
        NOT_A_PARTICIPANT : 'You are not participating in this league.'
    }
};
