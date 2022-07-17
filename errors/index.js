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
        USER_NOT_FOUND : 'User not found'
    },
    seasonErrors: {
        SEASON_NAME_EXISTS: 'There is a season with similar name. Please choose another one.',
        SEASON_NOT_FOUND: 'Season not found'
    },
    gameweekErrors: {
        GAMEWEEK_TITLE_EXISTS: 'There is a gameweek with similar title in this season. Please use another one.',
        GAMEWEEK_DEADLINE_ERROR: 'Deadline cannot be in the past. Please select another one',
        GAMEWEEK_NOT_FOUND: 'Gameweek not found'
    }
};
