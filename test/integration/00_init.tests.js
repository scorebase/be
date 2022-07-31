const chai = require('chai');
const chaiHttp = require('chai-http');
const Team = require('../../models/team.model');
const User = require('../../models/user.model');
const teams = require('../helpers/teams.mock');
const users = require('../helpers/users.mock');
const sequelize = require('../../config/db');
const Season = require('../../models/season.model');
const GameWeek = require('../../models/gameweek.model');
const Fixture = require('../../models/fixture.model');
const seasons = require('../helpers/season.mock');
const gameweeks = require('../helpers/gameweek.mock');
const fixtures = require('../helpers/fixtures.mock');
const server = require('../..');
const joi = require('joi');
const logger = require('../../logger');


chai.use(chaiHttp)

before(async () => {
    logger.debug("INTEGRATION TESTS STARTED");
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', {raw: true}) //a hack for now
    await sequelize.sync({ force : true });
    await User.create(users[0]);
    await Team.create(teams[0]);
    await Team.create(teams[1]);
    await Team.create(teams[2]);
    await Team.create(teams[3]);
    await Season.create(seasons[0]);
    await GameWeek.create(gameweeks[0]);
    await Fixture.create(fixtures[0]);
});

describe("Sample Test /", () => {
    it('should return valid data for base path', () => {
        chai.request(server)
        .get('/')
        .end((err, res) => {
            const schema = joi.object({
                status : joi.string().required().equal('success'),
                data : joi.object({
                    name : joi.string().required().equal('scorebase')
                })
            });
    
            joi.assert(res.body, schema);
        })
    });
});