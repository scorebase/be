const { Op } = require('sequelize');
const Gameweek = require('../models/gameweek.model');
const Season = require('../models/season.model');
const { ServiceError, NotFoundError } = require('../errors/http_errors');
const { gameweekErrors, seasonErrors } = require('../errors/index');
const {
    GAMEWEEK_NOT_FOUND,
    GAMEWEEK_TITLE_EXISTS,
    GAMEWEEK_DEADLINE_ERROR
} = gameweekErrors;

const {
    SEASON_NOT_FOUND
} = seasonErrors;

class GameweekService {

    /**
     * @param {date} deadline deadline for user to predict a fixture in a gameweek;
     * @param {string} title gameweek title
     * @param {integer} seasonId season id to which the gameweek belongs in.
     * @returns {object} created gameweek
     */
    static async createGameweek(deadline, title, seasonId) {
        const seasonExists = await Season.findByPk(seasonId);
        if(!seasonExists){
            throw new NotFoundError(SEASON_NOT_FOUND);
        }

        const gameweekExists = await Gameweek.findOne({ where:
        {
            [Op.and] : [{ title: title}, {season_id : seasonId }]
        }});
        if(gameweekExists){
            throw new ServiceError(GAMEWEEK_TITLE_EXISTS);
        }

        const today = new Date(Date.now());
        const deadlineDate = new Date(deadline);

        if(today.getTime() > deadlineDate.getTime()){
            throw new ServiceError(GAMEWEEK_DEADLINE_ERROR);
        }

        const gameweek = await Gameweek.create({ deadline: deadlineDate, title, season_id: seasonId });
        
        return gameweek;
    }

    /**
     * @param {integer} gameweekId id of the requested gameweek
     * @returns {object} data containing requested gameweek
     */
    static async loadGameweek(gameweekId) {
        const gameweek = await Gameweek.findByPk(gameweekId);
        if(!gameweek){
            throw new NotFoundError(GAMEWEEK_NOT_FOUND);
        }

        return gameweek;
    }

    /**
     * @param {Integer} gameweekId The requested gameweek
     * @param {Date} deadline gameweek deadline
     * @param {String} title gameweek title
     * @param {Integer} seasonId season id of the gameweek
     * @returns {Object} updatedGameweek
     */
    static async updateGameweek(gameweekId, deadline, title, seasonId) {
        const seasonExists = await Season.findByPk(seasonId);
        if(!seasonExists){
            throw new NotFoundError(SEASON_NOT_FOUND);
        }

        const gameweekExists = await Gameweek.findByPk(gameweekId);
        if(!gameweekExists){
            throw new NotFoundError(GAMEWEEK_NOT_FOUND);
        }

        console.log(typeof(gameweekId));
        const gameweekTitleExists = await Gameweek.findOne({ where:
            {
                id: {
                    [Op.ne] : gameweekId
                },
                [Op.and] : [{ title: title}, {season_id : seasonId }]
            }});

        if(gameweekTitleExists){
            throw new ServiceError(GAMEWEEK_TITLE_EXISTS);
        }

        const today = new Date(Date.now());
        const deadlineDate = new Date(deadline);

        if(today.getTime() > deadlineDate.getTime()){
            throw new ServiceError(GAMEWEEK_DEADLINE_ERROR);
        }

        const updatedGameweek = { title, deadline: deadlineDate, season_id: seasonId };

        await Gameweek.update(updatedGameweek, { where: { id: gameweekId }});

        updatedGameweek.id = gameweekId;

        return updatedGameweek;
    }

    /**
     * @param {Integer} gameweekId id of the gameweek requested
     * @returns {null}
     */
    static async deleteGameweek(gameweekId){
        const gameweekExists = await Gameweek.findByPk(gameweekId);

        if(!gameweekExists){
            throw new NotFoundError(GAMEWEEK_NOT_FOUND);
        }

        await Gameweek.destroy({ where: { id: gameweekId }});

        return null;
    }
};

module.exports = GameweekService;