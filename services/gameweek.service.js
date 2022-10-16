const { Op } = require('sequelize');
const Gameweek = require('../models/gameweek.model');

const { ServiceError, NotFoundError } = require('../errors/http_errors');
const { gameweekErrors } = require('../errors/index');
const GameWeekState = require('../models/gameweek_state.model');
const sequelize = require('../config/db');
const User = require('../models/user.model');
const CacheService = require('./cache.service');
const cache = new CacheService('gw');

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
        const cached = cache.load(gameweekId);
        if(cached) return cached;
        const gameweek = await Gameweek.findByPk(gameweekId, {attributes : ['id', 'title', 'deadline'], raw : true });
        cache.insert(gameweekId);
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

    /**
     * Fetch all gameweeks
     * @returns array of all gameweeks
     */
    static async getAllGameweeks() {
        const gameweeks = await Gameweek.findAll({ attributes : ['id', 'title'], raw : true});

        return gameweeks;
    }

    /**
     * Fetches the state of the game i.e current gameweek and next gameweek
     * @returns {array} the game states
     */
    static async getGameweekState() {
        const cached = cache.load('state');
        if(cached) return cached;
        const states = await GameWeekState.findAll({
            include : {
                model : Gameweek,
                as : 'gameweek',
                attributes : ['id', 'deadline', 'title']
            }
        });
        const season_total_players = await User.count();

        const data = { current : null, next : null };
        states.forEach(s => {
            data[s.state] = s.gameweek?.toJSON() || null;
        });
        data.total_players = season_total_players;

        cache.insert('state', data);
        return data;
    }

    /**
     * updates the state of the game i.e current gameweek and next gameweek
     * @param {int|null} currentGw The current gameweek
     * @param {int|null} nextGw The next gameweek
     * @returns {void}
     */
    static async updateGameweekState(currentGw, nextGw) {
        const t = await sequelize.transaction();

        try {
            await GameWeekState.destroy({ where : {}, transaction : t });

            await GameWeekState.bulkCreate([
                { state : 'current', id : currentGw},
                { state : 'next', id : nextGw }
            ], {
                transaction : t
            });

            await t.commit();
        } catch(error) {
            await t.rollback();
            throw error;
        }
    }
}

module.exports = GameweekService;