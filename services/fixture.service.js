const Fixture = require('../models/fixture.model');
const Team = require('../models/team.model');
const { NotFoundError, ServiceError } = require('../errors/http_errors');
const { fixtureErrors, teamErrors } = require('../errors');
const { Op } = require('sequelize');
const GameweekService = require('./gameweek.service');
const CacheService = require('./cache.service');

const { FIXTURE_NOT_FOUND } = fixtureErrors;
const { UNIQUE_IDS } = teamErrors;

class FixtureService {
    static async createFixture(home_team_id, away_team_id, date_time, gameweek_id) {
        if(home_team_id === away_team_id) throw new ServiceError(UNIQUE_IDS);

        const fixture = await Fixture.create({home_team_id, away_team_id, date_time, gameweek_id});

        return fixture;
    }

    static async deleteFixture(id) {
        const fixtureExists = await Fixture.findByPk(id);
        if(!fixtureExists) throw new NotFoundError(FIXTURE_NOT_FOUND);

        await Fixture.destroy({ where: { id }});

        return null;
    }

    static async updateFixture(fixture) {
        const fixtureExists = await Fixture.findByPk(fixture.id);
        if(!fixtureExists) throw new NotFoundError(FIXTURE_NOT_FOUND);

        if(fixture.home_team_id && (fixture.home_team_id === fixture.away_team_id)){
            throw new ServiceError(UNIQUE_IDS);
        }

        await fixtureExists.update(fixture);

        return { ...fixture, gameweek_id : fixture.gameweek_id || fixtureExists.gameweek_id} ;
    }

    static async getFixtures(gameweek_id) {
        const fixtures = await Fixture.findAll({
            where: { gameweek_id: gameweek_id },
            include : [{
                model: Team,
                as: 'home_team',
                attributes: ['id', 'name', 'short_name', 'jersey', 'color_code']
            },
            {
                model: Team,
                as: 'away_team',
                attributes: ['id', 'name', 'short_name', 'jersey', 'color_code']
            }
            ],
            raw : true,
            nest : true
        });

        return fixtures;
    }

    static async getRecentFixtures(teamId, last) {
        const teamRecentFixtures = await Fixture.findAll({
            where: {
                [Op.or] : [{ home_team_id: teamId }, { away_team_id: teamId }],
                is_complete : true
            },
            attributes : ['id', 'date_time', 'home_score', 'away_score'],
            order: [['id', 'DESC']],
            limit: last,
            include : [{
                model: Team,
                as: 'home_team',
                attributes: ['id' ,'name', 'short_name', 'jersey', 'color_code']
            },
            {
                model: Team,
                as: 'away_team',
                attributes: ['id','name', 'short_name', 'jersey', 'color_code']
            }
            ],
            raw : true,
            nest : true
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
            attributes : ['id', 'date_time', 'home_score', 'away_score'],
            order: [['id', 'DESC']],
            limit: 10,
            include : [{
                model: Team,
                as: 'home_team',
                attributes: ['id', 'name', 'short_name', 'jersey', 'color_code']
            },
            {
                model: Team,
                as: 'away_team',
                attributes: ['id', 'name', 'short_name', 'jersey', 'color_code']
            }
            ],
            raw : true,
            nest : true
        });
        return teamsHeadToHeadFixtures;
    }

    /**
     * Get id of all the fixtures in current gameweek
     * @returns {array} the ids of fixtures
     */
    static async getCurrentFixturesIds() {
        const { next } = await GameweekService.getGameweekState();
        if(!next) return [];

        const cache = new CacheService('fixture');
        const key = 'current_ids';
        const cached = cache.load(key);
        if(cached) return cached;

        const fixtures = await Fixture.findAll({ where : { gameweek_id : next.id }, attributes : ['id'] });

        const ids = fixtures.map(fix => fix.id);

        cache.insert(key, ids);
        return ids;
    }
}

module.exports = FixtureService;