const Season = require('../models/season.model');
const { Op } = require('sequelize');
const { NotFoundError, ServiceError } = require('../errors/http_errors');
const { seasonErrors } = require('../errors');

const { SEASON_NAME_EXISTS, SEASON_NOT_FOUND } = seasonErrors;

class SeasonService {

    /**
     * @param {string} season_name name representation for the season
     * @returns {object} newSeason season created
     */
    static async createASeason(season_name) {
        const seasonExists = await Season.findOne({ where: { season_name : season_name}});
        if(seasonExists){
            throw new ServiceError(SEASON_NAME_EXISTS);
        }

        const newSeason = await Season.create({season_name});
        return newSeason;
    }

    /**
     * @param {integer} seasonId season id as identified in the database
     * @returns {object} season searched for
     */

    static async loadSeason(seasonId) {
        const seasonExists = await Season.findByPk(seasonId);

        if(!seasonExists){
            throw new NotFoundError(SEASON_NOT_FOUND);
        }

        return seasonExists;
    }

    /**
     * @param {integer} seasonId season id as represented in the database
     * @param {string} season_name season name which is used to represent the season
     * @returns {object} updatedSeason
     */
    static async updateASeason(seasonId, season_name) {
        const seasonExists = await Season.findByPk(seasonId);
        if(!seasonExists){
            throw new NotFoundError(SEASON_NOT_FOUND);
        }

        const seasonName = await Season.findOne({
            where:
            { season_name : season_name,
                id: { [Op.ne] : seasonId }
            }});

        if(seasonName){
            throw new ServiceError(SEASON_NAME_EXISTS);
        }

        await Season.update({ season_name }, { where: { id : seasonId }});

        return null;
    }

    /**
     * @param {integer} seasonId
     * @returns {null}
     */
    static async deleteASeason(seasonId){
        const seasonExists = await Season.findByPk(seasonId);
        if(!seasonExists){
            throw new NotFoundError(SEASON_NOT_FOUND);
        }

        await Season.destroy({ where: { id: seasonId }});

        return null;
    }
};

module.exports = SeasonService;