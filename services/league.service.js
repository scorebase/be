const { customAlphabet } = require('nanoid');

const sequelize = require('../config/db');
const { leagueErrors } = require('../errors');
const { NotFoundError, ForbiddenError } = require('../errors/http_errors');
const League = require('../models/league.model');
const LeagueMember = require('../models/league_member.model');

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
        const t = await sequelize.transaction();

        try {
            const invite_code = this.generateLeagueCode();

            //TODO : check if the user has already joined maximum number of leagues allowed.

            const league = await League.create({
                name,
                invite_code,
                max_participants,
                type,
                starting_gameweek,
                administrator_id : userId
            }, { transaction : t });
    
            //auomatically add the creator to the league
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
     * Load a league by its id
     * @param {*} id
     * @returns {object} League details
     */
    static async loadLeague(id) {
        const league = await League.findByPk(id);

        if(!league) throw new NotFoundError(leagueErrors.LEAGUE_NOT_FOUND);

        return league;
    }

    /**
     * Ensures a user is the admin of a league
     * @param {number} userId
     * @param {number} adminId
     * @throws {ForbiddenError}
     */
    static validateLeagueAdmin(userId, adminId) {
        if(userId !== adminId){
            throw new ForbiddenError(leagueErrors.LEAGUE_PERMISSION_ERROR);
        };
    }
    /**
     * Generate code for a league
     * @returns {string} Generated league code
     */
    static generateLeagueCode() {
        const nanoid = customAlphabet(alphabet, 7);
        return nanoid();
    }
}

module.exports = LeagueService;