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
    teamErrors : {
        TEAM_NAME_EXISTS: 'A team with similar name already exist. Please choose another one.',
        TEAM_SHORTNAME_EXISTS: 'A team with similar short name already exist. Please choose another one.',
        TEAM_JERSEY_EXISTS: 'A team with similar jersey already exist. Please choose another one.',
        TEAM_NOT_FOUND: 'Team not found'
    },
    seasonErrors: {
        SEASON_NAME_EXISTS: 'There is a season with similar name. Please choose another one.',
        SEASON_NOT_FOUND: 'Season not found'
    },
    gameweekErrors: {
        GAMEWEEK_TITLE_EXISTS: 'There is a gameweek with similar title in this season. Please use another one.',
        GAMEWEEK_DEADLINE_ERROR: 'Deadline cannot be in the past. Please select another one',
        GAMEWEEK_NOT_FOUND: 'Gameweek not found'
    },
    leagueErrors : {
        LEAGUE_NOT_FOUND : 'League not found.',
        LEAGUE_PERMISSION_ERROR : 'Only the league admin can perform this action.',
        INVALID_LEAGUE_CODE : 'The invite code is invalid, expired, or has been revoked by the league admin.',
        LEAGUE_CLOSED : 'The league is closed to new entries.',
        LEAGUE_FULL : 'The league has reached its players limit.',
        LEAGUE_ALREADY_JOINED : 'You are already participating in this league.',
        LEAGUES_MAXED : 'You have joined the maximum number of leagues allowed.',
        NOT_A_PARTICIPANT : 'You are not participating in this league.',
        PLAYER_NOT_IN_LEAGUE : 'Player not in league.',
        SUSPENDED_FROM_LEAGUE : 'You have been suspended from this league.',
        PLAYER_NOT_IN_SUSPENDED_LIST : 'Player is not in the list of suspended players.',
        ADMIN_NO_LEAVE : 'You cannot leave this league. Change the administrator to leave'
    }
};
