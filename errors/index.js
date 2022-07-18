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
        FIXTURE_NOT_FOUND: 'Fixture not found',
        FIXTURES_NOT_FOUND: 'Fixtures not yet created'
    },
    gameweekErrors: {
        GAMEWEEK_NOT_FOUND: 'Gameweek not found'
    },
    teamErrors : {
        HOME_TEAM_NOT_FOUND : 'Home team not found',
        AWAY_TEAM_NOT_FOUND : 'Away team not found',
        UNIQUE_IDS: 'Home Team Id and Away Team Id must be different'
    }
};
