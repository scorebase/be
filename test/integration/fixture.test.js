const { expect } = require('chai');
const chai = require('chai');
const joi = require('joi');

const server = require('../..');
const { TOKEN_HEADER } = require('../../helpers/constants');
const { fixtureErrors, teamErrors, gameweekErrors } = require('../../errors');
const { fixtureMessages } = require('../../helpers/messages');
const AuthService = require('../../services/auth.service');

const fixtures = require('../helpers/fixtures.mock');

describe('FIXTURE TESTS', () => {
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
                    message: joi.string().valid(fixtureMessages.FIXTURE_CREATED_SUCCESS),
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
    
        it('It should return 400 with response Home Team Id and Away Team Id must be different', 
        (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .post('/fixture')
            .set(TOKEN_HEADER, token)
            .send({...fixtures[1], home_team_id: fixtures[1].away_team_id})
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
    });
    
    describe('UPDATE /fixture/:id', () => {
        it('It should successfully update a fixture', (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .put('/fixture/2')
            .set(TOKEN_HEADER, token)
            .send(fixtures[2])
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(fixtureMessages.FIXTURE_UPDATE_SUCCESS),
                    data: joi.object({
                        home_team_id: joi.number().integer().required(),
                        away_team_id: joi.number().integer().required(),
                        away_score: joi.number().integer().required(),
                        home_score: joi.number().integer().required(),
                        date_time: joi.date().required(),
                        gameweek_id: joi.number().integer().required(),
                        is_complete: joi.bool().required(),
                        id: joi.number().integer().required()
                    })
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    
        it('It should return 404 with response Fixture not found', (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .put('/fixture/1000000')
            .set(TOKEN_HEADER, token)
            .send(fixtures[2])
            .then(res => {
                expect(res).to.have.status(404);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(fixtureErrors.FIXTURE_NOT_FOUND),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    
        it('It should return 400 with response Home Team Id and Away Team Id must be different', 
        (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .put('/fixture/2')
            .set(TOKEN_HEADER, token)
            .send({...fixtures[2], home_team_id: fixtures[2].away_team_id})
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
    });
    
    describe('/GET /fixture/all/:gameweekId', () => {
        it('It should successfully get all fixtures for that gameweek', (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .get('/fixture/all/1')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(fixtureMessages.FIXTURES_FOUND_SUCCESS),
                    data: joi.array().items({
                        id: joi.number().integer().required(),
                        home_team_id: joi.number().integer().required(),
                        away_team_id: joi.number().integer().required(),
                        away_score: joi.required(),
                        home_score: joi.required(),
                        date_time: joi.date().required(),
                        gameweek_id: joi.number().integer().required(),
                        is_complete: joi.bool().required(),
                        updatedAt: joi.date().required(),
                        createdAt: joi.date().required(),
                        home_team: joi.object({
                            name: joi.string().valid(),
                            short_name: joi.string().valid(),
                            jersey: joi.string().valid()
                        }),
                        away_team: joi.object({
                            name: joi.string().valid(),
                            short_name: joi.string().valid(),
                            jersey: joi.string().valid()
                        })
                    })
                })
                joi.assert(res.body, schema)
                done();
            })
            .catch(done);
        });
    
        it('It should return status code 404 with response Gameweek not found', (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .get('/fixture/all/1000000')
            .set(TOKEN_HEADER, token)
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
    
    describe('/GET /fixture/all/headtohead?teamOne={teamOneId}&teamTwo={teamTwoId}', () => {
        it('It should successfully get last 10 head to head fixtures between the two teams', 
        (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .get('/fixture/all/headtohead?teamOne=1&teamTwo=4')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(fixtureMessages.FIXTURES_FOUND_SUCCESS),
                    data: joi.array().items({
                        id: joi.number().integer().required(),
                        home_team_id: joi.number().integer().required(),
                        away_team_id: joi.number().integer().required(),
                        away_score: joi.number().integer().required(),
                        home_score: joi.number().integer().required(),
                        date_time: joi.date().required(),
                        gameweek_id: joi.number().integer().required(),
                        is_complete: joi.bool().required(),
                        updatedAt: joi.date().required(),
                        createdAt: joi.date().required(),
                        home_team: joi.object({
                            name: joi.string().valid(),
                            short_name: joi.string().valid(),
                            jersey: joi.string().valid()
                        }),
                        away_team: joi.object({
                            name: joi.string().valid(),
                            short_name: joi.string().valid(),
                            jersey: joi.string().valid()
                        })
                    })
                })
                joi.assert(res.body, schema)
                done();
            })
            .catch(done);
        });
    });
    
    describe('/GET /fixture/all/recent/:teamId?last={last}', () => {
        it('It should successfully get last {last} fixtures of a tem', 
        (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .get('/fixture/all/recent/1?last=5')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(fixtureMessages.FIXTURES_FOUND_SUCCESS),
                    data: joi.array().items({
                        id: joi.number().integer().required(),
                        home_team_id: joi.number().integer().required(),
                        away_team_id: joi.number().integer().required(),
                        away_score: joi.number().integer().required(),
                        home_score: joi.number().integer().required(),
                        date_time: joi.date().required(),
                        gameweek_id: joi.number().integer().required(),
                        is_complete: joi.bool().required(),
                        updatedAt: joi.date().required(),
                        createdAt: joi.date().required(),
                        home_team: joi.object({
                            name: joi.string().valid(),
                            short_name: joi.string().valid(),
                            jersey: joi.string().valid()
                        }),
                        away_team: joi.object({
                            name: joi.string().valid(),
                            short_name: joi.string().valid(),
                            jersey: joi.string().valid()
                        })
                    })
                })
                joi.assert(res.body, schema)
                done();
            })
            .catch(done);
        });
    });
    
    describe('DELETE /fixture/:id', () => {
        it('It should successfully delete a fixture', (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .delete('/fixture/2')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(fixtureMessages.FIXTURE_DELETED_SUCCESS),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    
        it('It should return status code 404 with response Fixture not found', (done) => {
            let token = AuthService.generateToken({ id : 1 });
    
            chai.request(server)
            .delete('/fixture/1000000')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(404);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(fixtureErrors.FIXTURE_NOT_FOUND),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    });
})