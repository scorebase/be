const { customAlphabet } = require('nanoid');

const sequelize = require('../config/db');
const League = require('../models/league.model');
const LeagueMember = require('../models/league_member.model');

class LeagueService {
    /**
     *
     * @param {integer} userId
     * @param {string} name League name
     * @param {integer} max_participants
     * @param {string} type League type
     * @param {int} starting_gameweek
     * @returns
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

    static generateLeagueCode() {
        const alphabet = '123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const nanoid = customAlphabet(alphabet, 7);
        return nanoid();
    }
}

module.exports = LeagueService;