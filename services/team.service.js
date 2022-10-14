const { Op } = require('sequelize');
const Team = require('../models/team.model');
const { NotFoundError, ServiceError } = require('../errors/http_errors');

const { teamErrors } = require('../errors/index');

const {
    TEAM_NAME_EXISTS,
    TEAM_SHORTNAME_EXISTS,
    TEAM_JERSEY_EXISTS,
    TEAM_NOT_FOUND
} = teamErrors;

class teamService {
    /**
     *
     * @param {string} name the team's name
     * @param {string} short_name team's short name like ARS for arsenal
     * @param {string} jersey image url for the team's jersey
     * @param {string} color_code Color code for team
     * @return {object} team object with the created team name, short_name, jersey
     */

    static async createATeam(name, short_name, jersey, color_code) {
        const teamExists = await Team.findOne({ where: { [Op.or]: [{ name }, { short_name }, { jersey }]}});

        if(teamExists){
            if(teamExists.name === name){
                // similar name
                throw new ServiceError(TEAM_NAME_EXISTS);
            }else if(teamExists.short_name === short_name){
                // similar short_name
                throw new ServiceError(TEAM_SHORTNAME_EXISTS);
            }else{
                // similar jersey url
                throw new ServiceError(TEAM_JERSEY_EXISTS);
            }
        }

        const team = await Team.create({
            name, short_name, jersey, color_code
        });

        return team;
    }

    /**
     *
     * @param {number} teamId the team's id
     * @return {object} team object with the created team name, short_name, jersey
     */
    static async getATeam(teamId) {
        const team = await Team.findByPk(teamId);

        if(!team){
            throw new NotFoundError(TEAM_NOT_FOUND);
        }

        return team;
    }

    /**
     * @param {object} team Team update object
     * @return {object} team object with the created team name, short_name, jersey
     */

    static async updateATeam(team) {
        const teamExists = await Team.findByPk(team.id);

        if(!teamExists){
            throw new NotFoundError(TEAM_NOT_FOUND);
        }

        const teamUpdatedValues = await Team.findOne({
            where: {
                [Op.or]: [
                    { name: team.name },
                    { short_name: team.short_name },
                    { jersey: team.jersey }
                ],
                id: {
                    [Op.ne] : team.id
                }
            }});

        if(teamUpdatedValues){
            if(teamUpdatedValues.name === team.name){
                // similar name
                throw new ServiceError(TEAM_NAME_EXISTS);
            }else if(teamUpdatedValues.short_name === team.short_name){
                // similar short_name
                throw new ServiceError(TEAM_SHORTNAME_EXISTS);
            }else{
                // similar jersey url
                throw new ServiceError(TEAM_JERSEY_EXISTS);
            }
        }

        const updatedTeam = await Team.update(team, { where: { id : team.id }});
        return updatedTeam;
    }

    /**
     *
     * @param {number} teamId the team's id
     * @return {null} null
     */

    static async deleteATeam(teamId) {
        const teamExists = await Team.findByPk(teamId);

        if(!teamExists){
            throw new  NotFoundError(TEAM_NOT_FOUND);
        }

        await Team.destroy({ where: { id : teamId }});

        return null;
    }

    static async getAllTeams() {
        const teams = await Team.findAll({
            attributes : {
                exclude : ['createdAt', 'updatedAt']
            }
        });

        return teams;
    }

}

module.exports = teamService;

