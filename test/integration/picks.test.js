const {expect} = require('chai');
const chai = require('chai');
const joi = require('joi');

const server = require('../..');
const { TOKEN_HEADER } = require('../../helpers/constants');
const { picksErrors, gameweekErrors } = require('../../errors');
const { picksMessages } = require('../../helpers/messages');
const AuthService = require('../../services/auth.service');

const picks = require('../helpers/picks.mock');
const Fixture = require('../../models/fixture.model');
const fixtures = require('../helpers/fixtures.mock');


describe('Picks Tests', () => {
    describe('POST /picks', () => {
        before(async () => {
            await Fixture.create(fixtures[3]);
        })
        it('It should return 400 with response Master pick cannot be less than one',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .post('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[4])
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.MASTER_PICK_LESS_THAN_ONE),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });

        it('It should return 400 with response Master pick cannot be greater than one',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .post('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[5])
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.MASTER_PICK_GREATER_THAN_ONE),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });

        it(`should return gameweek not found if player is making pick for 
            invalid gameweek or made more picks than fixtures`, (done) => {

            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .post('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[0])
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.INVALID_PICKS),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        })

        it('It should create a pick by gameweekId if all fields are valid',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .post('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[6])
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(picksMessages.PICK_CREATE_SUCCESS),
                    data: joi.object({
                        id: joi.number().integer().required(),
                        player_id: joi.number().integer().required(),
                        gameweek_id: joi.number().integer().required(),
                        total_points: joi.number().integer().required(),
                        close: joi.number().integer().required(),
                        exact: joi.number().integer().required(),
                        result: joi.number().integer().required(),
                        updatedAt: joi.date().required(),
                        createdAt: joi.date().required(),
                        pick_items: joi.array().items({
                            id: joi.number().integer().required(),
                            fixture_id: joi.number().integer().required(),
                            home_pick: joi.number().integer().required(),
                            away_pick: joi.number().integer().required(),
                            is_master_pick: joi.bool().required(),
                            picks_id: joi.number().integer().required(),
                            updatedAt: joi.date().required(),
                            createdAt: joi.date().required(),
                            processed: joi.boolean()
                        })
                    })
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });

        it('It should return 400 with response pick already exists', (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .post('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[0])
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.PICK_ALREADY_EXISTS),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    });

    describe('PUT /picks', () => {
        it('It should update a pick if all fields are valid', (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .put('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[3])
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(picksMessages.PICK_UPDATE_SUCCESS),
                    data: joi.object({
                        pick_items: joi.array().items({
                            fixture_id: joi.number().integer().required(),
                            home_pick: joi.number().integer().required(),
                            away_pick: joi.number().integer().required(),
                            is_master_pick: joi.bool().required()
                        })
                    })
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });

        it('It should return 400 with response Master pick cannot be less than one',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .put('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[4])
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.MASTER_PICK_LESS_THAN_ONE),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });

        it('It should return 400 with response Master pick cannot be greater than one',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .put('/picks')
            .set(TOKEN_HEADER, token)
            .send(picks[5])
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.MASTER_PICK_GREATER_THAN_ONE),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    });

    describe('GET /picks/:playerId/:gameweekId', () => {
        it('It should return a pick by playerId and gameweekId',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .get('/picks/1/1')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(200);
                const schema = joi.object({
                    status: 'success',
                    message: joi.string().valid(picksMessages.PICK_FOUND_SUCCESS),
                    data: joi.object({
                        id: joi.number().integer().required(),
                        player_id: joi.number().integer().required(),
                        total_points: joi.number().integer().required(),
                        close: joi.number().integer().required(),
                        exact: joi.number().integer().required(),
                        result: joi.number().integer().required(),
                        updatedAt: joi.date().required(),
                        player_name: joi.string().required(),
                        player_username: joi.string().required(),
                        pick_items: joi.array().items({
                            fixture_id: joi.number().integer().required(),
                            home_pick: joi.number().integer().required(),
                            away_pick: joi.number().integer().required(),
                            is_master_pick: joi.number().integer().required()
                        })
                    })
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });

        it('It should return 404 with response gameweek not found', (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .get('/picks/1/1000000')
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

        it('It should return 400 with response cannot access another user pick before deadline',
        (done) => {
            let token = AuthService.generateToken({ id : 1 });

            chai.request(server)
            .get('/picks/2/1')
            .set(TOKEN_HEADER, token)
            .then(res => {
                expect(res).to.have.status(400);
                const schema = joi.object({
                    status: 'error',
                    message: joi.string().valid(picksErrors.PICK_ACCESS_DENIED),
                    data: null
                });
                joi.assert(res.body, schema);
                done();
            })
            .catch(done);
        });
    });
})

