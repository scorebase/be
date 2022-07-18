const Fixture = require('../models/fixture.model');
const GameWeek = require('../models/gameweek.model');
const Team = require('../models/team.model');
const { NotFoundError, ServiceError } = require('../errors/http_errors');
const { fixtureErrors, gameweekErrors, teamErrors } = require('../errors');
const { Op } = require('sequelize');

const { FIXTURE_NOT_FOUND, FIXTURES_NOT_FOUND } = fixtureErrors;
const { GAMEWEEK_NOT_FOUND } = gameweekErrors;
const { HOME_TEAM_NOT_FOUND, AWAY_TEAM_NOT_FOUND, UNIQUE_IDS } = teamErrors;

class FixtureService {
    static async createFixture(home_team_id, away_team_id, date_time, gameweek_id) {
        if(home_team_id === away_team_id) throw new ServiceError(UNIQUE_IDS);

        const homeTeamId = await Team.findByPk(home_team_id);
        if(!homeTeamId) throw new NotFoundError(HOME_TEAM_NOT_FOUND);

        const awayTeamId = await Team.findByPk(away_team_id);
        if(!awayTeamId) throw new NotFoundError(AWAY_TEAM_NOT_FOUND);

        const gameweekExists = await GameWeek.findByPk(gameweek_id);
        if (!gameweekExists) throw new NotFoundError(GAMEWEEK_NOT_FOUND);

        const create_date_time = new Date(date_time);

        date_time = create_date_time;

        const fixture = await Fixture.create({home_team_id, away_team_id, date_time, gameweek_id});

        return fixture;
    }

    static async deleteFixture(id) {
        const fixtureExists = await Fixture.findByPk(id);
        if(!fixtureExists) throw new NotFoundError(FIXTURE_NOT_FOUND);

        await Fixture.destroy({ where: { id : id }});

        return null;
    }

    static async updateFixture(fixture) {
        const fixtureExists = await Fixture.findByPk(fixture.id);
        if(!fixtureExists) throw new NotFoundError(FIXTURE_NOT_FOUND);

        if(fixture.home_team_id === fixture.away_team_id) throw new ServiceError(UNIQUE_IDS);
    
        const homeTeamId = await Team.findByPk(fixture.home_team_id);
        if(!homeTeamId) throw new NotFoundError(HOME_TEAM_NOT_FOUND);
    
        const awayTeamId = await Team.findByPk(fixture.away_team_id);
        if(!awayTeamId) throw new NotFoundError(AWAY_TEAM_NOT_FOUND);
    
        const create_date_time = new Date(fixture.date_time);
    
        fixture.date_time = create_date_time;
    
        const updatedFixture = await Fixture.update(fixture, {where: {id: fixture.id}});
    
        return updatedFixture;
    }

    static async getFixtures(gameweek_id) {
        const gameweekExists = await GameWeek.findByPk(gameweek_id);
        if (!gameweekExists) throw new NotFoundError(GAMEWEEK_NOT_FOUND);

        const fixtures = await Fixture.findAll({
            where: { gameweek_id: gameweek_id },
            include : [{
                model: Team,
                as: 'home_team',
                attributes: ['name', 'jersey']
            },
            {
                model: Team,
                as: 'away_team',
                attributes: ['name', 'jersey']
            }
            ]
        });
        if (fixtures.length === 0) throw new NotFoundError(FIXTURES_NOT_FOUND);

        return fixtures;
    }

    static async getRecentFixtures(teamId, last) {
        const teamRecentFixtures = await Fixture.findAll({
            where: {
                [Op.or] : [{ home_team_id: teamId }, { away_team_id: teamId }],
                is_complete : true
            },
            order: [['id', 'DESC']],
            limit: last,
            include : [{
                model: Team,
                as: 'home_team',
                attributes: ['name', 'jersey']
            },
            {
                model: Team,
                as: 'away_team',
                attributes: ['name', 'jersey']
            }
            ]
        });

        return teamRecentFixtures;
    }

    static async getHeadToHeadFixtures(teamOneId, teamTwoId) {
        if(teamOneId === teamTwoId) throw new ServiceError(UNIQUE_IDS);

        const teamsHeadToHeadFixtures = await Fixture.findAll({
            where: {
                [Op.or] : [
                    { [Op.and] : [{ home_team_id: teamOneId }, { away_team_id: teamTwoId }] },
                    { [Op.and] : [{ home_team_id: teamTwoId }, { away_team_id: teamOneId }] }
                ],
                is_complete : true
            },
            order: [['id', 'DESC']],
            limit: 10,
            include : [{
                model: Team,
                as: 'home_team',
                attributes: ['name', 'jersey']
            },
            {
                model: Team,
                as: 'away_team',
                attributes: ['name', 'jersey']
            }
            ]
        });
        return teamsHeadToHeadFixtures;
    }
}

module.exports = FixtureService;