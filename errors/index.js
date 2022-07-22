module.exports = {
    authErrors: {
        INVALID_CREDENTIALS_ERROR: 'Invalid credentials.',
        USERNAME_EXISTS_ERROR:
      'An account already exists with that username. Please choose another.',
        EMAIL_EXISTS_ERROR: 'An account already exists with that email address.',
        ACCOUNT_NOT_FOUND: 'Account not found.',
        INCORRECT_PASSWORD: 'Incorrect password.',
        TOKEN_REQUIRED: 'You need to be logged in to access this functionality.',
        INVALID_SESSION: 'Invalid session.'
    },
    userErrors: {
        USER_NOT_FOUND: 'User not found'
    },
    fixtureErrors: {
        FIXTURE_NOT_FOUND: 'Fixture not found'
    },
    gameweekErrors: {
        GAMEWEEK_NOT_FOUND: 'Gameweek not found'
    },
    teamErrors : {
        UNIQUE_IDS: 'Home Team Id and Away Team Id must be different'
    },
    picksErrors : {
        MASTER_PICK_LESS_THAN_ONE: 'Master pick cannot be less than 1',
        MASTER_PICK_GREATER_THAN_ONE: 'Master pick cannot be greater than 1',
        PICK_ALREADY_EXISTS: 'Pick already exists',
        PICK_NOT_FOUND: 'Pick not found'
    }
};
