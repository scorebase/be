const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');
const joi = require('joi');

const server = require('../..');
const { TOKEN_HEADER } = require('../../helpers/constants');
const { fixtureErrors, teamErrors, gameweekErrors } = require('../../errors');
const { fixtureMessages } = require('../../helpers/messages');
const AuthService = require('../../services/auth.service');

const Fixture = require('../../models/fixture.model');
const Team = require('../../models/team.model');
const GameWeek = require('../../models/gameweek.model');
const Season = require('../../models/season.model');
const User = require('../../models/user.model');

const users = require('../helpers/users.mock');
const fixtures = require('../helpers/fixtures.mock');
const teams = require('../helpers/teams.mock');
const seasons = require('../helpers/seasons.mock')
const gameweeks = require('../helpers/gamweeks.mock');

chai.use(chaiHttp);

before(async () => {
    await User.sync({ force: true });
    await Team.sync({ force: true });
    await Season.sync({ force: true });
    await GameWeek.sync({ force: true });
    await Fixture.sync({ force: true });
    await User.create(users[0]);
    await Team.create(teams[0]);
    await Team.create(teams[1]);
    await Team.create(teams[2]);
    await Team.create(teams[3]);
    await Season.create(seasons[0]);
    await GameWeek.create(gameweeks[0]);
    await Fixture.create(fixtures[0]);
});

describe('POST /fixture', () => {
    it('It should create a fixture if all fields are valid', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/fixture')
        .set(TOKEN_HEADER, token)
        .send(fixtures[1])
        .then(res => {
            expect(res).to.have.status(200);
            const schema = joi.object({
                status: 'success',
                message: joi.string().valid(fixtureMessages.CREATION_SUCCESS),
                data: joi.object({
                    id: joi.number().integer().required(),
                    home_team_id: joi.number().integer().required(),
                    away_team_id: joi.number().integer().required(),
                    away_score: null,
                    home_score: null,
                    date_time: joi.date().required(),
                    gameweek_id: joi.number().integer().required(),
                    is_complete: joi.bool().required(),
                    updatedAt: joi.date().required(),
                    createdAt: joi.date().required()
                })
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return status code 400 with response Home Team Id and Away Team Id must be different', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/fixture')
        .set(TOKEN_HEADER, token)
        .send(fixtures[2])
        .then(res => {
            expect(res).to.have.status(400);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.UNIQUE_IDS),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return status code 404 with response Home Team doesnt exist', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/fixture')
        .set(TOKEN_HEADER, token)
        .send(fixtures[3])
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.HOME_TEAM_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return status code 404 with response Away Team doesnt exist', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/fixture')
        .set(TOKEN_HEADER, token)
        .send(fixtures[4])
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.AWAY_TEAM_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return status code 404 with response Home Team doesnt exist', (done) => {
        let token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/fixture')
        .set(TOKEN_HEADER, token)
        .send(fixtures[3])
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(teamErrors.HOME_TEAM_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });

    it('It should return status code 404 with response Gameweek doesnt exist', (done) => {
        const token = AuthService.generateToken({ id : 1 });

        chai.request(server)
        .post('/fixture')
        .set(TOKEN_HEADER, token)
        .send(fixtures[5])
        .then(res => {
            expect(res).to.have.status(404);
            const schema = joi.object({
                status: 'error',
                message: joi.string().valid(gameweekErrors.GAMEWEEK_NOT_FOUND),
                data: null
            });
            joi.assert(res.body, schema);
            done();
        })
        .catch(done);
    });
});