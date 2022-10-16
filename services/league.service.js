const { customAlphabet } = require('nanoid');
const sequelize = require('../config/db');
const { leagueErrors } = require('../errors');
const { NotFoundError, ForbiddenError, ServiceError } = require('../errors/http_errors');
const { LEAGUE_CODE_LENGTH, MAX_LEAGUES_PER_PLAYER } = require('../helpers/constants');
const League = require('../models/league.model');
const LeagueMember = require('../models/league_member.model');
const { playerLeaguesQuery, leagueStandingQuery} = require('../helpers/query/league.query');
const {QueryTypes, col} = require('sequelize');
const GameweekService = require('./gameweek.service');
const User = require('../models/user.model');
const CacheService = require('./cache.service');

const alphabet = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
class LeagueService {
    /**
     *
     * @param {integer} userId
     * @param {string} name League name
     * @param {integer} max_participants
     * @param {string} type League type
     * @param {int} starting_gameweek
     * @returns {object}
     */
    static async createLeague(userId, name, max_participants, type, starting_gameweek) {
        //ensure user has not joined maximum number of leagues allowed.
        this.validateUserLeaguesCount(userId);

        const t = await sequelize.transaction();

        try {
            const invite_code = this.generateLeagueCode();

            const league = await League.create({
                name,
                invite_code,
                max_participants,
                type,
                starting_gameweek,
                administrator_id : userId
            }, { transaction : t });

            //automatically add the creator to the league
            await LeagueMember.create({
                player_id : userId,
                league_id : league.id
            }, { transaction : t });

            await t.commit();

            return league.toJSON();
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    /**
     * @param {number} userId
     * @param {number} leagueId
     * @param {object} changes Changes to make
     * @returns {object}
     */
    static async updateLeague(userId, leagueId, changes) {
        const league = await this.loadLeague(leagueId);

        //ensure league can only be updated by admin
        this.validateLeagueAdmin(userId, league.administrator_id);

        const updatedLeague = await league.update(changes);

        return updatedLeague.toJSON();
    }

    /**
     * Delete a league
     * @param {*} userId
     * @param {*} leagueId
     */
    static async deleteLeague(userId, leagueId) {
        const league = await this.loadLeague(leagueId);

        this.validateLeagueAdmin(userId, league.administrator_id);

        await league.destroy();
    }

    /**
     * Generate a new code for league
     * @param {*} userId
     * @param {*} leagueId
     * @returns
     */
    static async regenerateCode(userId, leagueId) {
        const league = await this.loadLeague(leagueId);

        this.validateLeagueAdmin(userId, league.administrator_id);

        const newCode = this.generateLeagueCode();

        league.invite_code = newCode;

        await league.save();

        return {
            newCode
        };
    }

    /**
     * @param {number} userId id of the user that want to join league
     * @param {string} invite_code League invite code
     */
    static async joinLeague(userId, invite_code) {
        //ensure user has not joined maximum number of leagues allowed.
        await this.validateUserLeaguesCount(userId);

        const league = await League.findOne({
            where : { invite_code }, raw : true,
            attributes : ['is_closed', 'id', 'max_participants', 'name', 'type', 'administrator_id']
        });

        if(!league) throw new NotFoundError(leagueErrors.INVALID_LEAGUE_CODE);

        //if league is closed to new entries
        if(league.is_closed) throw new ServiceError(leagueErrors.LEAGUE_CLOSED);

        //check if user is already in the league
        const alreadyInLeague = await LeagueMember.findOne({ where : { league_id : league.id, player_id : userId }});
        if(alreadyInLeague) {
            //if user has been suspended from league
            if(alreadyInLeague.is_suspended) throw new ServiceError(leagueErrors.SUSPENDED_FROM_LEAGUE);

            throw new ServiceError(leagueErrors.LEAGUE_ALREADY_JOINED);
        }

        //ensure the league has not reached its maximum number of participants
        const current_participants = await LeagueMember.count({
            where : { league_id : league.id, is_suspended : false }
        });

        if(current_participants >= league.max_participants) throw new ServiceError(leagueErrors.LEAGUE_FULL);

        //else add user to the league
        await LeagueMember.create({
            player_id : userId,
            league_id : league.id
        });

        const data = { name : league.name, id : league.id,
            type : league.type,
            administrator_id : league.administrator_id };

        return data;
    }
    /**
     * @param {number} userId id of the user that want to leave league
     * @param {string} leagueId League id
     */
    static async leaveLeague(userId, leagueId) {
        const league = await this.loadLeague(leagueId, true);
        //ensure an admin can't leave their own league
        if(league.administrator_id === userId) throw new ServiceError(leagueErrors.ADMIN_NO_LEAVE);

        //check if user is in league
        const isLeagueMember = await LeagueMember.findOne({
            where : { league_id : leagueId, player_id : userId }
        });
        if(!isLeagueMember) throw new ServiceError(leagueErrors.NOT_A_PARTICIPANT);

        await isLeagueMember.destroy();
    }
    /**
     * Remove a player from a league
     * @param {number} playerId (id of player to suspend)
     * @param {number} leagueId
     * @param {number} userId id of person making request (must be league admin)
     */
    static async removePlayer(playerId, leagueId, userId) {
        const league = await this.loadLeague(leagueId, true);
        this.validateLeagueAdmin(userId, league.administrator_id);

        if(league.administrator_id === +playerId) throw new ServiceError(leagueErrors.ADMIN_REMOVE_SELF);
        const isLeagueMember = await LeagueMember.findOne({
            where : { league_id : leagueId, player_id : playerId }
        });
        if(!isLeagueMember || isLeagueMember.is_suspended) throw new NotFoundError(leagueErrors.PLAYER_NOT_IN_LEAGUE);

        isLeagueMember.is_suspended = true;

        await isLeagueMember.save();
    }

    /**
     * Restore a player to a league
     * @param {number} playerId (id of player to restore)
     * @param {number} leagueId
     * @param {number} userId id of person making request (must be league admin)
     */
    static async restorePlayer(playerId, leagueId, userId) {
        const league = await this.loadLeague(leagueId, true);
        this.validateLeagueAdmin(userId, league.administrator_id);

        const isLeagueSuspendedMember = await LeagueMember.findOne({
            where : { league_id : leagueId, player_id : playerId, is_suspended : true }
        });
        if(!isLeagueSuspendedMember) throw new NotFoundError(leagueErrors.PLAYER_NOT_IN_SUSPENDED_LIST);

        isLeagueSuspendedMember.is_suspended = false;

        await isLeagueSuspendedMember.save();
    }

    /**
     * Retrieve list of suspended players
     * @param {number} leagueId
     * @param {number} userId id of person making request (must be league admin)
     */
    static async suspendedPlayersList(leagueId, userId) {
        const league = await this.loadLeague(leagueId, true);
        this.validateLeagueAdmin(userId, league.administrator_id);

        const suspended = await LeagueMember.findAll({
            where : { league_id : leagueId, is_suspended : true },
            raw : true,
            include : {
                association : 'player',
                attributes : []
            },
            attributes : ['player.id', 'player.username', 'player.full_name']
        });

        return suspended;
    }

    /**
     * Retrieve list of a player's leagues
     * @param {number} playerId
     */
    static async getPlayerLeagues(playerId) {
        const { current } = await GameweekService.getGameweekState();

        const query = playerLeaguesQuery(playerId, current?.id || 0);

        const leagues = await sequelize.query(query, { type : QueryTypes.SELECT });

        return leagues;
    }

    /**
     * Retrieve list of a player's leagues, similar to above but this does not include standings
     * @param {number} playerId
     */
    static async listPlayerLeagues(playerId) {
        const leagues = await LeagueMember.findAll({
            where : { player_id : playerId, is_suspended : false },
            attributes : [[col('League.id'), 'id'], [col('League.name'), 'name'], [col('League.type'), 'type']],
            include : {
                model : League,
                attributes : []
            },
            raw : true
        });

        return leagues;
    }

    /**
     * Retrieve a league's standing
     * @param {number} leagueId
     * @param {number} page
     */
    static async leagueStanding(leagueId, page) {
        const { current } = await GameweekService.getGameweekState();

        const { id, name, administrator_id, starting_gameweek, type } = await this.loadLeague(leagueId, true);

        const memberCount = await LeagueMember.count({ where : { league_id : leagueId, is_suspended : false }});

        const limit = 20;

        const pages = Math.ceil(memberCount / limit);

        if(page > pages) throw new ServiceError(leagueErrors.INVALID_PAGE);

        const next_page = page + 1 > pages ? null : page + 1;

        const skip = (page - 1) * limit;

        const query = leagueStandingQuery(leagueId, current?.id || 0, skip, limit, starting_gameweek);

        const standing = await sequelize.query(query, { type : QueryTypes.SELECT });

        return { id, name, administrator_id, starting_gameweek, type, standing, next_page, page };
    }

    /**
     * Retrieve league details
     * @param {number} leagueId
     */
    static async getLeagueDetails(leagueId) {
        const league = await this.loadLeague(leagueId, true);
        const members = await LeagueMember.findAll({
            where : { league_id : league.id, is_suspended : false },
            raw : true,
            attributes : [[col('player.username'), 'name'], [col('player.id'), 'id']],
            include : {
                model : User,
                as : 'player',
                attributes : []
            }
        });
        const suspended_members = await LeagueMember.findAll({
            where : { league_id : league.id, is_suspended : true },
            raw : true,
            attributes : [[col('player.username'), 'name'], [col('player.id'), 'id']],
            include : {
                model : User,
                as : 'player',
                attributes : []
            }
        });

        league.members = members;
        league.suspended_members = suspended_members;

        return league;
    }

    /**
     * Update the admin of a league
     * @param {number} playerId (id of player to make admin)
     * @param {number} leagueId
     * @param {number} userId id of person making request (must be league admin)
     */
    static async updateAdmin(playerId, leagueId, userId) {
        const league = await this.loadLeague(leagueId);
        this.validateLeagueAdmin(userId, league.administrator_id);

        const isLeagueMember = await LeagueMember.findOne({
            where : { league_id : leagueId, player_id : playerId }
        });
        if(!isLeagueMember || isLeagueMember.is_suspended) throw new NotFoundError(leagueErrors.PLAYER_NOT_IN_LEAGUE);

        league.administrator_id = playerId;

        await league.save();
    }

    /**
     * Load a league by its id
     * @param {number} id
     * @param {boolean} rawData
     * @returns {object} League details
     */
    static async loadLeague(id, rawData = false) {
        const cache = new CacheService('league');
        if(rawData) {
            const cached = cache.load(id);
            if(cached) return cached;
        }

        const league = await League.findByPk(id, { raw : rawData });
        if(!league) throw new NotFoundError(leagueErrors.LEAGUE_NOT_FOUND);

        if(rawData) cache.insert(id, league);
        return league;
    }

    /**
     * Ensures a user is the admin of a league
     * @param {number} userId
     * @param {number} adminId
     * @throws ForbiddenError
     */
    static validateLeagueAdmin(userId, adminId) {
        if(userId !== adminId){
            throw new ForbiddenError(leagueErrors.LEAGUE_PERMISSION_ERROR);
        }
    }

    /**
     * Method to make sure a user has not joined maximum number of leagues allowed
     * @param {number} userId
     * @throws ServiceError
     */
    static async validateUserLeaguesCount(userId) {
        const count = await LeagueMember.count({ where : { player_id : userId }});
        if(count >= MAX_LEAGUES_PER_PLAYER) throw new ServiceError(leagueErrors.LEAGUES_MAXED);
    }

    /**
     * Generate code for a league
     * @returns {string} Generated league code
     */
    static generateLeagueCode() {
        const nanoid = customAlphabet(alphabet, LEAGUE_CODE_LENGTH);
        return nanoid();
    }
}

module.exports = LeagueService;