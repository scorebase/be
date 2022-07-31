const { Op } = require('sequelize');
const Gameweek = require('../models/gameweek.model');
const { ServiceError, NotFoundError } = require('../errors/http_errors');
const { gameweekErrors } = require('../errors/index');
const {
    GAMEWEEK_NOT_FOUND,
    GAMEWEEK_TITLE_EXISTS,
    GAMEWEEK_DEADLINE_ERROR
} = gameweekErrors;

class GameweekService {

    /**
     * @param {date} deadline deadline for user to predict a fixture in a gameweek;
     * @param {string} title gameweek title
     * @returns {object} created gameweek
     */
    static async createGameweek(deadline, title) {
        const gameweekExists = await Gameweek.findOne({ where:
            { title: title }
        });
        if(gameweekExists){
            throw new ServiceError(GAMEWEEK_TITLE_EXISTS);
        }

        const today = new Date(Date.now());
        const deadlineDate = new Date(deadline);

        if(today.getTime() > deadlineDate.getTime()){
            throw new ServiceError(GAMEWEEK_DEADLINE_ERROR);
        }

        const gameweek = await Gameweek.create({ deadline: deadlineDate, title });
        
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
     * @returns {Object} updatedGameweek
     */
    static async updateGameweek(gameweekId, deadline, title) {

        const gameweekExists = await Gameweek.findByPk(gameweekId);
        if(!gameweekExists){
            throw new NotFoundError(GAMEWEEK_NOT_FOUND);
        }

        const gameweekTitleExists = await Gameweek.findOne({ where:
            {
                id: {
                    [Op.ne] : gameweekId
                },
                title: title
            }});

        if(gameweekTitleExists){
            throw new ServiceError(GAMEWEEK_TITLE_EXISTS);
        }

        const today = new Date(Date.now());
        const deadlineDate = new Date(deadline);

        if(today.getTime() > deadlineDate.getTime()){
            throw new ServiceError(GAMEWEEK_DEADLINE_ERROR);
        }

        const updatedGameweek = { title, deadline: deadlineDate };

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